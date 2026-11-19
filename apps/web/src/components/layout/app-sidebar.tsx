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
  PanelLeftClose,
  PanelLeftOpen,
  ChevronDown,
  type LucideIcon,
} from "lucide-react";

import { useUI } from "@/stores/ui.store";
import { useAuth, type UserRole } from "@/stores/auth.store";
import { BRAND_NAME } from "@/config/brand";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { UserMenu } from "@/components/layout/user-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
        badgeCount: 3, // Mock new order count from DESIGN.md
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

export function AppSidebar() {
  const t = useTranslations("sidebar");
  const locale = useLocale();
  const isRtl = locale === "ar";
  const pathname = usePathname();

  // Narrow Zustand selectors (PERFORMANCE.md)
  const sidebarOpen = useUI((s) => s.sidebarOpen);
  const toggleSidebar = useUI((s) => s.toggleSidebar);
  const user = useAuth((s) => s.user);

  const userRole: UserRole = user?.role ?? "owner";

  // Ctrl/Cmd+B keyboard shortcut to toggle sidebar
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        toggleSidebar();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleSidebar]);

  // Filter navigation items by role
  const visibleGroups = React.useMemo(() => {
    return NAV_GROUPS.map((group) => ({
      ...group,
      items: group.items.filter((item) => item.roles.includes(userRole)),
    })).filter((group) => group.items.length > 0);
  }, [userRole]);

  // Initials for avatar fallback
  const userName = user?.name ?? "Ali Raza";
  const userInitials =
    userName
      .trim()
      .split(/\s+/)
      .map((p) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "AR";

  return (
    <TooltipProvider delayDuration={150}>
      <aside
        data-state={sidebarOpen ? "expanded" : "collapsed"}
        className={cn(
          "h-screen sticky top-0 flex flex-col z-30 select-none overflow-hidden",
          "bg-[#10202D] border-e border-[#22394B]",
          "transition-[width] duration-200 ease-out motion-reduce:transition-none",
          sidebarOpen ? "w-[264px]" : "w-[72px]"
        )}
      >
        {/* Header (64px) with Brand Mark, Wordmark and Toggle */}
        <div className="h-16 flex items-center px-4 justify-between border-b border-[#22394B] shrink-0">
          {sidebarOpen ? (
            <>
              {/* Brand mark & wordmark */}
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

              {/* Toggle button at top (expanded) */}
              <button
                type="button"
                onClick={toggleSidebar}
                className={cn(
                  "h-9 w-9 rounded-[8px] flex items-center justify-center",
                  "text-[#A9B4BE] hover:text-[#F7F7F7] hover:bg-[#1B2D3B]",
                  "transition-colors cursor-pointer",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C7A667] focus-visible:ring-offset-2 focus-visible:ring-offset-[#10202D]"
                )}
                title={t("collapse")}
                aria-label={t("collapse")}
              >
                <PanelLeftClose className="h-5 w-5 rtl:scale-x-[-1]" strokeWidth={1.75} />
              </button>
            </>
          ) : (
            /* Toggle button centered at top (collapsed) */
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={toggleSidebar}
                  className={cn(
                    "h-10 w-10 mx-auto rounded-[8px] flex items-center justify-center",
                    "text-[#A9B4BE] hover:text-[#F7F7F7] hover:bg-[#1B2D3B]",
                    "transition-colors cursor-pointer",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C7A667] focus-visible:ring-offset-2 focus-visible:ring-offset-[#10202D]"
                  )}
                  aria-label={t("expand")}
                >
                  <PanelLeftOpen className="h-5 w-5 rtl:scale-x-[-1]" strokeWidth={1.75} />
                </button>
              </TooltipTrigger>
              <TooltipContent side={isRtl ? "left" : "right"} sideOffset={12}>
                {t("expand")}
              </TooltipContent>
            </Tooltip>
          )}
        </div>

        {/* Scrollable Navigation Groups */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-3 space-y-4">
          {visibleGroups.map((group, groupIdx) => {
            return (
              <div key={group.key} className="space-y-1">
                {/* Group Label / Thin Divider */}
                {sidebarOpen ? (
                  <div className="px-2 pt-2 pb-1 text-[10.5px] font-semibold uppercase tracking-wider text-[#7F8C98]">
                    {t(group.key)}
                  </div>
                ) : (
                  groupIdx > 0 && (
                    <div
                      className="my-2 mx-1 border-t border-[#22394B]"
                      role="separator"
                      aria-hidden="true"
                    />
                  )
                )}

                {/* Group Items */}
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const isActive =
                      pathname === item.href || pathname.startsWith(item.href + "/");
                    const Icon = item.icon;
                    const label = t(item.key);

                    const linkContent = (
                      <Link
                        href={item.href}
                        className={cn(
                          "h-10 rounded-[8px] flex items-center transition-colors text-sm font-medium relative",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C7A667] focus-visible:ring-offset-2 focus-visible:ring-offset-[#10202D]",
                          sidebarOpen ? "px-3 gap-3" : "w-10 h-10 mx-auto justify-center px-0",
                          isActive
                            ? "bg-[#1B2D3B] text-[#F7F7F7] font-semibold"
                            : "text-[#A9B4BE] hover:bg-[#1B2D3B] hover:text-[#F7F7F7]"
                        )}
                      >
                        {/* 3px Gold bar on inline-start edge for active state */}
                        {isActive && (
                          <span
                            className="absolute start-0 top-1.5 bottom-1.5 w-[3px] bg-[#C7A667] rounded-s"
                            aria-hidden="true"
                          />
                        )}

                        {/* Item Icon */}
                        <div className="relative shrink-0 flex items-center justify-center">
                          <Icon
                            className={cn(
                              "h-5 w-5 shrink-0 transition-colors",
                              isActive ? "text-[#C7A667]" : "text-inherit"
                            )}
                            strokeWidth={1.75}
                          />

                          {/* Collapsed small gold dot badge */}
                          {!sidebarOpen && (item.badgeCount ?? 0) > 0 && (
                            <span
                              className="absolute -top-1 -end-1 h-2 w-2 rounded-full bg-[#C7A667] ring-2 ring-[#10202D]"
                              aria-hidden="true"
                            />
                          )}
                        </div>

                        {/* Expanded Item Label & Badge */}
                        {sidebarOpen && (
                          <>
                            <span className="truncate">{label}</span>

                            {(item.badgeCount ?? 0) > 0 && (
                              <span
                                className="ms-auto inline-flex items-center justify-center px-2 py-0.5 text-[11px] font-semibold rounded-full bg-[#C7A667] text-[#10202D] leading-none shrink-0"
                                aria-label={t("newOrdersBadge", { count: item.badgeCount ?? 0 })}
                              >
                                {item.badgeCount}
                              </span>
                            )}
                          </>
                        )}
                      </Link>
                    );

                    // When collapsed: render inside Radix Tooltip
                    if (!sidebarOpen) {
                      return (
                        <Tooltip key={item.key}>
                          <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                          <TooltipContent side={isRtl ? "left" : "right"} sideOffset={12}>
                            <div className="flex items-center gap-2">
                              <span>{label}</span>
                              {(item.badgeCount ?? 0) > 0 && (
                                <span className="bg-[#C7A667] text-[#10202D] px-1.5 py-0.2 rounded-full text-[10px] font-semibold">
                                  {item.badgeCount}
                                </span>
                              )}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      );
                    }

                    return <div key={item.key}>{linkContent}</div>;
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {/* Footer Area: User Trigger */}
        <div className="border-t border-[#22394B] p-3 shrink-0">
          {sidebarOpen ? (
            <UserMenu align="start" side="top" sideOffset={12}>
              <div
                className={cn(
                  "h-12 flex items-center px-2 gap-3 rounded-[8px]",
                  "hover:bg-[#1B2D3B] transition-colors cursor-pointer",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C7A667]"
                )}
                title={t("userMenu")}
                tabIndex={0}
                role="button"
              >
                {/* Avatar on dark sidebar (DESIGN.md Section 7.12) */}
                <Avatar size="default" dark className="shrink-0">
                  <AvatarFallback dark>{userInitials}</AvatarFallback>
                </Avatar>

                {/* Name & Role */}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-[#F7F7F7] truncate leading-tight">
                    {userName}
                  </p>
                  <p className="text-xs text-[#A9B4BE] leading-tight truncate">
                    {t(`roles.${userRole}`)}
                  </p>
                </div>

                {/* Chevron */}
                <ChevronDown className="h-4 w-4 text-[#A9B4BE] shrink-0 ms-auto" strokeWidth={1.75} />
              </div>
            </UserMenu>
          ) : (
            <UserMenu align="end" side={isRtl ? "left" : "right"} sideOffset={16}>
              <div
                className="h-10 w-10 mx-auto flex items-center justify-center rounded-[8px] hover:bg-[#1B2D3B] transition-colors cursor-pointer"
                tabIndex={0}
                role="button"
                aria-label={userName}
              >
                <Avatar size="default" dark>
                  <AvatarFallback dark>{userInitials}</AvatarFallback>
                </Avatar>
              </div>
            </UserMenu>
          )}
        </div>
      </aside>
    </TooltipProvider>
  );
}
