"use client";

import { useQuery } from "@tanstack/react-query";
import type { User } from "@app/shared";
import { getTeam } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";

/**
 * Hook to fetch restaurant staff members
 */
export function useTeam() {
  return useQuery<User[]>({
    queryKey: queryKeys.team.all,
    queryFn: () => getTeam(),
  });
}
