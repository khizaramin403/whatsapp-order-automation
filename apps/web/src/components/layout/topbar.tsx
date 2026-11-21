"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Menu, Volume2, VolumeX, Bell } from "lucide-react";

import { useUI } from "@/stores/ui.store";
import { useAuth } from "@/stores/auth.store";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { UserMenu } from "@/components/layout/user-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface TopbarProps {
  /** Optional state for live SSE connection: 'connected' | 'reconnecting' */
  connectionStatus?: "connected" | "reconnecting";
}

export function Topbar({ connectionStatus = "connected" }: TopbarProps) {
  const tPages = useTranslations("pages");
  const tTopbar = useTranslations("topbar");
  const pathname = usePathname();

  // Narrow selectors (PERFORMANCE.md)
  const setMobileOpen = useUI((s) => s.setMobileOpen);
  const soundOn = useUI((s) => s.soundOn);
  const toggleSound = useUI((s) => s.toggleSound);

  const user = useAuth((s) => s.user);

  // Map route to page title
  const pageTitle = React.useMemo(() => {
    if (pathname.includes("/orders")) return tPages("orders");
    if (pathname.includes("/kitchen")) return tPages("kitchen");
    if (pathname.includes("/delivery")) return tPages("delivery");
    if (pathname.includes("/menu")) return tPages("menu");
    if (pathname.includes("/analytics")) return tPages("analytics");
    if (pathname.includes("/team")) return tPages("team");
    if (pathname.includes("/settings")) return tPages("settings");
    return tPages("dashboard");
  }, [pathname, tPages]);

  const userName = user?.name ?? "Ali Raza";
  const userInitials =
    userName
      .trim()
      .split(/\s+/)
      .map((p) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "AR";

  const isConnected = connectionStatus === "connected";

  return (
    <header className="h-16 bg-white border-b border-[#E2E5E9] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20 shrink-0">
      {/* Inline-start: Mobile menu button (under 768px) & Page title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className={cn(
            "md:hidden h-10 w-10 rounded-[8px] border border-[#D5DAE0] flex items-center justify-center",
            "text-[#10202D] hover:bg-[#F2F4F6] transition-colors cursor-pointer",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#10202D] focus-visible:ring-offset-2"
          )}
          aria-label={tTopbar("openMobileMenu")}
        >
          <Menu className="h-5 w-5" strokeWidth={1.75} />
        </button>

        <h1 className="text-xl sm:text-2xl font-semibold text-[#10202D] truncate">
          {pageTitle}
        </h1>
      </div>

      {/* Inline-end controls in exact DESIGN.md order */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* 1. Live SSE dot with the word 'Live' (ready for green connected or amber reconnecting) */}
        <div
          className={cn(
            "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border select-none transition-colors",
            isConnected
              ? "bg-[#E6F2EC] text-[#1F5C42] border-[#E6F2EC]"
              : "bg-[#FBF0DA] text-[#7A4E0B] border-[#FBF0DA]"
          )}
          title={isConnected ? tTopbar("live") : tTopbar("reconnecting")}
        >
          <span
            className={cn(
              "h-2 w-2 rounded-full",
              isConnected ? "bg-[#2F7D5B] animate-pulse" : "bg-[#B7791F]"
            )}
            aria-hidden="true"
          />
          <span>{isConnected ? tTopbar("live") : tTopbar("reconnecting")}</span>
        </div>

        {/* 2. Sound toggle (hidden on mobile under 768px) */}
        <button
          type="button"
          onClick={toggleSound}
          className={cn(
            "hidden md:flex h-9 w-9 rounded-[8px] items-center justify-center text-[#5F6C79] hover:text-[#10202D] hover:bg-[#F2F4F6] transition-colors cursor-pointer",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#10202D] focus-visible:ring-offset-2"
          )}
          title={soundOn ? tTopbar("soundOn") : tTopbar("soundMuted")}
          aria-label={soundOn ? tTopbar("soundOn") : tTopbar("soundMuted")}
        >
          {soundOn ? (
            <Volume2 className="h-5 w-5" strokeWidth={1.75} />
          ) : (
            <VolumeX className="h-5 w-5 text-[#8E2A22]" strokeWidth={1.75} />
          )}
        </button>

        {/* 3. Notification bell */}
        <button
          type="button"
          className={cn(
            "h-9 w-9 rounded-[8px] flex items-center justify-center text-[#5F6C79] hover:text-[#10202D] hover:bg-[#F2F4F6] transition-colors cursor-pointer relative",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#10202D] focus-visible:ring-offset-2"
          )}
          title={tTopbar("notifications")}
          aria-label={tTopbar("notifications")}
        >
          <Bell className="h-5 w-5" strokeWidth={1.75} />
          <span className="absolute top-1.5 end-1.5 h-2 w-2 rounded-full bg-[#C7A667]" />
        </button>

        {/* 4. Language switcher (hidden on mobile under 768px, available via User Menu on mobile) */}
        <div className="hidden md:block">
          <LanguageSwitcher />
        </div>

        {/* 5. Avatar with User Menu (32px avatar on light surface) */}
        <UserMenu align="end" side="bottom" sideOffset={8}>
          <button
            type="button"
            className="rounded-full cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#10202D] focus-visible:ring-offset-2"
            aria-label={tTopbar("openUserMenu")}
          >
            <Avatar size="sm">
              <AvatarFallback>{userInitials}</AvatarFallback>
            </Avatar>
          </button>
        </UserMenu>
      </div>
    </header>
  );
}
