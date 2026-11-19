import { getTranslations } from "next-intl/server";

export default async function KitchenPage() {
  const t = await getTranslations("pages");
  return (
    <div className="space-y-4">
      <h1 className="text-page-title">{t("kitchen")}</h1>
      <p className="text-caption text-[#5F6C79]">Placeholder for kitchen screen (Phase 2)</p>
    </div>
  );
}
