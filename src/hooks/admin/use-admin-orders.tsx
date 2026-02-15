/**
 * Admin Orders Hooks
 *
 * React Query hooks for admin order management.
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  adminCancelOrder,
  getAdminOrderDetails,
  getAdminOrderStats,
  getAdminOrders,
  updateAdminOrderStatus,
} from "@/lib/functions/admin/order";
import type { OrderStatus } from "@/types/orders";

// ============================================================================
// Query Keys
// ============================================================================

export const adminOrderKeys = {
  all: ["admin-orders"] as const,
  list: (params?: {
    limit?: number;
    offset?: number;
    status?: OrderStatus;
    shopId?: string;
  }) => [...adminOrderKeys.all, "list", params] as const,
  detail: (orderId: string) =>
    [...adminOrderKeys.all, "detail", orderId] as const,
  stats: () => [...adminOrderKeys.all, "stats"] as const,
};

/**
 * Hook to fetch admin orders
 */
export function useAdminOrders(params?: {
  limit?: number;
  offset?: number;
  status?: OrderStatus;
  shopId?: string;
}) {
  return useQuery({
    queryKey: adminOrderKeys.list(params),
    queryFn: async () => {
      const result = await getAdminOrders({
        data: {
          limit: params?.limit ?? 10,
          offset: params?.offset ?? 0,
          status: params?.status,
          shopId: params?.shopId,
        },
      });
      return result;
    },
  });
}

/**
 * Hook to fetch admin order details
 */
export function useAdminOrderDetails(orderId: string) {
  return useQuery({
    queryKey: adminOrderKeys.detail(orderId),
    queryFn: async () => {
      const result = await getAdminOrderDetails({
        data: { orderId },
      });
      return result.order;
    },
    enabled: !!orderId,
  });
}

/**
 * Hook to update admin order status
 */
export function useUpdateAdminOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      orderId,
      status,
      internalNotes,
    }: {
      orderId: string;
      status: OrderStatus;
      internalNotes?: string;
    }) => {
      const result = await updateAdminOrderStatus({
        data: { orderId, status, internalNotes },
      });
      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: adminOrderKeys.all });
      queryClient.invalidateQueries({
        queryKey: adminOrderKeys.detail(variables.orderId),
      });
    },
  });
}

/**
 * Hook to cancel/refund an order (admin)
 */
export function useAdminCancelOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      orderId,
      reason,
    }: {
      orderId: string;
      reason?: string;
    }) => {
      const result = await adminCancelOrder({
        data: { orderId, reason },
      });
      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: adminOrderKeys.all });
      queryClient.invalidateQueries({
        queryKey: adminOrderKeys.detail(variables.orderId),
      });
    },
  });
}

/**
 * Hook to fetch admin order stats
 */
export function useAdminOrderStats() {
  return useQuery({
    queryKey: adminOrderKeys.stats(),
    queryFn: async () => {
      const result = await getAdminOrderStats();
      return result;
    },
  });
}
