"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { MenuItem, MenuCategory, MenuTranslation } from "@app/shared";
import {
  getMenu,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  setItemAvailability,
  createCategory,
  updateCategory,
  reorderCategory,
  deleteCategory,
  type MenuResponse,
} from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";

/**
 * Hook to fetch the full menu (categories and items with translations)
 */
export function useMenu() {
  return useQuery<MenuResponse>({
    queryKey: queryKeys.menu.all,
    queryFn: () => getMenu(),
  });
}

/**
 * Mutation hook to create a new menu item.
 */
export function useCreateMenuItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<MenuItem, "id" | "restaurant_id"> & { id?: string }) =>
      createMenuItem(data),
    onSuccess: (newItem: MenuItem) => {
      queryClient.setQueryData<MenuResponse>(queryKeys.menu.all, (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          items: [newItem, ...oldData.items],
        };
      });
    },
  });
}

/**
 * Mutation hook to update a menu item and its translations.
 * Updates query cache with setQueryData.
 */
export function useUpdateMenuItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<MenuItem> & { translations?: MenuTranslation[] };
    }) => updateMenuItem(id, data),
    onSuccess: (updatedItem: MenuItem) => {
      queryClient.setQueryData<MenuResponse>(queryKeys.menu.all, (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          items: oldData.items.map((it) =>
            it.id === updatedItem.id
              ? {
                  ...it,
                  ...updatedItem,
                  translations: updatedItem.translations ?? it.translations,
                  name: updatedItem.name || it.name,
                }
              : it
          ),
        };
      });
    },
  });
}

/**
 * Mutation hook to delete a menu item.
 */
export function useDeleteMenuItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteMenuItem(id),
    onSuccess: (_res, id) => {
      queryClient.setQueryData<MenuResponse>(queryKeys.menu.all, (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          items: oldData.items.filter((it) => it.id !== id),
        };
      });
    },
  });
}

/**
 * Mutation hook to toggle menu item availability on/off.
 * Optimistically updates the cache immediately with rollback on error.
 */
export function useSetItemAvailability() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, is_available }: { id: string; is_available: boolean }) =>
      setItemAvailability(id, is_available),
    onMutate: async ({ id, is_available }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.menu.all });
      const previousMenu = queryClient.getQueryData<MenuResponse>(queryKeys.menu.all);

      if (previousMenu) {
        queryClient.setQueryData<MenuResponse>(queryKeys.menu.all, {
          ...previousMenu,
          items: previousMenu.items.map((item) =>
            item.id === id ? { ...item, is_available } : item
          ),
        });
      }

      return { previousMenu };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousMenu) {
        queryClient.setQueryData(queryKeys.menu.all, context.previousMenu);
      }
    },
    onSuccess: (updatedItem: MenuItem) => {
      queryClient.setQueryData<MenuResponse>(queryKeys.menu.all, (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          items: oldData.items.map((it) =>
            it.id === updatedItem.id
              ? {
                  ...it,
                  ...updatedItem,
                  translations: updatedItem.translations ?? it.translations,
                  name: updatedItem.name || it.name,
                }
              : it
          ),
        };
      });
    },
  });
}

/**
 * Mutation hook to create a new category.
 */
export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { name: string; translations: MenuTranslation[] }) =>
      createCategory(data),
    onSuccess: (newCat: MenuCategory) => {
      queryClient.setQueryData<MenuResponse>(queryKeys.menu.all, (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          categories: [...oldData.categories, newCat],
        };
      });
    },
  });
}

/**
 * Mutation hook to update an existing category.
 */
export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: { name?: string; translations: MenuTranslation[] };
    }) => updateCategory(id, data),
    onSuccess: (updatedCat: MenuCategory) => {
      queryClient.setQueryData<MenuResponse>(queryKeys.menu.all, (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          categories: oldData.categories.map((c) =>
            c.id === updatedCat.id ? updatedCat : c
          ),
        };
      });
    },
  });
}

/**
 * Mutation hook to reorder categories (up/down).
 */
export function useReorderCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, direction }: { id: string; direction: "up" | "down" }) =>
      reorderCategory(id, direction),
    onSuccess: (reorderedCategories: MenuCategory[]) => {
      queryClient.setQueryData<MenuResponse>(queryKeys.menu.all, (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          categories: reorderedCategories,
        };
      });
    },
  });
}

/**
 * Mutation hook to delete a category.
 */
export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: (_res, id) => {
      queryClient.setQueryData<MenuResponse>(queryKeys.menu.all, (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          categories: oldData.categories.filter((c) => c.id !== id),
          items: oldData.items.filter((it) => it.category_id !== id),
        };
      });
    },
  });
}
