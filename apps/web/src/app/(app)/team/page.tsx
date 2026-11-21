import { getTranslations } from "next-intl/server";

export default async function TeamPage() {
  const t = await getTranslations("pages");
  return (
    <div className="space-y-4">
      <h1 className="text-page-title">{t("team")}</h1>
      <p className="text-caption text-[#5F6C79]">{t("placeholders.team")}</p>
    </div>
  );
}
