"use client";

import * as React from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { User, Languages, LogOut, Check } from "lucide-react";

import { useAuth } from "@/stores/auth.store";
import { setLocale } from "@/actions/locale";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/components/ui/sonner";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "ur-Latn", label: "Roman Urdu" },
  { code: "ar", label: "العربية" },
] as const;

interface UserMenuProps {
  children: React.ReactNode;
  align?: "start" | "end" | "center";
  side?: "top" | "bottom" | "left" | "right";
  sideOffset?: number;
}

export function UserMenu({
  children,
  align = "end",
  side = "bottom",
  sideOffset = 8,
}: UserMenuProps) {
  const t = useTranslations("userMenu");
  const tSidebar = useTranslations("sidebar");
  const currentLocale = useLocale();

  const user = useAuth((s) => s.user);
  const clearAuth = useAuth((s) => s.clearAuth);

  const [isPending, startTransition] = React.useTransition();

  const handleLanguageChange = (code: string) => {
    startTransition(async () => {
      await setLocale(code);
    });
  };

  const handleSignOut = () => {
    clearAuth();
    toast.success(t("signedOut"));
  };

  const userName = user?.name ?? "Ali Raza";
  const userRole = user?.role ?? "owner";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent
        align={align}
        side={side}
        sideOffset={sideOffset}
        className="w-56"
      >
        {/* User Identity Header */}
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-semibold text-[#10202D] leading-none truncate">
              {userName}
            </p>
            <p className="text-xs text-[#5F6C79] leading-none capitalize">
              {tSidebar(`roles.${userRole}`)}
            </p>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          {/* Profile link */}
          <DropdownMenuItem asChild>
            <Link href="/team" className="cursor-pointer flex items-center">
              <User className="me-2 h-4 w-4 text-[#5F6C79]" strokeWidth={1.75} />
              <span>{t("profile")}</span>
            </Link>
          </DropdownMenuItem>

          {/* Language Selection Submenu */}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="cursor-pointer">
              <Languages className="me-2 h-4 w-4 text-[#5F6C79]" strokeWidth={1.75} />
              <span>{t("language")}</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="w-40">
              {LANGUAGES.map((lang) => {
                const isSelected = currentLocale === lang.code;
                return (
                  <DropdownMenuItem
                    key={lang.code}
                    disabled={isPending}
                    onClick={() => handleLanguageChange(lang.code)}
                    selected={isSelected}
                    className="cursor-pointer flex items-center justify-between"
                  >
                    <span>{lang.label}</span>
                    {isSelected && (
                      <Check className="h-4 w-4 text-[#7D6228]" strokeWidth={2.5} />
                    )}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {/* Sign out */}
        <DropdownMenuItem
          onClick={handleSignOut}
          className="text-[#8E2A22] focus:text-[#8E2A22] focus:bg-[#F8E4E1] cursor-pointer"
        >
          <LogOut className="me-2 h-4 w-4 text-[#8E2A22]" strokeWidth={1.75} />
          <span>{t("signOut")}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
