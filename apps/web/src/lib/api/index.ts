import type {
  Order,
  OrderStatus,
  OrderEvent,
  PaymentStatus,
  MenuItem,
  MenuCategory,
  MenuTranslation,
  Restaurant,
  User,
  AnalyticsSummary,
  SupportedLanguage,
} from "@app/shared";
import { useAuth, type UserProfile } from "@/stores/auth.store";
import {
  apiFetch,
  refreshAccessToken,
  mapApiUserToProfile,
  type ApiUserDto,
} from "./client";
import type {
  GetOrdersParams,
  PaginatedResponse,
  MenuResponse,
  LoginCredentials,
  LoginResult,
} from "./types";

export * from "./types";
export * from "./errors";
export { refreshAccessToken, mapApiUserToProfile };

// ==========================================
// Response Normalization Helpers
// ==========================================

interface RawOrderEvent extends Omit<OrderEvent, "order_id" | "by_user_id"> {
  order_id?: string;
  by_user_id?: string | null;
  by_user?: {
    id: string;
    name: string;
    role: string;
  } | null;
}

interface RawOrder
  extends Omit<
    Order,
    | "restaurant_id"
    | "customer_id"
    | "payment_method"
    | "payment_status"
    | "subtotal"
    | "delivery_fee"
    | "total"
    | "address"
    | "events"
  > {
  restaurant_id: string;
  customer_id?: string;
  payment_method?: Order["payment_method"];
  payment_status?: Order["payment_status"];
  subtotal?: number;
  delivery_fee?: number;
  total?: number;
  address?: string | null;
  events?: RawOrderEvent[];
}

function normalizeOrder(raw: RawOrder): Order {
  return {
    ...raw,
    customer_id: raw.customer_id ?? raw.customer?.id ?? "",
    payment_method: raw.payment_method ?? "cod",
    payment_status: raw.payment_status ?? "pending",
    subtotal: raw.subtotal ?? 0,
    delivery_fee: raw.delivery_fee ?? 0,
    // For rider role, backend returns cash_to_collect (for COD) instead of total
    total: raw.total ?? raw.cash_to_collect ?? 0,
    address: raw.address ?? null,
    events: raw.events?.map((evt) => ({
      id: evt.id,
      order_id: evt.order_id ?? raw.id,
      status: evt.status,
      by_user_id: evt.by_user_id ?? evt.by_user?.id ?? null,
      by_user_name: evt.by_user_name ?? evt.by_user?.name ?? null,
      note: evt.note ?? null,
      created_at: evt.created_at,
    })),
  };
}

function resolveEntityName(entity: {
  name?: string;
  translations?: MenuTranslation[];
}): string {
  if (entity.name) return entity.name;
  const en = entity.translations?.find((t) => t.language === "en");
  return en?.name ?? entity.translations?.[0]?.name ?? "";
}

function normalizeCategory(raw: MenuCategory): MenuCategory {
  return {
    ...raw,
    name: resolveEntityName(raw),
  };
}

function normalizeMenuItem(raw: MenuItem): MenuItem {
  return {
    ...raw,
    name: resolveEntityName(raw),
  };
}

function sanitizeTranslations(translations: MenuTranslation[] = []) {
  return translations
    .filter((t) => t.name && t.name.trim().length > 0)
    .map((t) => ({
      language: t.language,
      name: t.name.trim(),
      description: t.description ?? null,
      aliases: Array.isArray(t.aliases) ? t.aliases : [],
    }));
}

function buildDateRangeQuery(dateStr?: string): {
  dateFrom?: string;
  dateTo?: string;
} {
  if (!dateStr || dateStr === "all") return {};

  const now = new Date();
  if (dateStr === "today") {
    const start = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      0,
      0,
      0,
      0
    );
    const end = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      23,
      59,
      59,
      999
    );
    return {
      dateFrom: start.toISOString(),
      dateTo: end.toISOString(),
    };
  }

  const parsed = new Date(dateStr);
  if (!Number.isNaN(parsed.getTime())) {
    const start = new Date(
      parsed.getFullYear(),
      parsed.getMonth(),
      parsed.getDate(),
      0,
      0,
      0,
      0
    );
    const end = new Date(
      parsed.getFullYear(),
      parsed.getMonth(),
      parsed.getDate(),
      23,
      59,
      59,
      999
    );
    return {
      dateFrom: start.toISOString(),
      dateTo: end.toISOString(),
    };
  }

  return {};
}

// ==========================================
// Authentication & Session
// ==========================================

export async function login(credentials: LoginCredentials): Promise<LoginResult> {
  const res = await apiFetch<LoginResult>("/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
    skipAuthRefresh: true,
  });
  return res.data;
}

export async function logout(): Promise<{ message: string }> {
  const res = await apiFetch<{ message: string }>("/auth/logout", {
    method: "POST",
    skipAuthRefresh: true,
  });
  return res.data;
}

export async function getMe(tokenOverride?: string): Promise<UserProfile> {
  const res = await apiFetch<ApiUserDto>("/auth/me", {
    method: "GET",
    tokenOverride,
  });
  return mapApiUserToProfile(res.data);
}

export async function updateMyLanguage(
  language: SupportedLanguage
): Promise<{ id: string; language: SupportedLanguage }> {
  const res = await apiFetch<{ id: string; language: SupportedLanguage }>(
    "/auth/me",
    {
      method: "PATCH",
      body: JSON.stringify({ language }),
    }
  );
  return res.data;
}

// Single-flight promise for session restoration across React StrictMode mounts
let restorePromise: Promise<UserProfile | null> | null = null;

/**
 * Restores an authenticated session on page reload:
 * 1. Calls POST /auth/refresh (using same-origin httpOnly cookie)
 * 2. Calls GET /auth/me with the returned access token
 * 3. Updates the in-memory Zustand auth store
 */
export async function restoreSession(): Promise<UserProfile | null> {
  const currentState = useAuth.getState();
  if (currentState.accessToken && currentState.user) {
    return currentState.user;
  }

  if (restorePromise) {
    return restorePromise;
  }

  restorePromise = (async () => {
    try {
      const token = await refreshAccessToken({ redirectOnFail: false });
      if (!token) {
        useAuth.getState().clearAuth();
        return null;
      }

      const profile = await getMe(token);
      useAuth.getState().setAuth(token, profile);
      return profile;
    } catch {
      useAuth.getState().clearAuth();
      return null;
    } finally {
      restorePromise = null;
    }
  })();

  return restorePromise;
}

// ==========================================
// Orders API
// ==========================================

/**
 * Fetch orders with filters (status, date, payment) and pagination (page, pageSize).
 * Returns { data: Order[], meta: { page, pageSize, total, totalPages } }
 */
export async function getOrders(
  params?: GetOrdersParams
): Promise<PaginatedResponse<Order>> {
  const searchParams = new URLSearchParams();

  if (params?.status) {
    searchParams.set("status", params.status);
  }
  if (params?.payment && params.payment !== "all") {
    searchParams.set("payment_method", params.payment);
  }
  const { dateFrom, dateTo } = buildDateRangeQuery(params?.date);
  if (dateFrom) {
    searchParams.set("dateFrom", dateFrom);
  }
  if (dateTo) {
    searchParams.set("dateTo", dateTo);
  }
  if (params?.page) {
    searchParams.set("page", String(params.page));
  }
  if (params?.pageSize) {
    searchParams.set("pageSize", String(params.pageSize));
  }

  const query = searchParams.toString();
  const path = query ? `/orders?${query}` : "/orders";

  const res = await apiFetch<RawOrder[], PaginatedResponse<Order>["meta"]>(
    path
  );

  return {
    data: res.data.map(normalizeOrder),
    meta: res.meta ?? {
      page: params?.page ?? 1,
      pageSize: params?.pageSize ?? 20,
      total: res.data.length,
    },
  };
}

/**
 * Fetch a single order by ID with customer, items, timeline events, and payment proofs.
 */
export async function getOrder(id: string): Promise<Order> {
  const res = await apiFetch<RawOrder>(`/orders/${encodeURIComponent(id)}`);
  return normalizeOrder(res.data);
}

/**
 * Update an order's status enforcing transition rules on the backend.
 */
export async function updateOrderStatus(
  id: string,
  status: OrderStatus
): Promise<Order> {
  const res = await apiFetch<RawOrder>(
    `/orders/${encodeURIComponent(id)}/status`,
    {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }
  );
  return normalizeOrder(res.data);
}

/**
 * Update payment status for an order (verified or not_received).
 */
export async function updatePaymentStatus(
  id: string,
  paymentStatus: PaymentStatus
): Promise<Order> {
  const res = await apiFetch<RawOrder>(
    `/orders/${encodeURIComponent(id)}/payment`,
    {
      method: "PATCH",
      body: JSON.stringify({ payment_status: paymentStatus }),
    }
  );
  return normalizeOrder(res.data);
}

// ==========================================
// Menu API
// ==========================================

/**
 * Fetch full menu (categories and items with translations in en, ar, ur-Latn).
 */
export async function getMenu(): Promise<MenuResponse> {
  const [categoriesRes, firstItemsRes] = await Promise.all([
    apiFetch<MenuCategory[]>("/menu/categories"),
    apiFetch<MenuItem[], PaginatedResponse<MenuItem>["meta"]>(
      "/menu/items?page=1&pageSize=100"
    ),
  ]);

  let allItems = [...firstItemsRes.data];
  const totalPages = firstItemsRes.meta?.totalPages ?? 1;

  if (totalPages > 1) {
    const remainingPages = await Promise.all(
      Array.from({ length: totalPages - 1 }, (_, i) =>
        apiFetch<MenuItem[]>(
          `/menu/items?page=${i + 2}&pageSize=100`
        )
      )
    );
    for (const pageRes of remainingPages) {
      allItems = allItems.concat(pageRes.data);
    }
  }

  return {
    categories: categoriesRes.data
      .map(normalizeCategory)
      .sort((a, b) => a.sort_order - b.sort_order),
    items: allItems.map(normalizeMenuItem),
  };
}

/**
 * Update a menu item's details and/or translations.
 */
export async function updateMenuItem(
  id: string,
  data: Partial<MenuItem> & { translations?: MenuTranslation[] }
): Promise<MenuItem> {
  const payload: Record<string, unknown> = {};
  if (data.category_id !== undefined) payload.category_id = data.category_id;
  if (data.price !== undefined) payload.price = data.price;
  if (data.image_url !== undefined) payload.image_url = data.image_url;
  if (data.is_available !== undefined) payload.is_available = data.is_available;
  if (data.sort_order !== undefined) payload.sort_order = data.sort_order;
  if (data.translations !== undefined) {
    payload.translations = sanitizeTranslations(data.translations);
  }

  const res = await apiFetch<MenuItem>(`/menu/items/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  return normalizeMenuItem(res.data);
}

/**
 * Create a new menu item with category, price, image and translations.
 */
export async function createMenuItem(
  data: Omit<MenuItem, "id" | "restaurant_id"> & { id?: string }
): Promise<MenuItem> {
  const payload = {
    category_id: data.category_id,
    price: data.price,
    image_url: data.image_url ?? null,
    is_available: data.is_available ?? true,
    sort_order: data.sort_order,
    translations: sanitizeTranslations(data.translations),
  };

  const res = await apiFetch<MenuItem>("/menu/items", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return normalizeMenuItem(res.data);
}

/**
 * Delete a menu item by ID.
 */
export async function deleteMenuItem(
  id: string
): Promise<{ success: boolean }> {
  const res = await apiFetch<{ success: boolean }>(
    `/menu/items/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
    }
  );
  return res.data ?? { success: true };
}

/**
 * Create a new category with translations in en, ar, ur-Latn.
 */
export async function createCategory(data: {
  name: string;
  translations: MenuTranslation[];
}): Promise<MenuCategory> {
  const res = await apiFetch<MenuCategory>("/menu/categories", {
    method: "POST",
    body: JSON.stringify({
      translations: sanitizeTranslations(data.translations),
    }),
  });
  return normalizeCategory(res.data);
}

/**
 * Update/rename an existing category and its translations.
 */
export async function updateCategory(
  id: string,
  data: { name?: string; translations: MenuTranslation[] }
): Promise<MenuCategory> {
  const res = await apiFetch<MenuCategory>(
    `/menu/categories/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      body: JSON.stringify({
        translations: sanitizeTranslations(data.translations),
      }),
    }
  );
  return normalizeCategory(res.data);
}

/**
 * Reorder categories (move up or down) by computing updated sort_order values
 * and persisting them via PATCH /menu/categories/reorder.
 */
export async function reorderCategory(
  id: string,
  direction: "up" | "down"
): Promise<MenuCategory[]> {
  const currentRes = await apiFetch<MenuCategory[]>("/menu/categories");
  const sorted = [...currentRes.data].sort(
    (a, b) => a.sort_order - b.sort_order
  );

  const index = sorted.findIndex((c) => c.id === id);
  if (index === -1) {
    return sorted.map(normalizeCategory);
  }

  const targetIndex = direction === "up" ? index - 1 : index + 1;
  if (targetIndex < 0 || targetIndex >= sorted.length) {
    return sorted.map(normalizeCategory);
  }

  const reordered = [...sorted];
  const [moved] = reordered.splice(index, 1);
  reordered.splice(targetIndex, 0, moved);

  const items = reordered.map((cat, idx) => ({
    id: cat.id,
    sort_order: idx + 1,
  }));

  const res = await apiFetch<MenuCategory[]>("/menu/categories/reorder", {
    method: "PATCH",
    body: JSON.stringify({ items }),
  });

  return res.data
    .map(normalizeCategory)
    .sort((a, b) => a.sort_order - b.sort_order);
}

/**
 * Delete a category and its items.
 */
export async function deleteCategory(
  id: string
): Promise<{ success: boolean }> {
  const res = await apiFetch<{ success: boolean }>(
    `/menu/categories/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
    }
  );
  return res.data ?? { success: true };
}

/**
 * Toggle menu item availability on/off.
 */
export async function setItemAvailability(
  id: string,
  is_available: boolean
): Promise<MenuItem> {
  const res = await apiFetch<MenuItem>(
    `/menu/items/${encodeURIComponent(id)}/availability`,
    {
      method: "PATCH",
      body: JSON.stringify({ is_available }),
    }
  );
  return normalizeMenuItem(res.data);
}

// ==========================================
// Analytics API
// ==========================================

/**
 * Fetch analytics summary (sales, orders per hour, payment split, top items).
 */
export async function getAnalyticsSummary(
  range: "today" | "7d" | "30d" = "today"
): Promise<AnalyticsSummary> {
  const res = await apiFetch<AnalyticsSummary>(
    `/analytics/summary?range=${encodeURIComponent(range)}`
  );
  return res.data;
}

// ==========================================
// Team API
// ==========================================

/**
 * Fetch staff users for the restaurant team.
 */
export async function getTeam(): Promise<User[]> {
  const firstRes = await apiFetch<User[], PaginatedResponse<User>["meta"]>(
    "/team?page=1&pageSize=100"
  );

  let allUsers = [...firstRes.data];
  const totalPages = firstRes.meta?.totalPages ?? 1;

  if (totalPages > 1) {
    const remainingPages = await Promise.all(
      Array.from({ length: totalPages - 1 }, (_, i) =>
        apiFetch<User[]>(`/team?page=${i + 2}&pageSize=100`)
      )
    );
    for (const pageRes of remainingPages) {
      allUsers = allUsers.concat(pageRes.data);
    }
  }

  return allUsers;
}

/**
 * Add a new team member.
 */
export async function createTeamMember(
  data: Omit<User, "id" | "restaurant_id"> & { id?: string; password?: string }
): Promise<User> {
  const res = await apiFetch<User>("/team", {
    method: "POST",
    body: JSON.stringify({
      name: data.name,
      email: data.email,
      password: data.password,
      role: data.role,
      language: data.language || "en",
    }),
  });
  return res.data;
}

/**
 * Update team member details.
 */
export async function updateTeamMember(
  id: string,
  data: Partial<User> & { password?: string }
): Promise<User> {
  const payload: Record<string, unknown> = {};
  if (data.name !== undefined) payload.name = data.name;
  if (data.email !== undefined) payload.email = data.email;
  if (data.role !== undefined) payload.role = data.role;
  if (data.language !== undefined) payload.language = data.language;
  if (data.is_active !== undefined) payload.is_active = data.is_active;

  const res = await apiFetch<User>(`/team/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  return res.data;
}

/**
 * Toggle user active/inactive status.
 */
export async function toggleUserActive(
  id: string,
  is_active: boolean
): Promise<User> {
  if (!is_active) {
    const res = await apiFetch<User>(`/team/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    return res.data;
  }

  const res = await apiFetch<User>(`/team/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify({ is_active: true }),
  });
  return res.data;
}

// ==========================================
// Settings API
// ==========================================

/**
 * Fetch current restaurant settings.
 */
export async function getSettings(): Promise<Restaurant> {
  const res = await apiFetch<Restaurant>("/settings");
  return res.data;
}

/**
 * Update restaurant settings.
 */
export async function updateSettings(
  data: Partial<Restaurant>
): Promise<Restaurant> {
  const payload: Record<string, unknown> = {};
  const allowedKeys: Array<keyof Restaurant> = [
    "name",
    "timezone",
    "currency",
    "default_language",
    "open_hours",
    "delivery_fee",
    "minimum_order",
    "delivery_area",
    "payment_account",
    "payment_instructions",
    "bot_welcome_en",
    "bot_welcome_ar",
    "bot_welcome_ur",
    "bot_payment_en",
    "bot_payment_ar",
    "bot_payment_ur",
    "email_notifications",
    "daily_summary_email",
    "push_notifications",
    "sound_notifications",
    "notification_email",
  ];

  for (const key of allowedKeys) {
    if (data[key] !== undefined) {
      payload[key] = data[key];
    }
  }

  const res = await apiFetch<Restaurant>("/settings", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  return res.data;
}
