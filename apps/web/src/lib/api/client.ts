import type { Role, SupportedLanguage } from "@app/shared";
import { useAuth, type UserProfile } from "@/stores/auth.store";
import { ApiError, type ValidationErrorDetail } from "./errors";

export interface ApiSuccessResponse<T, M = Record<string, unknown>> {
  data: T;
  meta?: M;
}

interface ApiErrorPayload {
  error?: {
    code?: string;
    message?: string;
    requestId?: string;
    details?: ValidationErrorDetail[];
  };
}

export interface ApiUserDto {
  id: string;
  name: string;
  email: string;
  role: Role;
  language: SupportedLanguage;
  avatar_key?: string | null;
  restaurant_id: string | null;
  restaurant?: {
    id: string;
    name: string;
  } | null;
}

export function mapApiUserToProfile(dto: ApiUserDto): UserProfile {
  return {
    id: dto.id,
    name: dto.name,
    email: dto.email,
    role: dto.role,
    language: dto.language || "en",
    avatar_key: dto.avatar_key ?? null,
    restaurantId: dto.restaurant_id ?? null,
    restaurant: dto.restaurant ?? null,
  };
}

const API_BASE = "/api/v1";

// Single-flight lock so concurrent 401 responses or StrictMode mounts only trigger one refresh call
let refreshPromise: Promise<string | null> | null = null;

function redirectToLogin(): void {
  useAuth.getState().clearAuth();
  if (
    typeof window !== "undefined" &&
    !window.location.pathname.startsWith("/login")
  ) {
    window.location.replace("/login");
  }
}

async function parseErrorResponse(res: Response): Promise<ApiError> {
  const retryAfterRaw = res.headers.get("Retry-After");
  const retryAfterSeconds = retryAfterRaw
    ? Number.parseInt(retryAfterRaw, 10)
    : undefined;

  let payload: ApiErrorPayload | null = null;
  try {
    payload = (await res.json()) as ApiErrorPayload;
  } catch {
    payload = null;
  }

  const code =
    payload?.error?.code ||
    (res.status === 401
      ? "UNAUTHENTICATED"
      : res.status === 403
      ? "FORBIDDEN"
      : res.status === 404
      ? "NOT_FOUND"
      : res.status === 429
      ? "RATE_LIMITED"
      : "INTERNAL_SERVER_ERROR");

  const message =
    payload?.error?.message || res.statusText || "Request failed";

  return new ApiError(code, res.status, message, {
    requestId: payload?.error?.requestId,
    details: payload?.error?.details,
    retryAfterSeconds:
      retryAfterSeconds && !Number.isNaN(retryAfterSeconds)
        ? retryAfterSeconds
        : undefined,
  });
}

/**
 * Calls POST /api/v1/auth/refresh at most once concurrently.
 * Updates Zustand access token on success, or clears auth and redirects on failure if requested.
 */
export async function refreshAccessToken(options?: {
  redirectOnFail?: boolean;
}): Promise<string | null> {
  if (refreshPromise) {
    return refreshPromise;
  }

  const redirectOnFail = options?.redirectOnFail ?? true;

  refreshPromise = (async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/refresh`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        if (redirectOnFail) {
          redirectToLogin();
        } else {
          useAuth.getState().clearAuth();
        }
        return null;
      }

      const json = (await res.json()) as ApiSuccessResponse<{
        accessToken?: string;
      }>;
      const newAccessToken = json.data?.accessToken ?? null;

      if (!newAccessToken) {
        if (redirectOnFail) {
          redirectToLogin();
        } else {
          useAuth.getState().clearAuth();
        }
        return null;
      }

      useAuth.getState().setAccessToken(newAccessToken);
      return newAccessToken;
    } catch {
      if (redirectOnFail) {
        redirectToLogin();
      }
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export interface ApiFetchOptions extends RequestInit {
  /** Skip adding Authorization header and skip auto-refresh (used for login/refresh) */
  skipAuthRefresh?: boolean;
  /** Explicit bearer token override (used during session restore before user state completes) */
  tokenOverride?: string | null;
}

/**
 * Core fetch wrapper communicating through Next.js same-origin rewrite (/api/v1/*).
 * Injects in-memory Zustand access token, retries once after refreshing on 401.
 */
export async function apiFetch<T, M = Record<string, unknown>>(
  path: string,
  options: ApiFetchOptions = {},
  _hasRetried = false
): Promise<ApiSuccessResponse<T, M>> {
  const { skipAuthRefresh = false, tokenOverride, headers, body, ...rest } = options;

  const requestHeaders = new Headers(headers);
  if (body !== undefined && !(body instanceof FormData) && !requestHeaders.has("Content-Type")) {
    requestHeaders.set("Content-Type", "application/json");
  }

  if (!skipAuthRefresh) {
    const token = tokenOverride ?? useAuth.getState().accessToken;
    if (token && !requestHeaders.has("Authorization")) {
      requestHeaders.set("Authorization", `Bearer ${token}`);
    }
  }

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      ...rest,
      body,
      headers: requestHeaders,
      credentials: "include",
    });
  } catch {
    throw new ApiError("NETWORK_ERROR", 0, "Network error while contacting API");
  }

  if (res.status === 401 && !skipAuthRefresh) {
    if (_hasRetried) {
      redirectToLogin();
      throw await parseErrorResponse(res);
    }

    const newAccessToken = await refreshAccessToken({ redirectOnFail: true });
    if (!newAccessToken) {
      throw await parseErrorResponse(res);
    }

    return apiFetch<T, M>(
      path,
      {
        ...options,
        tokenOverride: newAccessToken,
      },
      true
    );
  }

  if (!res.ok) {
    throw await parseErrorResponse(res);
  }

  if (res.status === 204) {
    return { data: undefined as T };
  }

  const json = (await res.json()) as ApiSuccessResponse<T, M>;
  return json;
}
