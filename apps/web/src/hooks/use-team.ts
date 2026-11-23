"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { User } from "@app/shared";
import {
  getTeam,
  createTeamMember,
  updateTeamMember,
  toggleUserActive,
} from "@/lib/api";
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

/**
 * Mutation hook to create a new team member
 */
export function useCreateTeamMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<User, "id" | "restaurant_id"> & { id?: string; password?: string }) =>
      createTeamMember(data),
    onSuccess: (newUser: User) => {
      queryClient.setQueryData<User[]>(queryKeys.team.all, (old) => {
        if (!old) return [newUser];
        return [...old, newUser];
      });
    },
  });
}

/**
 * Mutation hook to update an existing team member
 */
export function useUpdateTeamMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<User> & { password?: string } }) =>
      updateTeamMember(id, data),
    onSuccess: (updatedUser: User) => {
      queryClient.setQueryData<User[]>(queryKeys.team.all, (old) => {
        if (!old) return [updatedUser];
        return old.map((u) => (u.id === updatedUser.id ? updatedUser : u));
      });
    },
  });
}

/**
 * Mutation hook to toggle user active status
 */
export function useToggleUserActive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) =>
      toggleUserActive(id, is_active),
    onSuccess: (updatedUser: User) => {
      queryClient.setQueryData<User[]>(queryKeys.team.all, (old) => {
        if (!old) return [updatedUser];
        return old.map((u) => (u.id === updatedUser.id ? updatedUser : u));
      });
    },
  });
}
