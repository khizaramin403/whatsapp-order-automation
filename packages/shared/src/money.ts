/**
 * Formats money represented as integer minor units into standard display string using Intl.NumberFormat.
 * Reference: DECISIONS.md Section 3 ("default currency PKR shown as 'Rs'. Format numbers and dates with Intl.")
 */
export function formatMoney(
  amountMinor: number,
  currency: string = "PKR",
  locale: string = "en-PK"
): string {
  const major = amountMinor / 100;

  if (currency === "PKR") {
    // In Pakistan / Urdu / English contexts, standard representation is Rs 1,250
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: "PKR",
      currencyDisplay: "narrowSymbol",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
      .format(major)
      .replace("PKR", "Rs");
  }

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(major);
}
