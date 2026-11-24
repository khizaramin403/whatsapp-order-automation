"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import type { Role } from "@app/shared";
import { useAuth } from "@/stores/auth.store";

// Home page for each role per Section 9.5 and prompt requirements
export const ROLE_HOME_PAGES: Record<Role, string> = {
  super_admin: "/orders",
  owner: "/orders",
  manager: "/orders",
  chef: "/kitchen",
  rider: "/delivery",
};

// Route visibility permissions per Section 9.5
export const ROUTE_ALLOWED_ROLES: Record<string, Role[]> = {
  "/orders": ["super_admin", "owner", "manager"],
  "/kitchen": ["super_admin", "owner", "manager", "chef"],
  "/delivery": ["super_admin", "owner", "manager", "rider"],
  "/menu": ["super_admin", "owner", "manager"],
  "/analytics": ["super_admin", "owner"],
  "/team": ["super_admin", "owner"],
  "/settings": ["super_admin", "owner"],
};

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
}

const emptySubscribe = () => () => {};

export function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuth((s) => s.user);
  const userRole = user?.role as Role | undefined;

  const isClient = React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  // Determine allowed roles for current pathname if not explicitly passed
  const effectiveAllowedRoles = React.useMemo(() => {
    if (allowedRoles && allowedRoles.length > 0) {
      return allowedRoles;
    }
    // Match base route (e.g. "/orders/123" -> "/orders")
    const matchedRoute = Object.keys(ROUTE_ALLOWED_ROLES).find(
      (route) => pathname === route || pathname.startsWith(route + "/")
    );
    return matchedRoute ? ROUTE_ALLOWED_ROLES[matchedRoute] : null;
  }, [allowedRoles, pathname]);

  const isAllowed = React.useMemo(() => {
    if (!userRole) {
      return false;
    }
    if (!effectiveAllowedRoles) {
      // If route is not in restricted map (e.g. public or unmapped), allow
      return true;
    }
    return effectiveAllowedRoles.includes(userRole);
  }, [effectiveAllowedRoles, userRole]);

  React.useEffect(() => {
    if (isClient && userRole && !isAllowed) {
      const homePage = ROLE_HOME_PAGES[userRole] || "/orders";
      if (pathname !== homePage) {
        router.replace(homePage);
      }
    }
  }, [isClient, userRole, isAllowed, pathname, router]);

  if (!isClient || !userRole) {
    return null;
  }

  if (!isAllowed) {
    return null;
  }

  return <>{children}</>;
}
