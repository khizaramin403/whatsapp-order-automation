"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { defaultLocale, locales, type Locale } from "@/i18n/request";

export async function setLocale(locale: string) {
  const targetLocale: Locale = locales.includes(locale as Locale)
    ? (locale as Locale)
    : defaultLocale;

  const cookieStore = await cookies();
  cookieStore.set("NEXT_LOCALE", targetLocale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });

  revalidatePath("/", "layout");
}
