"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import type { Order, OrderStatus, PaymentStatus } from "@app/shared";
import {
  getOrders,
  getOrder,
  updateOrderStatus,
  updatePaymentStatus,
  getApiErrorMessage,
  type GetOrdersParams,
  type PaginatedResponse,
} from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import { toast } from "@/components/ui/sonner";

/**
 * Hook to fetch paginated/filtered orders
 */
export function useOrders(filters?: GetOrdersParams) {
  return useQuery<PaginatedResponse<Order>>({
    queryKey: queryKeys.orders.list(filters),
    queryFn: () => getOrders(filters),
  });
}

/**
 * Hook to fetch a single order by ID
 */
export function useOrder(id: string | null | undefined) {
  return useQuery<Order>({
    queryKey: queryKeys.orders.detail(id || ""),
    queryFn: () => getOrder(id!),
    enabled: Boolean(id),
  });
}

/**
 * Mutation hook to update an order's status.
 * Updates query cache with setQueryData directly (Section 9.3) so cards move without refetching.
 */
export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  const tErrors = useTranslations("errors");

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
      updateOrderStatus(id, status),
    onSuccess: (updatedOrder: Order) => {
      // 1. Update single order cache
      queryClient.setQueryData(
        queryKeys.orders.detail(updatedOrder.id),
        updatedOrder
      );

      // 2. Update list caches directly using setQueriesData
      queryClient.setQueriesData<PaginatedResponse<Order>>(
        { queryKey: queryKeys.orders.lists() },
        (oldData) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            data: oldData.data.map((order) =>
              order.id === updatedOrder.id ? updatedOrder : order
            ),
          };
        }
      );
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err, tErrors));
    },
  });
}

/**
 * Mutation hook to update an order's payment status (e.g. verified or not_received).
 * Updates query cache with setQueryData directly.
 */
export function useUpdatePaymentStatus() {
  const queryClient = useQueryClient();
  const tErrors = useTranslations("errors");

  return useMutation({
    mutationFn: ({
      id,
      paymentStatus,
    }: {
      id: string;
      paymentStatus: PaymentStatus;
    }) => updatePaymentStatus(id, paymentStatus),
    onSuccess: (updatedOrder: Order) => {
      // 1. Update single order cache
      queryClient.setQueryData(
        queryKeys.orders.detail(updatedOrder.id),
        updatedOrder
      );

      // 2. Update list caches directly
      queryClient.setQueriesData<PaginatedResponse<Order>>(
        { queryKey: queryKeys.orders.lists() },
        (oldData) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            data: oldData.data.map((order) =>
              order.id === updatedOrder.id ? updatedOrder : order
            ),
          };
        }
      );
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err, tErrors));
    },
  });
}
