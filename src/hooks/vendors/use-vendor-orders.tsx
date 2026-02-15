import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getVendorOrderDetails,
  getVendorOrderStats,
  getVendorOrders,
  updateVendorOrderStatus,
} from "@/lib/functions/vendor/order";
import type { OrderStatus } from "@/types/orders";

export const vendorOrderKeys = {
  all: ["vendor-orders"] as const,
  list: (params?: {
    limit?: number;
    offset?: number;
    status?: OrderStatus;
    shopSlug?: string;
  }) => [...vendorOrderKeys.all, "list", params] as const,
  detail: (orderId: string) =>
    [...vendorOrderKeys.all, "detail", orderId] as const,
  stats: (shopSlug?: string) =>
    [...vendorOrderKeys.all, "stats", shopSlug] as const,
};

export function useVendorOrders(params?: {
  limit?: number;
  offset?: number;
  status?: OrderStatus;
  shopSlug?: string;
}) {
  return useQuery({
    queryKey: vendorOrderKeys.list(params),
    queryFn: async () => {
      const result = await getVendorOrders({
        data: {
          limit: params?.limit ?? 10,
          offset: params?.offset ?? 0,
          status: params?.status,
          shopSlug: params?.shopSlug,
        },
      });
      return result;
    },
  });
}

export function useVendorOrderDetails(orderId: string) {
  return useQuery({
    queryKey: vendorOrderKeys.detail(orderId),
    queryFn: async () => {
      const result = await getVendorOrderDetails({
        data: { orderId },
      });
      return result.order;
    },
    enabled: !!orderId,
  });
}

export function useUpdateVendorOrderStatus() {
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
      const result = await updateVendorOrderStatus({
        data: { orderId, status, internalNotes },
      });
      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: vendorOrderKeys.all });
      queryClient.invalidateQueries({
        queryKey: vendorOrderKeys.detail(variables.orderId),
      });
    },
  });
}

export function useVendorOrderStats(shopSlug?: string) {
  return useQuery({
    queryKey: vendorOrderKeys.stats(shopSlug),
    queryFn: async () => {
      const result = await getVendorOrderStats({
        data: { shopSlug },
      });
      return result;
    },
  });
}
