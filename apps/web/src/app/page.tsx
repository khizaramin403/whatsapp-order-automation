import { getLocale, getTranslations } from "next-intl/server";
import { BRAND_NAME } from "@/config/brand";
import { LanguageSwitcherTest } from "@/components/LanguageSwitcherTest";

const CORE_COLORS = [
  { name: "Midnight Blue", hex: "#10202D", use: "Sidebar, primary buttons, headings, main text", lightText: true },
  { name: "Muted Gold", hex: "#C7A667", use: "Accent: active marker, key button, badge on dark", lightText: false },
  { name: "Soft White", hex: "#F7F7F7", use: "Page background, text on dark", border: true, lightText: false },
  { name: "White", hex: "#FFFFFF", use: "Cards, topbar, tables, inputs", border: true, lightText: false },
  { name: "Midnight 800", hex: "#1B2D3B", use: "Sidebar hover and active background", lightText: true },
  { name: "Midnight 700", hex: "#22394B", use: "Sidebar borders, avatar fallback on dark", lightText: true },
  { name: "Midnight Deep", hex: "#0B1620", use: "Tooltips", lightText: true },
  { name: "Slate Text", hex: "#4A5865", use: "Secondary text", lightText: true },
  { name: "Muted Text", hex: "#5F6C79", use: "Labels, captions, placeholders", lightText: true },
  { name: "Sidebar Text", hex: "#A9B4BE", use: "Inactive sidebar labels and icons", lightText: false },
  { name: "Border", hex: "#E2E5E9", use: "Card and table borders", border: true, lightText: false },
  { name: "Input Border", hex: "#D5DAE0", use: "Inputs and secondary buttons", border: true, lightText: false },
  { name: "Hover Fill", hex: "#F2F4F6", use: "Row, menu and ghost button hover on light", border: true, lightText: false },
  { name: "Gold Tint", hex: "#F4ECDC", use: "Selected row, soft highlight, avatar fallback on light", border: true, lightText: false },
  { name: "Gold Text", hex: "#7D6228", use: "Links and gold-colored text on light backgrounds", lightText: true },
  { name: "Gold Hover", hex: "#B5964F", use: "Gold button hover", lightText: false },
  { name: "Gold Pressed", hex: "#A3853F", use: "Gold button pressed", lightText: false },
];

const STATUS_COLORS = [
  { meaning: "Success", fill: "#E6F2EC", text: "#1F5C42", solid: "#2F7D5B", usedFor: "Ready, payment verified" },
  { meaning: "Warning", fill: "#FBF0DA", text: "#7A4E0B", solid: "#B7791F", usedFor: "Pending, payment awaiting check" },
  { meaning: "Danger", fill: "#F8E4E1", text: "#8E2A22", solid: "#B3392F", usedFor: "Rejected, cancelled, errors" },
  { meaning: "Info", fill: "#E3EDF5", text: "#1F4C73", solid: "#2F6690", usedFor: "Preparing, informational notes" },
  { meaning: "Gold", fill: "#F4ECDC", text: "#7D6228", solid: "#C7A667", usedFor: "Accepted" },
  { meaning: "Midnight tint", fill: "#E3E8EE", text: "#10202D", solid: "#10202D", usedFor: "Out for delivery" },
  { meaning: "Neutral", fill: "#ECEEF1", text: "#3A4651", solid: "#4A5865", usedFor: "Delivered (history), COD tag, inactive" },
];

export default async function Home() {
  const t = await getTranslations("common");
  const locale = await getLocale();
  const isRtl = locale === "ar";

  const translatedWords = [
    { key: "orders", label: t("orders") },
    { key: "kitchen", label: t("kitchen") },
    { key: "delivery", label: t("delivery") },
    { key: "menu", label: t("menu") },
    { key: "analytics", label: t("analytics") },
    { key: "team", label: t("team") },
    { key: "settings", label: t("settings") },
    { key: "language", label: t("language") },
    { key: "signIn", label: t("signIn") },
    { key: "save", label: t("save") },
    { key: "cancel", label: t("cancel") },
  ];

  return (
    <main className="min-h-screen p-8 max-w-6xl mx-auto space-y-12">
      {/* Header with Brand wordmark and Language Switcher */}
      <header className="border-b border-[#E2E5E9] pb-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="font-brand text-2xl font-semibold text-[#10202D]">
                {BRAND_NAME}
              </span>
              <span className="text-xs uppercase tracking-wider font-semibold text-[#5F6C79] bg-[#ECEEF1] px-3 py-1 rounded-full">
                Step 1.2: RTL &amp; Translations
              </span>
            </div>
            <p className="text-sm text-[#4A5865] mt-1">{t("testSubtitle")}</p>
          </div>
          <LanguageSwitcherTest />
        </div>

        {/* Current Locale & Direction Status Pill */}
        <div className="flex items-center gap-3 text-xs text-[#5F6C79]">
          <span className="font-semibold">{t("currentLanguage")}</span>
          <span>&bull;</span>
          <span>Direction: <strong className="font-mono text-[#10202D]">{isRtl ? "RTL (Right-to-Left)" : "LTR (Left-to-Right)"}</strong></span>
          <span>&bull;</span>
          <span>HTML Lang: <strong className="font-mono text-[#10202D]">{locale}</strong></span>
          <span>&bull;</span>
          <span>Font: <strong className="font-mono text-[#10202D]">{isRtl ? "IBM Plex Sans Arabic" : "Inter"}</strong></span>
        </div>
      </header>

      {/* Step 1.2 Requirement 5: Translated Words Showcase */}
      <section className="bg-white p-6 rounded-[12px] border border-[#E2E5E9] shadow-card space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-section-title">Common Translated Words ({locale})</h2>
          <span className="text-caption font-mono">messages/{locale}.json</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {translatedWords.map((word) => (
            <div
              key={word.key}
              className="p-3 bg-[#F7F7F7] border border-[#E2E5E9] rounded-[8px] flex flex-col justify-between"
            >
              <span className="text-caption text-[#5F6C79] block mb-1">
                {word.key}
              </span>
              <span className="text-body-primary font-semibold text-[#10202D]">
                {word.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Step 1.2 Requirement 5: Logical Tailwind Classes Layout Samples */}
      <section className="bg-white p-6 rounded-[12px] border border-[#E2E5E9] shadow-card space-y-6">
        <div>
          <h2 className="text-section-title">Logical Classes Layout Proof (Flipping in RTL)</h2>
          <p className="text-caption mt-1">
            Uses purely logical classes (ms-, me-, ps-, pe-, start-, end-, text-start, text-end). Observe how each element mirrors when switching to Arabic.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Sample 1: Order Card Header */}
          <div className="p-4 bg-[#F7F7F7] border border-[#E2E5E9] rounded-[8px] space-y-3">
            <span className="text-caption block font-semibold text-[#5F6C79]">
              Sample 1: Order Header (text-start, ms-auto, me-2)
            </span>
            <div className="flex items-center bg-white p-3 rounded-[8px] border border-[#E2E5E9]">
              <div className="text-start">
                <span className="text-card-title block">#1042</span>
                <span className="text-caption text-[#5F6C79]">2x Biryani</span>
              </div>
              <div className="ms-auto flex items-center gap-2">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-[#E6F2EC] text-[#1F5C42]">
                  <span className="w-2 h-2 rounded-full bg-[#2F7D5B] me-1.5" />
                  {t("preparing")}
                </span>
                <span className="text-card-title tabular-nums">Rs 1,450</span>
              </div>
            </div>
          </div>

          {/* Sample 2: Input with Inline-Start Icon */}
          <div className="p-4 bg-[#F7F7F7] border border-[#E2E5E9] rounded-[8px] space-y-3">
            <span className="text-caption block font-semibold text-[#5F6C79]">
              Sample 2: Input Field with Start-Positioned Marker (ps-10, start-3)
            </span>
            <div className="relative">
              <span className="absolute inset-y-0 start-3 flex items-center pointer-events-none text-xs font-mono font-bold text-[#C7A667]">
                #
              </span>
              <input
                type="text"
                readOnly
                value="923001234567"
                placeholder={t("customer")}
                className="w-full h-10 ps-8 pe-3 bg-white border border-[#D5DAE0] rounded-[8px] text-body-primary text-start tabular-nums"
              />
            </div>
            <p className="text-caption text-start text-[#5F6C79]">
              Input text aligns with text-start; padding uses ps-8 and pe-3.
            </p>
          </div>

          {/* Sample 3: Selected Table Row with 3px Gold Bar */}
          <div className="p-4 bg-[#F7F7F7] border border-[#E2E5E9] rounded-[8px] space-y-3">
            <span className="text-caption block font-semibold text-[#5F6C79]">
              Sample 3: Selected Table Row (border-s-[3px] border-[#C7A667])
            </span>
            <div className="bg-[#F4ECDC] border border-[#E2E5E9] border-s-[3px] border-s-[#C7A667] p-3 rounded-e-[8px] flex items-center justify-between">
              <div className="text-start">
                <span className="text-body-primary font-semibold block">{t("orders")} - Karachi Central</span>
                <span className="text-caption text-[#7D6228]">Active selected item</span>
              </div>
              <span className="text-kpi-number text-lg tabular-nums">Rs 8,200</span>
            </div>
          </div>

          {/* Sample 4: Action Button Bar */}
          <div className="p-4 bg-[#F7F7F7] border border-[#E2E5E9] rounded-[8px] space-y-3">
            <span className="text-caption block font-semibold text-[#5F6C79]">
              Sample 4: Action Buttons (ms-auto alignment, gap-2)
            </span>
            <div className="bg-white p-3 rounded-[8px] border border-[#E2E5E9] flex items-center">
              <button
                type="button"
                className="px-4 py-2 text-xs font-semibold rounded-[8px] border border-[#D5DAE0] text-[#10202D] hover:bg-[#F2F4F6]"
              >
                {t("cancel")}
              </button>
              <div className="ms-auto flex items-center gap-2">
                <button
                  type="button"
                  className="px-4 py-2 text-xs font-semibold rounded-[8px] bg-[#10202D] text-[#F7F7F7] hover:bg-[#1B3345]"
                >
                  {t("save")}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Typography scale (Step 1.1) */}
      <section className="bg-white p-6 rounded-[12px] border border-[#E2E5E9] shadow-card space-y-6">
        <h2 className="text-section-title">Typography Scale (DESIGN.md Section 7.4)</h2>
        <div className="space-y-4 divide-y divide-[#E2E5E9]">
          <div className="pt-2">
            <span className="text-caption block mb-1">Login heading (Playfair Display 34 / 40, weight 600)</span>
            <p className="text-login-heading">Welcome back to {BRAND_NAME}</p>
          </div>

          <div className="pt-4">
            <span className="text-caption block mb-1">Page title (24 / 32, weight 600, #10202D)</span>
            <p className="text-page-title">{t("testTitle")}</p>
          </div>

          <div className="pt-4">
            <span className="text-caption block mb-1">Section title (18 / 28, weight 600, #10202D)</span>
            <p className="text-section-title">{t("orders")} &amp; {t("kitchen")}</p>
          </div>

          <div className="pt-4">
            <span className="text-caption block mb-1">Card title (16 / 24, weight 600, #10202D)</span>
            <p className="text-card-title">{t("delivery")} #1042 - 2x Biryani</p>
          </div>

          <div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-caption block mb-1">Body text primary (14 / 20, weight 400, #10202D)</span>
              <p className="text-body-primary">
                {t("testSubtitle")}
              </p>
            </div>
            <div>
              <span className="text-caption block mb-1">Body text secondary (14 / 20, weight 400, #4A5865)</span>
              <p className="text-body-secondary">
                {t("currentLanguage")} - {t("status")}: {t("active")}
              </p>
            </div>
          </div>

          <div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-caption block mb-1">Form label (13 / 18, weight 500, #10202D)</span>
              <p className="text-form-label">{t("customer")} Mobile Number *</p>
            </div>
            <div>
              <span className="text-caption block mb-1">Caption and helper (12 / 16, weight 400, #5F6C79)</span>
              <p className="text-caption">E.164 standard (+92 300 1234567)</p>
            </div>
          </div>

          <div className="pt-4">
            <span className="text-caption block mb-1">Table header (12 / 16, uppercase, tracking 0.04em, weight 600, #5F6C79)</span>
            <p className="text-table-header">{t("orders")} &bull; {t("customer")} &bull; {t("total")} &bull; {t("status")} &bull; {t("actions")}</p>
          </div>

          <div className="pt-4">
            <span className="text-caption block mb-1">KPI number with Western tabular numerals (28 / 36, weight 600)</span>
            <div className="flex gap-8 items-baseline">
              <div>
                <p className="text-kpi-number tabular-nums">Rs 142,500</p>
                <span className="text-caption">{t("total")} Volume</span>
              </div>
              <div>
                <p className="text-kpi-number tabular-nums">184</p>
                <span className="text-caption">{t("orders")}</span>
              </div>
              <div>
                <p className="text-kpi-number tabular-nums">00:14:32</p>
                <span className="text-caption">{t("kitchen")} Time</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Colors Palette (Step 1.1) */}
      <section className="bg-white p-6 rounded-[12px] border border-[#E2E5E9] shadow-card space-y-4">
        <div>
          <h2 className="text-section-title">Core Color Palette (DESIGN.md Section 7.2)</h2>
          <p className="text-caption mt-1">Rule: 60% Soft White/White, 30% Midnight Blue, 10% Muted Gold accent</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {CORE_COLORS.map((c) => (
            <div
              key={c.hex}
              className={`p-3 rounded-lg flex flex-col justify-between h-28 ${
                c.border ? "border border-[#E2E5E9]" : ""
              }`}
              style={{ backgroundColor: c.hex }}
            >
              <div className="flex justify-between items-start">
                <span
                  className="font-semibold text-xs"
                  style={{ color: c.lightText ? "#F7F7F7" : "#10202D" }}
                >
                  {c.name}
                </span>
                <span
                  className="font-mono text-[11px] px-1 rounded"
                  style={{
                    backgroundColor: c.lightText ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.06)",
                    color: c.lightText ? "#F7F7F7" : "#10202D",
                  }}
                >
                  {c.hex}
                </span>
              </div>
              <p
                className="text-[11px] leading-tight mt-2 opacity-90 line-clamp-2"
                style={{ color: c.lightText ? "#A9B4BE" : "#5F6C79" }}
              >
                {c.use}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Status Colors (Step 1.1) */}
      <section className="bg-white p-6 rounded-[12px] border border-[#E2E5E9] shadow-card space-y-4">
        <div>
          <h2 className="text-section-title">Status Colors (DESIGN.md Section 7.2)</h2>
          <p className="text-caption mt-1">Muted background fill, high-contrast dark text, solid dot for icons</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {STATUS_COLORS.map((s) => (
            <div
              key={s.meaning}
              className="p-3 rounded-lg border border-[#E2E5E9] flex flex-col justify-between h-28"
              style={{ backgroundColor: s.fill }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full inline-block"
                    style={{ backgroundColor: s.solid }}
                  />
                  <span className="font-semibold text-xs" style={{ color: s.text }}>
                    {s.meaning}
                  </span>
                </div>
                <span className="font-mono text-[10px] text-[#5F6C79]">
                  {s.fill}
                </span>
              </div>
              <p className="text-[11px] leading-tight" style={{ color: s.text }}>
                {s.usedFor}
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
