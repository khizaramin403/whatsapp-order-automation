"use client";

import * as React from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  Search,
  Plus,
  RefreshCw,
  AlertTriangle,
  UtensilsCrossed,
  Bug,
} from "lucide-react";
import type { MenuItem } from "@app/shared";
import { useMenu, useDeleteMenuItem } from "@/hooks/use-menu";
import { useSettings } from "@/hooks/use-settings";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { CategorySidebar } from "./category-sidebar";
import { MenuItemRow } from "./menu-item-row";
import { ItemFormSheet } from "./item-form-sheet";
import { getLocalizedName } from "@/lib/menu-utils";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 20;

export function MenuManagement() {
  const t = useTranslations("menu");
  const locale = useLocale();

  // Queries
  const { data: menuData, isLoading, isError, error, refetch } = useMenu();
  const { data: settings } = useSettings();
  const currency = settings?.currency || "PKR";

  // State
  const [selectedCategoryId, setSelectedCategoryId] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [currentPage, setCurrentPage] = React.useState(1);

  // Sheet & Dialog state
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<MenuItem | null>(null);
  const [deletingItem, setDeletingItem] = React.useState<MenuItem | null>(null);

  // Dev simulation flag for testing switch rollback per requirement 3
  const [simulateFail, setSimulateFail] = React.useState(false);

  const deleteItemMutation = useDeleteMenuItem();

  // Update window flag when simulateFail state changes
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      (window as unknown as { __simulateMenuFail?: boolean }).__simulateMenuFail = simulateFail;
    }
  }, [simulateFail]);

  const categories = React.useMemo(
    () => menuData?.categories || [],
    [menuData?.categories]
  );
  const allItems = React.useMemo(() => menuData?.items || [], [menuData?.items]);

  // Filter items by category and search query
  const filteredItems = React.useMemo(() => {
    let list = allItems;

    // Filter by category
    if (selectedCategoryId) {
      list = list.filter((item) => item.category_id === selectedCategoryId);
    }

    // Filter by search query
    const query = searchQuery.trim().toLowerCase();
    if (query) {
      list = list.filter((item) => {
        const matchesName = item.name?.toLowerCase().includes(query);
        const matchesTrans = item.translations?.some(
          (tr) =>
            tr.name.toLowerCase().includes(query) ||
            tr.description?.toLowerCase().includes(query) ||
            tr.aliases.some((a) => a.toLowerCase().includes(query))
        );
        return matchesName || matchesTrans;
      });
    }

    return list;
  }, [allItems, selectedCategoryId, searchQuery]);

  // Server-style pagination (20 per page per requirement 2)
  const totalItems = filteredItems.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const paginatedItems = React.useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredItems.slice(start, start + PAGE_SIZE);
  }, [filteredItems, currentPage]);

  // Reset page when category or search changes
  const handleSelectCategory = (categoryId: string | null) => {
    setSelectedCategoryId(categoryId);
    setCurrentPage(1);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleOpenCreate = () => {
    setEditingItem(null);
    setIsSheetOpen(true);
  };

  const handleOpenEdit = (item: MenuItem) => {
    setEditingItem(item);
    setIsSheetOpen(true);
  };

  const handleDeleteItem = async () => {
    if (!deletingItem) return;
    try {
      await deleteItemMutation.mutateAsync(deletingItem.id);
      toast.success(t("toasts.itemDeleted"));
      setDeletingItem(null);
    } catch {
      toast.error(t("error.title"));
    }
  };

  const categoryMap = React.useMemo(() => {
    const map = new Map<string, (typeof categories)[0]>();
    for (const cat of categories) {
      map.set(cat.id, cat);
    }
    return map;
  }, [categories]);

  // Error State
  if (isError) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle>{t("error.title")}</AlertTitle>
          <AlertDescription className="flex items-center justify-between gap-4 mt-2">
            <span>{error instanceof Error ? error.message : t("error.desc")}</span>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => refetch()}
              className="shrink-0"
            >
              <RefreshCw className="h-4 w-4 me-1.5" />
              {t("error.retry")}
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Header Bar: Title, Subtitle, Dev Flag Toggle, Add Item Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-[#10202D]">{t("title")}</h1>
          <p className="text-xs text-[#5F6C79] mt-0.5">{t("subtitle")}</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Dev switch failure simulator toggle (per requirement 3) */}
          <button
            type="button"
            onClick={() => {
              const next = !simulateFail;
              setSimulateFail(next);
              if (next) {
                toast.info(t("toasts.devFailEnabled"));
              }
            }}
            className={cn(
              "h-9 px-2.5 rounded-[8px] text-xs font-medium border flex items-center gap-1.5 transition-colors cursor-pointer",
              simulateFail
                ? "bg-[#FBF0DA] text-[#7A4E0B] border-[#B7791F]"
                : "bg-white text-[#5F6C79] border-[#E2E5E9] hover:bg-[#F2F4F6]"
            )}
            title={t("dev.simulateFail")}
          >
            <Bug className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">
              {simulateFail ? t("dev.simulateFailActive") : t("dev.simulateFail")}
            </span>
          </button>

          {/* Add Item Button (Accent Gold Button per DESIGN.md: at most one gold button per screen) */}
          <Button
            variant="primary"
            onClick={handleOpenCreate}
            className="h-9 px-4 text-xs font-semibold rounded-[8px] bg-[#C7A667] text-[#10202D] hover:bg-[#B5964F] active:bg-[#A3853F] shadow-xs gap-1.5"
          >
            <Plus className="h-4 w-4" />
            <span>{t("addItem")}</span>
          </Button>
        </div>
      </div>

      {/* 2. Main Layout: Categories Sidebar (left) + Items Table (right) */}
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 items-start">
        {/* Categories Sidebar */}
        <div className="w-full">
          {isLoading ? (
            <Card className="p-4 bg-white border-[#E2E5E9] rounded-[12px] space-y-3">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
            </Card>
          ) : (
            <CategorySidebar
              categories={categories}
              items={allItems}
              selectedCategoryId={selectedCategoryId}
              onSelectCategory={handleSelectCategory}
            />
          )}
        </div>

        {/* Items Table Card */}
        <Card className="bg-white border-[#E2E5E9] rounded-[12px] shadow-xs overflow-hidden flex flex-col">
          {/* Search and Filter Strip */}
          <div className="p-4 border-b border-[#E2E5E9] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A9B4BE]" />
              <Input
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder={t("searchPlaceholder")}
                className="h-9 ps-9 text-xs rounded-[8px] border-[#D5DAE0] focus-visible:ring-[#10202D]"
              />
            </div>

            {/* Current Category & Total Badge */}
            <div className="text-xs text-[#5F6C79] flex items-center gap-2">
              <span>{t("itemsCount", { count: totalItems })}</span>
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto [scrollbar-width:thin]">
            {isLoading ? (
              /* Loading Skeletons */
              <div className="p-4 space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-14 w-full" />
              </div>
            ) : totalItems === 0 ? (
              /* Empty States */
              <div className="py-16 px-4 text-center flex flex-col items-center justify-center">
                <div className="h-12 w-12 rounded-full bg-[#ECEEF1] flex items-center justify-center mb-3">
                  <UtensilsCrossed className="h-6 w-6 text-[#5F6C79]" />
                </div>
                <h3 className="text-sm font-semibold text-[#10202D]">
                  {allItems.length === 0
                    ? t("empty.noItemsTitle")
                    : t("empty.noSearchResultsTitle")}
                </h3>
                <p className="text-xs text-[#5F6C79] max-w-sm mt-1 mb-4">
                  {allItems.length === 0
                    ? t("empty.noItemsDesc")
                    : t("empty.noSearchResultsDesc")}
                </p>
                {allItems.length === 0 ? (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleOpenCreate}
                    className="h-8 px-3 text-xs font-semibold rounded-[6px] bg-[#C7A667] text-[#10202D] hover:bg-[#B5964F]"
                  >
                    <Plus className="h-3.5 w-3.5 me-1.5" />
                    {t("addItem")}
                  </Button>
                ) : (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      handleSearchChange("");
                      handleSelectCategory(null);
                    }}
                    className="h-8 px-3 text-xs font-semibold rounded-[6px]"
                  >
                    Clear Search
                  </Button>
                )}
              </div>
            ) : (
              /* Items Table */
              <Table>
                <TableHeader className="bg-[#F7F7F7] border-b border-[#E2E5E9]">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-16 ps-4 text-xs font-semibold uppercase tracking-wider text-[#5F6C79]">
                      {t("table.image")}
                    </TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-[#5F6C79]">
                      {t("table.name")}
                    </TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-[#5F6C79] hidden sm:table-cell">
                      {t("table.category")}
                    </TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-[#5F6C79]">
                      {t("table.price")}
                    </TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-[#5F6C79]">
                      {t("table.availability")}
                    </TableHead>
                    <TableHead className="pe-4 text-end text-xs font-semibold uppercase tracking-wider text-[#5F6C79]">
                      {t("table.actions")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedItems.map((item) => (
                    <MenuItemRow
                      key={item.id}
                      item={item}
                      category={categoryMap.get(item.category_id)}
                      currency={currency}
                      onEdit={handleOpenEdit}
                      onDelete={setDeletingItem}
                    />
                  ))}
                </TableBody>
              </Table>
            )}
          </div>

          {/* 3. Server-Style Pagination Bar (20 per page) */}
          {!isLoading && totalItems > 0 && (
            <div className="p-4 border-t border-[#E2E5E9] bg-white flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#5F6C79]">
              <div>
                {t("pagination.showing", {
                  from: (currentPage - 1) * PAGE_SIZE + 1,
                  to: Math.min(currentPage * PAGE_SIZE, totalItems),
                  total: totalItems,
                })}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="h-8 px-3 text-xs font-semibold rounded-[6px]"
                >
                  {t("pagination.previous")}
                </Button>

                <span className="px-2 font-medium">
                  {t("pagination.pageOf", { page: currentPage, pages: totalPages })}
                </span>

                <Button
                  variant="secondary"
                  size="sm"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="h-8 px-3 text-xs font-semibold rounded-[6px]"
                >
                  {t("pagination.next")}
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Item Create / Edit Sheet */}
      <ItemFormSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        item={editingItem}
        categories={categories}
      />

      {/* Delete Item Confirm AlertDialog */}
      <AlertDialog
        open={Boolean(deletingItem)}
        onOpenChange={(open) => !open && setDeletingItem(null)}
      >
        <AlertDialogContent className="rounded-[12px] bg-white p-6 max-w-[420px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-semibold text-[#10202D]">
              {t("confirmDeleteItemTitle", {
                name: deletingItem ? getLocalizedName(deletingItem, locale) : "",
              })}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-[#5F6C79] pt-1">
              {t("confirmDeleteItemDesc")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="pt-3 gap-2 sm:gap-0">
            <AlertDialogCancel className="h-9 px-4 text-xs font-semibold rounded-[8px]">
              {t("pagination.previous") === "Previous" ? "Cancel" : "إلغاء"}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteItem}
              className="h-9 px-4 text-xs font-semibold rounded-[8px] bg-[#B3392F] hover:bg-[#9C2F26] text-white"
            >
              {t("deleteItem")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
