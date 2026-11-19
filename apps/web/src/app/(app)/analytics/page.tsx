import { getTranslations } from "next-intl/server";

export default async function AnalyticsPage() {
  const t = await getTranslations("pages");
  return (
    <div className="space-y-4">
      <h1 className="text-page-title">{t("analytics")}</h1>
      <p className="text-caption text-[#5F6C79]">Placeholder for analytics & charts (Phase 2)</p>
    </div>
  );
}
