import type { MenuItem, SupportedLanguage } from "@app/shared";

/**
 * Resolve localized name for a menu category or item.
 * Falls back to English if the translation in current locale is missing,
 * then to the default entity name.
 */
export function getLocalizedName(
  entity: { name?: string; translations?: { language: SupportedLanguage; name: string }[] },
  locale: string
): string {
  if (entity.translations && entity.translations.length > 0) {
    const match = entity.translations.find((t) => t.language === locale && t.name.trim().length > 0);
    if (match) return match.name;

    const enFallback = entity.translations.find(
      (t) => t.language === "en" && t.name.trim().length > 0
    );
    if (enFallback) return enFallback.name;
  }

  return entity.name || "";
}

/**
 * Resolve localized description for a menu item.
 */
export function getLocalizedDescription(
  item: MenuItem,
  locale: string
): string | null {
  if (item.translations && item.translations.length > 0) {
    const match = item.translations.find(
      (t) => t.language === locale && t.description && t.description.trim().length > 0
    );
    if (match?.description) return match.description;

    const enFallback = item.translations.find(
      (t) => t.language === "en" && t.description && t.description.trim().length > 0
    );
    if (enFallback?.description) return enFallback.description;
  }

  return null;
}

/**
 * Resolve localized aliases for a menu item.
 */
export function getLocalizedAliases(
  item: MenuItem,
  locale: string
): string[] {
  if (item.translations && item.translations.length > 0) {
    const match = item.translations.find(
      (t) => t.language === locale && t.aliases && t.aliases.length > 0
    );
    if (match && match.aliases.length > 0) return match.aliases;

    const enFallback = item.translations.find(
      (t) => t.language === "en" && t.aliases && t.aliases.length > 0
    );
    if (enFallback && enFallback.aliases.length > 0) return enFallback.aliases;
  }

  return [];
}
