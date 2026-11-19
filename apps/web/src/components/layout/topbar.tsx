"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Menu,
  Volume2,
  VolumeX,
  Bell,
} from "lucide-react";

import { useUI } from "@/stores/ui.store";
import { useAuth, type UserRole } from "@/stores/auth.store";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const ROLE_OPTIONS: { role: UserRole; label: string }[] = [
  { role: "owner", label: "Owner" },
  { role: "manager", label: "Manager" },
  { role: "chef", label: "Chef" },
  { role: "rider", label: "Rider" },
];

export function Topbar() {
  const t = useTranslations("pages");
  const tSidebar = useTranslations("sidebar");
  const pathname = usePathname();

  // Narrow selectors
  const setMobileOpen = useUI((s) => s.setMobileOpen);
  const soundOn = useUI((s) => s.soundOn);
  const toggleSound = useUI((s) => s.toggleSound);

  const user = useAuth((s) => s.user);
  const setRole = useAuth((s) => s.setRole);

  // Map route to page title
  const pageTitle = React.useMemo(() => {
    if (pathname.includes("/orders")) return t("orders");
    if (pathname.includes("/kitchen")) return t("kitchen");
    if (pathname.includes("/delivery")) return t("delivery");
    if (pathname.includes("/menu")) return t("menu");
    if (pathname.includes("/analytics")) return t("analytics");
    if (pathname.includes("/team")) return t("team");
    if (pathname.includes("/settings")) return t("settings");
    return "Dashboard";
  }, [pathname, t]);

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
    <header className="h-16 bg-white border-b border-[#E2E5E9] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20 shrink-0">
      {/* Inline-start: Mobile menu button & page title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className={cn(
            "md:hidden h-10 w-10 rounded-[8px] border border-[#D5DAE0] flex items-center justify-center",
            "text-[#10202D] hover:bg-[#F2F4F6] transition-colors cursor-pointer",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C7A667]"
          )}
          aria-label={tSidebar("mobileMenu")}
        >
          <Menu className="h-5 w-5" strokeWidth={1.75} />
        </button>

        <h1 className="text-xl sm:text-2xl font-semibold text-[#10202D] truncate">
          {pageTitle}
        </h1>
      </div>

      {/* Inline-end controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Role Switcher Test Control (allows testing chef/rider/manager/owner sidebar filtering immediately) */}
        <div className="hidden lg:flex items-center gap-1.5 px-2 py-1 rounded-[8px] bg-[#F7F7F7] border border-[#E2E5E9] text-xs">
          <span className="text-[#5F6C79] font-medium me-1">Role:</span>
          {ROLE_OPTIONS.map((opt) => (
            <button
              key={opt.role}
              type="button"
              onClick={() => setRole(opt.role)}
              className={cn(
                "px-2 py-0.5 rounded-[6px] font-semibold transition-colors cursor-pointer",
                user?.role === opt.role
                  ? "bg-[#C7A667] text-[#10202D]"
                  : "text-[#5F6C79] hover:bg-[#ECEEF1] hover:text-[#10202D]"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Live SSE indicator (DESIGN.md Section 7.6) */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#E6F2EC] text-[#1F5C42] border border-[#E6F2EC] text-xs font-semibold">
          <span className="h-2 w-2 rounded-full bg-[#2F7D5B] animate-pulse" aria-hidden="true" />
          <span>Live</span>
        </div>

        {/* Sound toggle button */}
        <button
          type="button"
          onClick={toggleSound}
          className={cn(
            "hidden sm:flex h-9 w-9 rounded-[8px] items-center justify-center text-[#5F6C79] hover:text-[#10202D] hover:bg-[#F2F4F6] transition-colors cursor-pointer",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C7A667]"
          )}
          title={soundOn ? "Sound On" : "Sound Muted"}
          aria-label={soundOn ? "Sound On" : "Sound Muted"}
        >
          {soundOn ? (
            <Volume2 className="h-5 w-5" strokeWidth={1.75} />
          ) : (
            <VolumeX className="h-5 w-5 text-[#8E2A22]" strokeWidth={1.75} />
          )}
        </button>

        {/* Notification Bell */}
        <button
          type="button"
          className={cn(
            "h-9 w-9 rounded-[8px] flex items-center justify-center text-[#5F6C79] hover:text-[#10202D] hover:bg-[#F2F4F6] transition-colors cursor-pointer relative",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C7A667]"
          )}
          title="Notifications"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" strokeWidth={1.75} />
          <span className="absolute top-1.5 end-1.5 h-2 w-2 rounded-full bg-[#C7A667]" />
        </button>

        {/* Language Switcher */}
        <div className="hidden sm:block">
          <LanguageSwitcher />
        </div>

        {/* User Avatar */}
        <div
          className="h-9 w-9 rounded-full cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#10202D]"
          tabIndex={0}
          role="button"
          aria-label="User profile"
        >
          <Avatar size="sm">
            <AvatarFallback>{userInitials}</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
