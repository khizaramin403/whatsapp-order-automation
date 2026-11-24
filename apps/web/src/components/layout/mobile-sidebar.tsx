"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import {
  ClipboardList,
  ChefHat,
  Bike,
  UtensilsCrossed,
  ChartColumn,
  Users,
  Settings,
  X,
  type LucideIcon,
} from "lucide-react";

import { useUI } from "@/stores/ui.store";
import { useAuth, type UserRole } from "@/stores/auth.store";
import { BRAND_NAME } from "@/config/brand";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { UserMenu } from "@/components/layout/user-menu";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";

interface NavItem {
  key: "orders" | "kitchen" | "delivery" | "menu" | "analytics" | "team" | "settings";
  href: string;
  icon: LucideIcon;
  roles: UserRole[];
  badgeCount?: number;
}

interface NavGroup {
  key: "operations" | "catalog" | "insights" | "manage";
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    key: "operations",
    items: [
      {
        key: "orders",
        href: "/orders",
        icon: ClipboardList,
        roles: ["owner", "manager", "super_admin"],
      },
      {
        key: "kitchen",
        href: "/kitchen",
        icon: ChefHat,
        roles: ["owner", "manager", "chef", "super_admin"],
      },
      {
        key: "delivery",
        href: "/delivery",
        icon: Bike,
        roles: ["owner", "manager", "rider", "super_admin"],
      },
    ],
  },
  {
    key: "catalog",
    items: [
      {
        key: "menu",
        href: "/menu",
        icon: UtensilsCrossed,
        roles: ["owner", "manager", "super_admin"],
      },
    ],
  },
  {
    key: "insights",
    items: [
      {
        key: "analytics",
        href: "/analytics",
        icon: ChartColumn,
        roles: ["owner", "super_admin"],
      },
    ],
  },
  {
    key: "manage",
    items: [
      {
        key: "team",
        href: "/team",
        icon: Users,
        roles: ["owner", "super_admin"],
      },
      {
        key: "settings",
        href: "/settings",
        icon: Settings,
        roles: ["owner", "super_admin"],
      },
    ],
  },
];

export function MobileSidebar() {
  const t = useTranslations("sidebar");
  const locale = useLocale();
  const isRtl = locale === "ar";
  const pathname = usePathname();

  const mobileOpen = useUI((s) => s.mobileOpen);
  const setMobileOpen = useUI((s) => s.setMobileOpen);
  const newOrdersCount = useUI((s) => s.newOrdersCount);
  const user = useAuth((s) => s.user);

  const userRole: UserRole = user?.role ?? "owner";

  const visibleGroups = React.useMemo(() => {
    return NAV_GROUPS.map((group) => ({
      ...group,
      items: group.items.filter((item) => item.roles.includes(userRole)),
    })).filter((group) => group.items.length > 0);
  }, [userRole]);

  const userName = user?.name ?? "";
  const userInitials =
    userName
      .trim()
      .split(/\s+/)
      .map((p) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "U";

  return (
    <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
      <SheetContent
        side={isRtl ? "right" : "left"}
        className="w-[280px] p-0 bg-[#10202D] border-[#22394B] text-[#F7F7F7] flex flex-col md:hidden"
      >
        <SheetTitle className="sr-only">{BRAND_NAME} Navigation</SheetTitle>

        {/* Mobile Header (64px) */}
        <div className="h-16 flex items-center px-4 justify-between border-b border-[#22394B] shrink-0">
          <div className="flex items-center min-w-0">
            <div
              className="h-9 w-9 rounded-[8px] bg-[#1B2D3B] border border-[#22394B] flex items-center justify-center text-[#C7A667] font-brand font-semibold text-lg shrink-0 shadow-xs"
              aria-hidden="true"
            >
              Y
            </div>
            <span className="font-brand font-semibold text-lg text-[#F7F7F7] truncate ms-3">
              {BRAND_NAME}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="h-9 w-9 rounded-[8px] flex items-center justify-center text-[#A9B4BE] hover:text-[#F7F7F7] hover:bg-[#1B2D3B] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C7A667]"
            aria-label={t("closeNavigation")}
          >
            <X className="h-5 w-5" strokeWidth={1.75} />
          </button>
        </div>

        {/* Mobile Navigation List (scrollbar hidden) */}
        <nav className="flex-1 overflow-y-auto no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden py-3 px-3 space-y-4">
          {visibleGroups.map((group) => (
            <div key={group.key} className="space-y-1">
              <div className="px-2 pt-2 pb-1 text-[10.5px] font-semibold uppercase tracking-wider text-[#7F8C98]">
                {t(group.key)}
              </div>

              <div className="space-y-1">
                {group.items.map((item) => {
                  const isActive =
                    pathname === item.href || pathname.startsWith(item.href + "/");
                  const Icon = item.icon;
                  const label = t(item.key);

                  return (
                    <Link
                      key={item.key}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "h-10 rounded-[8px] flex items-center px-3 gap-3 transition-colors text-sm font-medium relative",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C7A667]",
                        isActive
                          ? "bg-[#1B2D3B] text-[#F7F7F7] font-semibold"
                          : "text-[#A9B4BE] hover:bg-[#1B2D3B] hover:text-[#F7F7F7]"
                      )}
                    >
                      {isActive && (
                        <span
                          className="absolute start-0 top-1.5 bottom-1.5 w-[3px] bg-[#C7A667] rounded-s"
                          aria-hidden="true"
                        />
                      )}

                      <Icon
                        className={cn(
                          "h-5 w-5 shrink-0 transition-colors",
                          isActive ? "text-[#C7A667]" : "text-inherit"
                        )}
                        strokeWidth={1.75}
                      />

                      <span className="truncate">{label}</span>

                      {((item.key === "orders" ? newOrdersCount : item.badgeCount) ?? 0) > 0 && (
                        <span
                          className="ms-auto inline-flex items-center justify-center px-2 py-0.5 text-[11px] font-semibold rounded-full bg-[#C7A667] text-[#10202D] leading-none shrink-0"
                          aria-label={t("newOrdersBadge", { count: item.key === "orders" ? newOrdersCount : (item.badgeCount ?? 0) })}
                        >
                          {item.key === "orders" ? newOrdersCount : item.badgeCount}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Mobile Footer */}
        <div className="border-t border-[#22394B] p-3 shrink-0">
          <UserMenu align="start" side="top" sideOffset={12}>
            <div className="flex items-center px-2 gap-3 cursor-pointer hover:bg-[#1B2D3B] rounded-[8px] py-1 transition-colors" role="button">
              <Avatar size="default" dark className="shrink-0">
                <AvatarFallback dark>{userInitials}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-[#F7F7F7] truncate">{userName}</p>
                <p className="text-xs text-[#A9B4BE] truncate">{t(`roles.${userRole}`)}</p>
              </div>
            </div>
          </UserMenu>
        </div>
      </SheetContent>
    </Sheet>
  );
}
