"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import type { MenuCategory, MenuTranslation } from "@app/shared";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useCreateCategory, useUpdateCategory } from "@/hooks/use-menu";

interface CategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: MenuCategory | null;
}

function getCatTranslationId(
  existingTranslations: MenuTranslation[] | undefined,
  lang: "en" | "ar" | "ur-Latn"
): string {
  const match = existingTranslations?.find((tr) => tr.language === lang);
  return match?.id || `trans-cat-${lang}`;
}

function CategoryDialogInner({
  category,
  onClose,
}: {
  category?: MenuCategory | null;
  onClose: () => void;
}) {
  const t = useTranslations("menu");
  const isEditing = Boolean(category);

  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();

  const initialEn = category?.translations?.find((t) => t.language === "en")?.name || category?.name || "";
  const initialAr = category?.translations?.find((t) => t.language === "ar")?.name || "";
  const initialUr = category?.translations?.find((t) => t.language === "ur-Latn")?.name || "";

  const [nameEn, setNameEn] = React.useState(initialEn);
  const [nameAr, setNameAr] = React.useState(initialAr);
  const [nameUr, setNameUr] = React.useState(initialUr);
  const [error, setError] = React.useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameEn.trim()) {
      setError(t("form.nameLabel") + " is required");
      return;
    }

    const translations: MenuTranslation[] = [
      {
        id: getCatTranslationId(category?.translations, "en"),
        restaurant_id: category?.restaurant_id || "rest-01",
        entity_type: "category",
        entity_id: category?.id || "temp",
        language: "en",
        name: nameEn.trim(),
        description: null,
        aliases: [],
      },
      {
        id: getCatTranslationId(category?.translations, "ar"),
        restaurant_id: category?.restaurant_id || "rest-01",
        entity_type: "category",
        entity_id: category?.id || "temp",
        language: "ar",
        name: nameAr.trim() || nameEn.trim(),
        description: null,
        aliases: [],
      },
      {
        id: getCatTranslationId(category?.translations, "ur-Latn"),
        restaurant_id: category?.restaurant_id || "rest-01",
        entity_type: "category",
        entity_id: category?.id || "temp",
        language: "ur-Latn",
        name: nameUr.trim() || nameEn.trim(),
        description: null,
        aliases: [],
      },
    ];

    try {
      if (isEditing && category) {
        await updateMutation.mutateAsync({
          id: category.id,
          data: {
            name: nameEn.trim(),
            translations,
          },
        });
        toast.success(t("toasts.categoryUpdated"));
      } else {
        await createMutation.mutateAsync({
          name: nameEn.trim(),
          translations,
        });
        toast.success(t("toasts.categoryCreated"));
      }
      onClose();
    } catch {
      toast.error(t("error.title"));
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <DialogContent className="sm:max-w-[440px] rounded-[12px] bg-white p-6">
      <DialogHeader>
        <DialogTitle className="text-base font-semibold text-[#10202D]">
          {isEditing ? t("editCategory") : t("newCategory")}
        </DialogTitle>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        {/* English Name (Required) */}
        <div className="space-y-1.5">
          <Label htmlFor="cat-name-en" className="text-xs font-semibold text-[#10202D]">
            {t("categoryNameEn")} <span className="text-[#B3392F]">*</span>
          </Label>
          <Input
            id="cat-name-en"
            value={nameEn}
            onChange={(e) => {
              setNameEn(e.target.value);
              if (error) setError("");
            }}
            placeholder="e.g. Main Dishes"
            className="h-10 text-sm rounded-[8px] border-[#D5DAE0] focus-visible:ring-[#10202D]"
            autoFocus
          />
          {error && <p className="text-xs text-[#B3392F]">{error}</p>}
        </div>

        {/* Arabic Name */}
        <div className="space-y-1.5">
          <Label htmlFor="cat-name-ar" className="text-xs font-semibold text-[#10202D]">
            {t("categoryNameAr")}
          </Label>
          <Input
            id="cat-name-ar"
            value={nameAr}
            onChange={(e) => setNameAr(e.target.value)}
            placeholder="مثال: الأطباق الرئيسية"
            dir="rtl"
            className="h-10 text-sm rounded-[8px] border-[#D5DAE0] text-start focus-visible:ring-[#10202D]"
          />
        </div>

        {/* Roman Urdu Name */}
        <div className="space-y-1.5">
          <Label htmlFor="cat-name-ur" className="text-xs font-semibold text-[#10202D]">
            {t("categoryNameUr")}
          </Label>
          <Input
            id="cat-name-ur"
            value={nameUr}
            onChange={(e) => setNameUr(e.target.value)}
            placeholder="e.g. Khaas Pakwaan"
            className="h-10 text-sm rounded-[8px] border-[#D5DAE0] focus-visible:ring-[#10202D]"
          />
        </div>

        <DialogFooter className="pt-2 gap-2 sm:gap-0">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isPending}
            className="h-9 px-4 text-xs font-semibold rounded-[8px]"
          >
            {t("pagination.previous") === "Previous" ? "Cancel" : "إلغاء"}
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isPending}
            className="h-9 px-4 text-xs font-semibold rounded-[8px]"
          >
            {isPending ? "..." : isEditing ? t("form.save") : t("newCategory")}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

export function CategoryDialog({
  open,
  onOpenChange,
  category,
}: CategoryDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open && (
        <CategoryDialogInner
          key={category?.id ?? "new"}
          category={category}
          onClose={() => onOpenChange(false)}
        />
      )}
    </Dialog>
  );
}
