"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { MenuItem, MenuTranslation } from "@app/shared";
import {
  getMenu,
  updateMenuItem,
  setItemAvailability,
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
            it.id === updatedItem.id ? updatedItem : it
          ),
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
            it.id === updatedItem.id ? updatedItem : it
          ),
        };
      });
    },
  });
}
