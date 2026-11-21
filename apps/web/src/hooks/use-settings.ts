"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Restaurant } from "@app/shared";
import { getSettings, updateSettings } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";

/**
 * Hook to fetch restaurant configuration and settings
 */
export function useSettings() {
  return useQuery<Restaurant>({
    queryKey: queryKeys.settings.all,
    queryFn: () => getSettings(),
  });
}

/**
 * Mutation hook to update restaurant configuration and settings.
 * Updates query cache with setQueryData.
 */
export function useUpdateSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Restaurant>) => updateSettings(data),
    onSuccess: (updatedSettings: Restaurant) => {
      queryClient.setQueryData<Restaurant>(
        queryKeys.settings.all,
        updatedSettings
      );
    },
  });
}
