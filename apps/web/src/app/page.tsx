import { BRAND_NAME } from "@/config/brand";

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

export default function Home() {
  return (
    <main className="min-h-screen p-8 max-w-6xl mx-auto space-y-12">
      {/* Header with Brand wordmark */}
      <header className="border-b border-[#E2E5E9] pb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="font-brand text-2xl font-semibold text-[#10202D]">
            {BRAND_NAME}
          </span>
          <span className="text-xs uppercase tracking-wider font-semibold text-[#5F6C79] bg-[#ECEEF1] px-3 py-1 rounded-full">
            Design Tokens & Typography Spec
          </span>
        </div>
        <p className="text-sm text-[#4A5865]">
          Phase 1, Step 1.1 verification page based on DESIGN.md (docs/design/design-page-07.png &amp; 08.png)
        </p>
      </header>

      {/* Typography scale */}
      <section className="bg-white p-6 rounded-[12px] border border-[#E2E5E9] shadow-card space-y-6">
        <h2 className="text-section-title">Typography Scale (DESIGN.md Section 7.4)</h2>
        <div className="space-y-4 divide-y divide-[#E2E5E9]">
          <div className="pt-2">
            <span className="text-caption block mb-1">Login heading (Playfair Display 34 / 40, weight 600)</span>
            <p className="text-login-heading">Welcome back to {BRAND_NAME}</p>
          </div>

          <div className="pt-4">
            <span className="text-caption block mb-1">Page title (Inter 24 / 32, weight 600, #10202D)</span>
            <p className="text-page-title">Orders Dashboard Overview</p>
          </div>

          <div className="pt-4">
            <span className="text-caption block mb-1">Section title (Inter 18 / 28, weight 600, #10202D)</span>
            <p className="text-section-title">Active Orders &amp; Kitchen Flow</p>
          </div>

          <div className="pt-4">
            <span className="text-caption block mb-1">Card title (Inter 16 / 24, weight 600, #10202D)</span>
            <p className="text-card-title">Order #1042 - 2x Biryani, 1x Raita</p>
          </div>

          <div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-caption block mb-1">Body text primary (Inter 14 / 20, weight 400, #10202D)</span>
              <p className="text-body-primary">
                Customer confirmed order via WhatsApp bot. Delivery destination marked at Block 4, Clifton.
              </p>
            </div>
            <div>
              <span className="text-caption block mb-1">Body text secondary (Inter 14 / 20, weight 400, #4A5865)</span>
              <p className="text-body-secondary">
                Estimated kitchen preparation time is 18 minutes. Payment method: Cash on delivery.
              </p>
            </div>
          </div>

          <div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-caption block mb-1">Form label (Inter 13 / 18, weight 500, #10202D)</span>
              <p className="text-form-label">Customer Mobile Number *</p>
            </div>
            <div>
              <span className="text-caption block mb-1">Caption and helper (Inter 12 / 16, weight 400, #5F6C79)</span>
              <p className="text-caption">Must include country code (e.g. +92 300 1234567)</p>
            </div>
          </div>

          <div className="pt-4">
            <span className="text-caption block mb-1">Table header (Inter 12 / 16, uppercase, tracking 0.04em, weight 600, #5F6C79)</span>
            <p className="text-table-header">ORDER ID &bull; CUSTOMER &bull; ITEMS &bull; TOTAL &bull; STATUS &bull; TIME</p>
          </div>

          <div className="pt-4">
            <span className="text-caption block mb-1">KPI number with tabular numerals (Inter 28 / 36, weight 600, #10202D)</span>
            <div className="flex gap-8 items-baseline">
              <div>
                <p className="text-kpi-number">Rs 142,500</p>
                <span className="text-caption">Today&apos;s Gross Volume</span>
              </div>
              <div>
                <p className="text-kpi-number">184</p>
                <span className="text-caption">Total Orders</span>
              </div>
              <div>
                <p className="text-kpi-number tabular-nums">00:14:32</p>
                <span className="text-caption">Avg Prep Time</span>
              </div>
            </div>
          </div>

          <div className="pt-4">
            <span className="text-caption block mb-1">Arabic Typography Sample (IBM Plex Sans Arabic, lang=&quot;ar&quot;)</span>
            <div lang="ar" dir="rtl" className="font-arabic space-y-1 bg-[#F7F7F7] p-4 rounded-lg border border-[#E2E5E9]">
              <p className="text-page-title">لوحة التحكم في الطلبات - {BRAND_NAME}</p>
              <p className="text-body-primary">تم استلام طلب جديد عبر واتساب ويتم تحضيره في المطبخ الآن.</p>
              <p className="text-kpi-number">12,500 ر.س</p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Colors Palette */}
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

      {/* Status Colors */}
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

      {/* Spacing, Radius and Shadows preview */}
      <section className="bg-white p-6 rounded-[12px] border border-[#E2E5E9] shadow-card space-y-4">
        <h2 className="text-section-title">Spacing, Radius &amp; Elevation (Section 7.5)</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-[#10202D]">
          <div className="p-4 bg-[#F7F7F7] border border-[#E2E5E9] rounded-[8px]">
            <span className="font-semibold block mb-1">Inputs &amp; Buttons Radius (8px)</span>
            <p className="text-[#5F6C79]">Radius: 0.5rem (8px)</p>
          </div>
          <div className="p-4 bg-[#F7F7F7] border border-[#E2E5E9] rounded-[12px] shadow-card">
            <span className="font-semibold block mb-1">Cards &amp; Dialogs (12px)</span>
            <p className="text-[#5F6C79]">Shadow: 0 1px 2px rgba(16,32,45,0.06)</p>
          </div>
          <div className="p-4 bg-[#F7F7F7] border border-[#E2E5E9] rounded-full text-center">
            <span className="font-semibold block mb-1">Badges &amp; Avatars</span>
            <p className="text-[#5F6C79]">Fully rounded pill / circular</p>
          </div>
        </div>
      </section>
    </main>
  );
}
