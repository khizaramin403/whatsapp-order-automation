"use client";

import * as React from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  Plus,
  Folder,
  ChevronUp,
  ChevronDown,
  Edit2,
  Trash2,
  MoreVertical,
} from "lucide-react";
import type { MenuCategory, MenuItem } from "@app/shared";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CategoryDialog } from "./category-dialog";
import { getLocalizedName } from "@/lib/menu-utils";
import { useReorderCategory, useDeleteCategory } from "@/hooks/use-menu";
import { getApiErrorMessage } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface CategorySidebarProps {
  categories: MenuCategory[];
  items: MenuItem[];
  selectedCategoryId: string | null;
  onSelectCategory: (categoryId: string | null) => void;
}

export function CategorySidebar({
  categories,
  items,
  selectedCategoryId,
  onSelectCategory,
}: CategorySidebarProps) {
  const t = useTranslations("menu");
  const tCommon = useTranslations("common");
  const tErrors = useTranslations("errors");
  const locale = useLocale();

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingCategory, setEditingCategory] = React.useState<MenuCategory | null>(null);
  const [deletingCategory, setDeletingCategory] = React.useState<MenuCategory | null>(null);

  const reorderMutation = useReorderCategory();
  const deleteMutation = useDeleteCategory();

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (category: MenuCategory) => {
    setEditingCategory(category);
    setDialogOpen(true);
  };

  const handleReorder = async (id: string, direction: "up" | "down") => {
    try {
      await reorderMutation.mutateAsync({ id, direction });
    } catch (err) {
      toast.error(getApiErrorMessage(err, tErrors));
    }
  };

  const handleDelete = async () => {
    if (!deletingCategory) return;
    try {
      await deleteMutation.mutateAsync(deletingCategory.id);
      toast.success(t("toasts.categoryDeleted"));
      if (selectedCategoryId === deletingCategory.id) {
        onSelectCategory(null);
      }
      setDeletingCategory(null);
    } catch (err) {
      toast.error(getApiErrorMessage(err, tErrors));
    }
  };

  const totalAllItems = items.length;

  return (
    <>
      <Card className="p-4 bg-white border-[#E2E5E9] rounded-[12px] shadow-xs flex flex-col gap-3">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-[#E2E5E9]">
          <div className="flex items-center gap-2">
            <Folder className="h-4 w-4 text-[#10202D]" />
            <h2 className="text-sm font-semibold text-[#10202D]">
              {t("categories")}
            </h2>
            <span className="text-xs font-semibold text-[#5F6C79] bg-[#ECEEF1] px-2 py-0.5 rounded-full">
              {categories.length}
            </span>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleOpenCreate}
            className="h-7 px-2.5 text-xs font-semibold rounded-[6px] gap-1"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>{t("newCategory")}</span>
          </Button>
        </div>

        {/* Categories List */}
        <div className="space-y-1">
          {/* All Categories Option */}
          <button
            type="button"
            onClick={() => onSelectCategory(null)}
            className={cn(
              "w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-[8px] transition-all text-start cursor-pointer",
              selectedCategoryId === null
                ? "bg-[#10202D] text-[#F7F7F7] shadow-xs"
                : "text-[#5F6C79] hover:bg-[#F2F4F6] hover:text-[#10202D]"
            )}
          >
            <span>{t("allCategories")}</span>
            <span
              className={cn(
                "px-2 py-0.5 rounded-full text-[11px]",
                selectedCategoryId === null
                  ? "bg-[#C7A667] text-[#10202D]"
                  : "bg-[#ECEEF1] text-[#5F6C79]"
              )}
            >
              {totalAllItems}
            </span>
          </button>

          {/* Category Rows */}
          {categories.map((category, index) => {
            const isSelected = selectedCategoryId === category.id;
            const categoryItemsCount = items.filter((it) => it.category_id === category.id).length;
            const categoryName = getLocalizedName(category, locale);
            const isFirst = index === 0;
            const isLast = index === categories.length - 1;

            return (
              <div
                key={category.id}
                className={cn(
                  "group flex items-center justify-between px-3 py-1.5 rounded-[8px] transition-all",
                  isSelected
                    ? "bg-[#F4ECDC] text-[#10202D] border border-[#C7A667]/40"
                    : "hover:bg-[#F2F4F6] text-[#10202D]"
                )}
              >
                {/* Category Button */}
                <button
                  type="button"
                  onClick={() => onSelectCategory(category.id)}
                  className="flex-1 flex items-center justify-between pe-2 text-xs font-medium text-start cursor-pointer truncate"
                >
                  <span className="truncate">{categoryName}</span>
                  <span
                    className={cn(
                      "ms-2 shrink-0 px-2 py-0.5 rounded-full text-[11px]",
                      isSelected
                        ? "bg-[#C7A667] text-[#10202D] font-semibold"
                        : "bg-[#ECEEF1] text-[#5F6C79]"
                    )}
                  >
                    {categoryItemsCount}
                  </span>
                </button>

                {/* Reorder and Actions */}
                <div className="flex items-center gap-0.5 opacity-80 group-hover:opacity-100 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleReorder(category.id, "up")}
                    disabled={isFirst || reorderMutation.isPending}
                    className="h-6 w-6 rounded flex items-center justify-center text-[#5F6C79] hover:text-[#10202D] hover:bg-white/80 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                    title={t("reorderUp")}
                    aria-label={t("reorderUp")}
                  >
                    <ChevronUp className="h-3.5 w-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleReorder(category.id, "down")}
                    disabled={isLast || reorderMutation.isPending}
                    className="h-6 w-6 rounded flex items-center justify-center text-[#5F6C79] hover:text-[#10202D] hover:bg-white/80 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                    title={t("reorderDown")}
                    aria-label={t("reorderDown")}
                  >
                    <ChevronDown className="h-3.5 w-3.5" />
                  </button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        className="h-6 w-6 rounded flex items-center justify-center text-[#5F6C79] hover:text-[#10202D] hover:bg-white/80 cursor-pointer"
                        aria-label={t("table.actions")}
                      >
                        <MoreVertical className="h-3.5 w-3.5" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-36 bg-white border-[#E2E5E9]">
                      <DropdownMenuItem
                        onClick={() => handleOpenEdit(category)}
                        className="text-xs cursor-pointer gap-2"
                      >
                        <Edit2 className="h-3.5 w-3.5 text-[#5F6C79]" />
                        <span>{t("editCategory")}</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setDeletingCategory(category)}
                        className="text-xs text-[#B3392F] hover:!text-[#B3392F] hover:!bg-[#F8E4E1] cursor-pointer gap-2"
                      >
                        <Trash2 className="h-3.5 w-3.5 text-[#B3392F]" />
                        <span>{t("deleteCategory")}</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Category Create/Edit Dialog */}
      <CategoryDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        category={editingCategory}
      />

      {/* Delete Category AlertDialog */}
      <AlertDialog
        open={Boolean(deletingCategory)}
        onOpenChange={(open) => !open && setDeletingCategory(null)}
      >
        <AlertDialogContent className="rounded-[12px] bg-white p-6 max-w-[420px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-semibold text-[#10202D]">
              {t("confirmDeleteCategoryTitle", {
                name: deletingCategory ? getLocalizedName(deletingCategory, locale) : "",
              })}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-[#5F6C79] pt-1">
              {t("confirmDeleteCategoryDesc")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="pt-3 gap-2 sm:gap-0">
            <AlertDialogCancel className="h-9 px-4 text-xs font-semibold rounded-[8px]">
              {tCommon("cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="h-9 px-4 text-xs font-semibold rounded-[8px] bg-[#B3392F] hover:bg-[#9C2F26] text-white"
            >
              {t("deleteCategory")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
