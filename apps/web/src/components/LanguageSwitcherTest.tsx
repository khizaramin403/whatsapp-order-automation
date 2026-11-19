"use client";

import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { setLocale } from "@/actions/locale";

const LANGUAGES = [
  { code: "en", label: "English", native: "English" },
  { code: "ur-Latn", label: "Roman Urdu", native: "Roman Urdu" },
  { code: "ar", label: "Arabic", native: "العربية" },
] as const;

export function LanguageSwitcherTest() {
  const currentLocale = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleSelect = (code: string) => {
    startTransition(async () => {
      await setLocale(code);
      router.refresh();
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-2 p-3 bg-white border border-[#E2E5E9] rounded-[12px] shadow-card">
      <span className="text-xs font-semibold text-[#5F6C79] me-2">
        Language (Temporary Switcher):
      </span>
      <div className="flex items-center gap-2">
        {LANGUAGES.map((lang) => {
          const isActive = currentLocale === lang.code;
          return (
            <button
              key={lang.code}
              type="button"
              disabled={isPending}
              onClick={() => handleSelect(lang.code)}
              className={`px-3 py-1.5 rounded-[8px] text-xs font-semibold transition-colors duration-150 ${
                isActive
                  ? "bg-[#10202D] text-[#F7F7F7] shadow-sm"
                  : "bg-white border border-[#D5DAE0] text-[#10202D] hover:bg-[#F2F4F6]"
              } disabled:opacity-50`}
            >
              {lang.native}
            </button>
          );
        })}
      </div>
      {isPending && (
        <span className="text-xs text-[#5F6C79] ms-2 animate-pulse">
          Updating...
        </span>
      )}
    </div>
  );
}
