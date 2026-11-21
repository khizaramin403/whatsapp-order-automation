"use client";

import * as React from "react";
import { useLocale } from "next-intl";
import { setLocale } from "@/actions/locale";
import { cn } from "@/lib/utils";

const LANGUAGES = [
  { code: "en", label: "EN" },
  { code: "ur-Latn", label: "Roman Urdu" },
  { code: "ar", label: "العربية" },
] as const;

export function LanguageSwitcher() {
  const currentLocale = useLocale();
  const [isPending, startTransition] = React.useTransition();

  const handleSelect = (code: string) => {
    startTransition(async () => {
      await setLocale(code);
    });
  };

  return (
    <div
      role="group"
      aria-label="Language options"
      className="inline-flex items-center rounded-full bg-[#ECEEF1] p-1 border border-[#D5DAE0]"
    >
      {LANGUAGES.map((lang) => {
        const isActive = currentLocale === lang.code;
        return (
          <button
            key={lang.code}
            type="button"
            disabled={isPending}
            onClick={() => handleSelect(lang.code)}
            className={cn(
              "rounded-full px-2.5 py-1 text-xs font-semibold transition-colors cursor-pointer",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#10202D] focus-visible:ring-offset-2",
              isActive
                ? "bg-[#10202D] text-[#F7F7F7] shadow-xs"
                : "text-[#5F6C79] hover:text-[#10202D] hover:bg-[#E2E5E9]"
            )}
          >
            {lang.label}
          </button>
        );
      })}
    </div>
  );
}
