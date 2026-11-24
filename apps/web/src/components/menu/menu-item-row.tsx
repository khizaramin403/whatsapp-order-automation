"use client";

import * as React from "react";
import { useTranslations, useLocale } from "next-intl";
import { MoreVertical, Edit2, Trash2, Image as ImageIcon } from "lucide-react";
import type { MenuItem, MenuCategory } from "@app/shared";
import { formatMoney } from "@app/shared";
import { TableRow, TableCell } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getLocalizedName, getLocalizedDescription } from "@/lib/menu-utils";
import { useSetItemAvailability } from "@/hooks/use-menu";
import { getApiErrorMessage, ApiError } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface MenuItemRowProps {
  item: MenuItem;
  category?: MenuCategory;
  currency?: string;
  onEdit: (item: MenuItem) => void;
  onDelete: (item: MenuItem) => void;
}

export const MenuItemRow = React.memo(function MenuItemRow({
  item,
  category,
  currency = "PKR",
  onEdit,
  onDelete,
}: MenuItemRowProps) {
  const t = useTranslations("menu");
  const tErrors = useTranslations("errors");
  const locale = useLocale();

  const availabilityMutation = useSetItemAvailability();

  const itemName = getLocalizedName(item, locale);
  const itemDesc = getLocalizedDescription(item, locale);
  const categoryName = category ? getLocalizedName(category, locale) : "";

  // English name for subtitle reference if current locale is not English
  const enName = item.translations?.find((t) => t.language === "en")?.name;
  const showEnSubtitle = locale !== "en" && enName && enName !== itemName;

  const handleToggleAvailability = async (checked: boolean) => {
    try {
      await availabilityMutation.mutateAsync({
        id: item.id,
        is_available: checked,
      });

      if (checked) {
        toast.success(t("toasts.availableSuccess", { name: itemName }));
      } else {
        toast.success(t("toasts.unavailableSuccess", { name: itemName }));
      }
    } catch (err) {
      if (err instanceof ApiError && err.code !== "INTERNAL_SERVER_ERROR") {
        toast.error(getApiErrorMessage(err, tErrors));
      } else {
        toast.error(t("toasts.availabilityFailed"));
      }
    }
  };

  return (
    <TableRow className="hover:bg-[#F2F4F6] transition-colors border-b border-[#E2E5E9]">
      {/* 1. Image Thumbnail */}
      <TableCell className="w-16 py-3 ps-4">
        <div className="h-12 w-12 rounded-[8px] border border-[#E2E5E9] bg-[#ECEEF1] overflow-hidden flex items-center justify-center shrink-0">
          {item.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.image_url}
              alt={itemName}
              className="h-full w-full object-cover"
            />
          ) : (
            <ImageIcon className="h-5 w-5 text-[#A9B4BE]" />
          )}
        </div>
      </TableCell>

      {/* 2. Item Name & Details */}
      <TableCell className="py-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-[#10202D]">{itemName}</span>
            {showEnSubtitle && (
              <span className="text-xs text-[#5F6C79] font-normal">({enName})</span>
            )}
          </div>
          {itemDesc && (
            <p className="text-xs text-[#5F6C79] line-clamp-1 max-w-[280px] sm:max-w-md">
              {itemDesc}
            </p>
          )}
        </div>
      </TableCell>

      {/* 3. Category */}
      <TableCell className="py-3 hidden sm:table-cell">
        {categoryName ? (
          <Badge
            variant="outline"
            className="text-xs font-normal border-[#E2E5E9] text-[#5F6C79] bg-[#ECEEF1]/60"
          >
            {categoryName}
          </Badge>
        ) : (
          <span className="text-xs text-[#A9B4BE]">—</span>
        )}
      </TableCell>

      {/* 4. Price (Formatted with Intl) */}
      <TableCell className="py-3 font-semibold text-sm text-[#10202D] whitespace-nowrap">
        {formatMoney(item.price, currency, locale === "ar" ? "ar-PK" : "en-PK")}
      </TableCell>

      {/* 5. Availability Switch */}
      <TableCell className="py-3">
        <div className="flex items-center gap-2">
          <Switch
            checked={item.is_available}
            onCheckedChange={handleToggleAvailability}
            disabled={availabilityMutation.isPending}
            aria-label={t("table.availability")}
          />
          <span
            className={cn(
              "text-xs hidden md:inline font-medium",
              item.is_available ? "text-[#1F5C42]" : "text-[#5F6C79]"
            )}
          >
            {item.is_available ? t("table.availability") : "—"}
          </span>
        </div>
      </TableCell>

      {/* 6. Actions */}
      <TableCell className="py-3 pe-4 text-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="h-8 w-8 rounded-[6px] inline-flex items-center justify-center text-[#5F6C79] hover:text-[#10202D] hover:bg-white transition-colors cursor-pointer"
              aria-label={t("table.actions")}
            >
              <MoreVertical className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-36 bg-white border-[#E2E5E9]">
            <DropdownMenuItem
              onClick={() => onEdit(item)}
              className="text-xs cursor-pointer gap-2"
            >
              <Edit2 className="h-3.5 w-3.5 text-[#5F6C79]" />
              <span>{t("editItem")}</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(item)}
              className="text-xs text-[#B3392F] hover:!text-[#B3392F] hover:!bg-[#F8E4E1] cursor-pointer gap-2"
            >
              <Trash2 className="h-3.5 w-3.5 text-[#B3392F]" />
              <span>{t("deleteItem")}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
});
