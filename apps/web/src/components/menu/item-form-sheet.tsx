"use client";

import * as React from "react";
import { useTranslations, useLocale } from "next-intl";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Upload,
  Image as ImageIcon,
  Check,
  AlertCircle,
  X,
} from "lucide-react";
import type { MenuItem, MenuCategory, MenuTranslation } from "@app/shared";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCreateMenuItem, useUpdateMenuItem } from "@/hooks/use-menu";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const ItemFormSchema = z.object({
  price: z
    .string()
    .min(1, "Price is required")
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "Price must be a positive number",
    }),
  category_id: z.string().min(1, "Category is required"),
  is_available: z.boolean(),
  image_url: z.string().nullable(),
  en: z.object({
    name: z.string().min(1, "English name is required"),
    description: z.string(),
    aliases: z.string(),
  }),
  ar: z.object({
    name: z.string(),
    description: z.string(),
    aliases: z.string(),
  }),
  ur: z.object({
    name: z.string(),
    description: z.string(),
    aliases: z.string(),
  }),
});

function getTranslationId(
  existingTranslations: MenuTranslation[] | undefined,
  lang: "en" | "ar" | "ur-Latn"
): string {
  const match = existingTranslations?.find((tr) => tr.language === lang);
  return match?.id || `trans-item-${lang}`;
}

type ItemFormData = z.infer<typeof ItemFormSchema>;

interface ItemFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: MenuItem | null;
  categories: MenuCategory[];
}

function ItemFormContent({
  item,
  categories,
  onClose,
}: {
  item?: MenuItem | null;
  categories: MenuCategory[];
  onClose: () => void;
}) {
  const t = useTranslations("menu");
  const locale = useLocale();
  const isEditing = Boolean(item);

  const createMutation = useCreateMenuItem();
  const updateMutation = useUpdateMenuItem();

  const [activeTab, setActiveTab] = React.useState<"en" | "ar" | "ur">("en");
  const [previewImage, setPreviewImage] = React.useState<string | null>(item?.image_url ?? null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Compute initial form data from props
  const defaultValues: ItemFormData = React.useMemo(() => {
    if (item) {
      const enTrans = item.translations?.find((tr) => tr.language === "en");
      const arTrans = item.translations?.find((tr) => tr.language === "ar");
      const urTrans = item.translations?.find((tr) => tr.language === "ur-Latn");

      return {
        price: (item.price / 100).toString(),
        category_id: item.category_id,
        is_available: item.is_available,
        image_url: item.image_url,
        en: {
          name: enTrans?.name || item.name || "",
          description: enTrans?.description || "",
          aliases: enTrans?.aliases ? enTrans.aliases.join(", ") : "",
        },
        ar: {
          name: arTrans?.name || "",
          description: arTrans?.description || "",
          aliases: arTrans?.aliases ? arTrans.aliases.join(", ") : "",
        },
        ur: {
          name: urTrans?.name || "",
          description: urTrans?.description || "",
          aliases: urTrans?.aliases ? urTrans.aliases.join(", ") : "",
        },
      };
    }

    return {
      price: "",
      category_id: categories[0]?.id || "",
      is_available: true,
      image_url: null,
      en: { name: "", description: "", aliases: "" },
      ar: { name: "", description: "", aliases: "" },
      ur: { name: "", description: "", aliases: "" },
    };
  }, [item, categories]);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<ItemFormData>({
    resolver: zodResolver(ItemFormSchema),
    defaultValues,
  });

  // Watch translation fields with useWatch hook
  const enName = useWatch({ control, name: "en.name" });
  const arName = useWatch({ control, name: "ar.name" });
  const urName = useWatch({ control, name: "ur.name" });
  const isAvailableValue = useWatch({ control, name: "is_available" });

  const isEnMissing = !enName?.trim();
  const isArMissing = !arName?.trim();
  const isUrMissing = !urName?.trim();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewImage(url);
      setValue("image_url", url);
    }
  };

  const handleRemoveImage = () => {
    setPreviewImage(null);
    setValue("image_url", null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const onSubmit = async (data: ItemFormData) => {
    const priceMinorUnits = Math.round(Number(data.price) * 100);
    const parseAliases = (raw: string) =>
      raw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

    const translations: MenuTranslation[] = [
      {
        id: getTranslationId(item?.translations, "en"),
        restaurant_id: item?.restaurant_id || "rest-01",
        entity_type: "item",
        entity_id: item?.id || "temp",
        language: "en",
        name: data.en.name.trim(),
        description: data.en.description.trim() || null,
        aliases: parseAliases(data.en.aliases),
      },
      {
        id: getTranslationId(item?.translations, "ar"),
        restaurant_id: item?.restaurant_id || "rest-01",
        entity_type: "item",
        entity_id: item?.id || "temp",
        language: "ar",
        name: data.ar.name.trim() || data.en.name.trim(), // fallback to English if blank
        description: data.ar.description.trim() || data.en.description.trim() || null,
        aliases: parseAliases(data.ar.aliases),
      },
      {
        id: getTranslationId(item?.translations, "ur-Latn"),
        restaurant_id: item?.restaurant_id || "rest-01",
        entity_type: "item",
        entity_id: item?.id || "temp",
        language: "ur-Latn",
        name: data.ur.name.trim() || data.en.name.trim(), // fallback to English if blank
        description: data.ur.description.trim() || data.en.description.trim() || null,
        aliases: parseAliases(data.ur.aliases),
      },
    ];

    try {
      if (isEditing && item) {
        await updateMutation.mutateAsync({
          id: item.id,
          data: {
            category_id: data.category_id,
            price: priceMinorUnits,
            image_url: data.image_url,
            is_available: data.is_available,
            name: data.en.name.trim(),
            translations,
          },
        });
        toast.success(t("toasts.itemUpdated"));
      } else {
        await createMutation.mutateAsync({
          category_id: data.category_id,
          price: priceMinorUnits,
          image_url: data.image_url,
          is_available: data.is_available,
          sort_order: 1,
          name: data.en.name.trim(),
          translations,
        });
        toast.success(t("toasts.itemCreated"));
      }
      onClose();
    } catch {
      toast.error(t("error.title"));
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <SheetContent
      side={locale === "ar" ? "left" : "right"}
      className="w-full sm:max-w-[480px] sm:w-[480px] p-0 flex flex-col bg-white overflow-hidden shadow-overlay border-[#E2E5E9]"
    >
      {/* Header */}
      <SheetHeader className="p-6 pb-4 border-b border-[#E2E5E9]">
        <SheetTitle className="text-lg font-semibold text-[#10202D]">
          {isEditing ? t("form.editItemTitle") : t("form.addItemTitle")}
        </SheetTitle>
        <SheetDescription className="text-xs text-[#5F6C79]">
          {t("subtitle")}
        </SheetDescription>
      </SheetHeader>

      {/* Form Body */}
      <form
        id="item-form"
        onSubmit={handleSubmit(onSubmit)}
        className="flex-1 overflow-y-auto p-6 space-y-6 [scrollbar-width:thin]"
      >
        {/* Section 1: Core Fields (Price, Category, Availability) */}
        <div className="space-y-4">
          <h3 className="text-xs font-semibold text-[#5F6C79] uppercase tracking-wider">
            {t("form.general")}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Price */}
            <div className="space-y-1.5">
              <Label htmlFor="item-price" className="text-xs font-semibold text-[#10202D]">
                {t("form.price", { currency: "Rs" })} <span className="text-[#B3392F]">*</span>
              </Label>
              <Input
                id="item-price"
                type="number"
                step="1"
                placeholder="e.g. 580"
                {...register("price")}
                className={cn(
                  "h-10 text-sm rounded-[8px] border-[#D5DAE0] focus-visible:ring-[#10202D]",
                  errors.price && "border-[#B3392F]"
                )}
              />
              {errors.price && (
                <p className="text-[11px] text-[#B3392F]">{errors.price.message}</p>
              )}
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <Label htmlFor="item-category" className="text-xs font-semibold text-[#10202D]">
                {t("form.category")} <span className="text-[#B3392F]">*</span>
              </Label>
              <Controller
                name="category_id"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger
                      id="item-category"
                      className={cn(
                        "h-10 text-sm rounded-[8px] border-[#D5DAE0]",
                        errors.category_id && "border-[#B3392F]"
                      )}
                    >
                      <SelectValue placeholder={t("form.selectCategory")} />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-[#E2E5E9]">
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id} className="text-xs">
                          {cat.translations?.find((tr) => tr.language === locale)?.name ||
                            cat.name ||
                            cat.id}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.category_id && (
                <p className="text-[11px] text-[#B3392F]">{errors.category_id.message}</p>
              )}
            </div>
          </div>

          {/* Availability Switch */}
          <div className="flex items-center justify-between p-3 rounded-[8px] bg-[#F7F7F7] border border-[#E2E5E9]">
            <div className="space-y-0.5">
              <Label htmlFor="item-available" className="text-xs font-semibold text-[#10202D]">
                {t("form.isAvailable")}
              </Label>
              <p className="text-[11px] text-[#5F6C79]">
                {isAvailableValue
                  ? t("toasts.availableSuccess", { name: "" }).replace(/["\s]/g, " ")
                  : t("toasts.unavailableSuccess", { name: "" }).replace(/["\s]/g, " ")}
              </p>
            </div>
            <Controller
              name="is_available"
              control={control}
              render={({ field }) => (
                <Switch
                  id="item-available"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
          </div>

          {/* Photo / Image Preview */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-[#10202D]">
              {t("form.image")}
            </Label>
            <div className="flex items-center gap-3">
              <div className="h-16 w-16 rounded-[8px] border border-[#E2E5E9] bg-[#ECEEF1] flex items-center justify-center overflow-hidden shrink-0">
                {previewImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={previewImage}
                    alt="Item preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <ImageIcon className="h-6 w-6 text-[#A9B4BE]" />
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="h-8 px-3 text-xs font-semibold rounded-[6px] gap-1.5"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    <span>{previewImage ? t("form.changeImage") : t("form.uploadImage")}</span>
                  </Button>

                  {previewImage && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleRemoveImage}
                      className="h-8 px-2 text-xs text-[#B3392F] hover:bg-[#F8E4E1] rounded-[6px]"
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
                <p className="text-[11px] text-[#5F6C79]">
                  PNG, JPG or WebP (preview upload only)
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Language Tabs (English, Arabic, Roman Urdu) */}
        <div className="space-y-3 pt-2 border-t border-[#E2E5E9]">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-[#5F6C79] uppercase tracking-wider">
              {t("form.translations")}
            </h3>
          </div>

          <p className="text-[11px] text-[#5F6C79]">
            {t("form.fallbackNotice")}
          </p>

          <Tabs
            value={activeTab}
            onValueChange={(val) => setActiveTab(val as "en" | "ar" | "ur")}
            className="w-full"
          >
            <TabsList className="grid grid-cols-3 w-full bg-[#ECEEF1] p-1 rounded-[8px]">
              {/* English Tab Trigger */}
              <TabsTrigger
                value="en"
                className="text-xs font-semibold py-1.5 rounded-[6px] flex items-center justify-center gap-1.5 data-[state=active]:bg-white data-[state=active]:text-[#10202D] data-[state=active]:shadow-xs"
              >
                <span>{t("form.tabEn")}</span>
                {isEnMissing ? (
                  <AlertCircle className="h-3 w-3 text-[#B3392F]" />
                ) : (
                  <Check className="h-3 w-3 text-[#2F7D5B]" />
                )}
              </TabsTrigger>

              {/* Arabic Tab Trigger */}
              <TabsTrigger
                value="ar"
                className="text-xs font-semibold py-1.5 rounded-[6px] flex items-center justify-center gap-1.5 data-[state=active]:bg-white data-[state=active]:text-[#10202D] data-[state=active]:shadow-xs"
              >
                <span>{t("form.tabAr")}</span>
                {isArMissing ? (
                  <span
                    className="px-1.5 py-0.2 rounded-full text-[9px] bg-[#FBF0DA] text-[#7A4E0B]"
                    title={t("form.missingTranslation")}
                  >
                    !
                  </span>
                ) : (
                  <Check className="h-3 w-3 text-[#2F7D5B]" />
                )}
              </TabsTrigger>

              {/* Roman Urdu Tab Trigger */}
              <TabsTrigger
                value="ur"
                className="text-xs font-semibold py-1.5 rounded-[6px] flex items-center justify-center gap-1.5 data-[state=active]:bg-white data-[state=active]:text-[#10202D] data-[state=active]:shadow-xs"
              >
                <span>{t("form.tabUr")}</span>
                {isUrMissing ? (
                  <span
                    className="px-1.5 py-0.2 rounded-full text-[9px] bg-[#FBF0DA] text-[#7A4E0B]"
                    title={t("form.missingTranslation")}
                  >
                    !
                  </span>
                ) : (
                  <Check className="h-3 w-3 text-[#2F7D5B]" />
                )}
              </TabsTrigger>
            </TabsList>

            {/* Tab 1: English */}
            <TabsContent value="en" className="space-y-3 pt-3">
              <div className="space-y-1.5">
                <Label htmlFor="en-name" className="text-xs font-semibold text-[#10202D]">
                  {t("form.nameLabel")} (English) <span className="text-[#B3392F]">*</span>
                </Label>
                <Input
                  id="en-name"
                  placeholder={t("form.namePlaceholderEn")}
                  {...register("en.name")}
                  className={cn(
                    "h-10 text-sm rounded-[8px] border-[#D5DAE0] focus-visible:ring-[#10202D]",
                    errors.en?.name && "border-[#B3392F]"
                  )}
                />
                {errors.en?.name && (
                  <p className="text-[11px] text-[#B3392F]">{errors.en.name.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="en-desc" className="text-xs font-semibold text-[#10202D]">
                  {t("form.descLabel")} (English)
                </Label>
                <Input
                  id="en-desc"
                  placeholder={t("form.descPlaceholder")}
                  {...register("en.description")}
                  className="h-10 text-sm rounded-[8px] border-[#D5DAE0] focus-visible:ring-[#10202D]"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="en-aliases" className="text-xs font-semibold text-[#10202D]">
                  {t("form.aliasesLabel")} (English)
                </Label>
                <Input
                  id="en-aliases"
                  placeholder={t("form.aliasesPlaceholder")}
                  {...register("en.aliases")}
                  className="h-10 text-sm rounded-[8px] border-[#D5DAE0] focus-visible:ring-[#10202D]"
                />
                <p className="text-[10px] text-[#5F6C79]">{t("form.aliasesHelper")}</p>
              </div>
            </TabsContent>

            {/* Tab 2: Arabic (with dir="rtl") */}
            <TabsContent value="ar" className="space-y-3 pt-3">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="ar-name" className="text-xs font-semibold text-[#10202D]">
                    {t("form.nameLabel")} (العربية)
                  </Label>
                  {isArMissing && (
                    <span className="text-[10px] text-[#7A4E0B] bg-[#FBF0DA] px-1.5 py-0.5 rounded-full">
                      {t("form.missingTranslation")}
                    </span>
                  )}
                </div>
                <Input
                  id="ar-name"
                  dir="rtl"
                  placeholder={t("form.namePlaceholderAr")}
                  {...register("ar.name")}
                  className="h-10 text-sm rounded-[8px] border-[#D5DAE0] text-start focus-visible:ring-[#10202D]"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="ar-desc" className="text-xs font-semibold text-[#10202D]">
                  {t("form.descLabel")} (العربية)
                </Label>
                <Input
                  id="ar-desc"
                  dir="rtl"
                  placeholder="صف المكونات أو طريقة التحضير..."
                  {...register("ar.description")}
                  className="h-10 text-sm rounded-[8px] border-[#D5DAE0] text-start focus-visible:ring-[#10202D]"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="ar-aliases" className="text-xs font-semibold text-[#10202D]">
                  {t("form.aliasesLabel")} (العربية)
                </Label>
                <Input
                  id="ar-aliases"
                  dir="rtl"
                  placeholder="مثال: برياني، ارز، برياني دجاج"
                  {...register("ar.aliases")}
                  className="h-10 text-sm rounded-[8px] border-[#D5DAE0] text-start focus-visible:ring-[#10202D]"
                />
                <p className="text-[10px] text-[#5F6C79]">{t("form.aliasesHelper")}</p>
              </div>
            </TabsContent>

            {/* Tab 3: Roman Urdu */}
            <TabsContent value="ur" className="space-y-3 pt-3">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="ur-name" className="text-xs font-semibold text-[#10202D]">
                    {t("form.nameLabel")} (Roman Urdu)
                  </Label>
                  {isUrMissing && (
                    <span className="text-[10px] text-[#7A4E0B] bg-[#FBF0DA] px-1.5 py-0.5 rounded-full">
                      {t("form.missingTranslation")}
                    </span>
                  )}
                </div>
                <Input
                  id="ur-name"
                  placeholder={t("form.namePlaceholderUr")}
                  {...register("ur.name")}
                  className="h-10 text-sm rounded-[8px] border-[#D5DAE0] focus-visible:ring-[#10202D]"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="ur-desc" className="text-xs font-semibold text-[#10202D]">
                  {t("form.descLabel")} (Roman Urdu)
                </Label>
                <Input
                  id="ur-desc"
                  placeholder="e.g. Lazeez chawal aur murgh ka pakwaan..."
                  {...register("ur.description")}
                  className="h-10 text-sm rounded-[8px] border-[#D5DAE0] focus-visible:ring-[#10202D]"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="ur-aliases" className="text-xs font-semibold text-[#10202D]">
                  {t("form.aliasesLabel")} (Roman Urdu)
                </Label>
                <Input
                  id="ur-aliases"
                  placeholder={t("form.aliasesPlaceholder")}
                  {...register("ur.aliases")}
                  className="h-10 text-sm rounded-[8px] border-[#D5DAE0] focus-visible:ring-[#10202D]"
                />
                <p className="text-[10px] text-[#5F6C79]">{t("form.aliasesHelper")}</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </form>

      {/* Footer */}
      <SheetFooter className="p-4 border-t border-[#E2E5E9] bg-[#F7F7F7] flex items-center justify-end gap-2">
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
          form="item-form"
          variant="primary"
          disabled={isPending}
          className="h-9 px-4 text-xs font-semibold rounded-[8px] bg-[#C7A667] text-[#10202D] hover:bg-[#B5964F] active:bg-[#A3853F]"
        >
          {isPending
            ? isEditing
              ? t("form.saving")
              : t("form.creating")
            : isEditing
            ? t("form.save")
            : t("addItem")}
        </Button>
      </SheetFooter>
    </SheetContent>
  );
}

export function ItemFormSheet({
  open,
  onOpenChange,
  item,
  categories,
}: ItemFormSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {open && (
        <ItemFormContent
          key={item?.id ?? "new"}
          item={item}
          categories={categories}
          onClose={() => onOpenChange(false)}
        />
      )}
    </Sheet>
  );
}
