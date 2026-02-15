/**
 * Admin Shops (Tenants) Hook
 *
 * React Query hooks for admin shop/tenant management.
 * Provides query options and mutations for admin-level shop operations.
 */

import {
  queryOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import {
  deleteAdminShop,
  getAdminShopById,
  getAdminShops,
  updateAdminShopStatus,
  updateVendorCommission,
} from "@/lib/functions/admin/shops";
import type { AdminShopsQuery } from "@/lib/validators/admin/shop-query";

// ============================================================================
// Query Keys
// ============================================================================

export const adminShopsKeys = {
  all: ["admin", "shops"] as const,
  lists: () => [...adminShopsKeys.all, "list"] as const,
  list: (params: Partial<AdminShopsQuery>) =>
    [...adminShopsKeys.lists(), params] as const,
  details: () => [...adminShopsKeys.all, "detail"] as const,
  detail: (id: string) => [...adminShopsKeys.details(), id] as const,
};

// ============================================================================
// Default Query Params
// ============================================================================

const defaultParams: Partial<AdminShopsQuery> = {
  limit: 10,
  offset: 0,
  sortBy: "createdAt",
  sortDirection: "desc",
};

// ============================================================================
// Query Options
// ============================================================================

/**
 * Query options for fetching admin shops with pagination and filters
 */
export const adminShopsQueryOptions = (
  params: Partial<AdminShopsQuery> = {},
) => {
  const mergedParams = { ...defaultParams, ...params };
  return queryOptions({
    queryKey: adminShopsKeys.list(mergedParams),
    queryFn: () => getAdminShops({ data: mergedParams }),
  });
};

/**
 * Query options for fetching a single shop by ID (admin)
 */
export const adminShopByIdQueryOptions = (id: string) =>
  queryOptions({
    queryKey: adminShopsKeys.detail(id),
    queryFn: () => getAdminShopById({ data: { id } }),
    enabled: !!id,
  });

// ============================================================================
// Mutations Hook
// ============================================================================

/**
 * Hook providing mutations for admin shop management
 */
export const useAdminShopMutations = () => {
  const queryClient = useQueryClient();

  const invalidateShops = () => {
    queryClient.invalidateQueries({
      queryKey: adminShopsKeys.all,
    });
  };

  const updateStatusMutation = useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string;
      status: "pending" | "active" | "suspended";
    }) => updateAdminShopStatus({ data: { id, status } }),
    onSuccess: (result) => {
      toast.success(result.message || "Shop status updated");
      invalidateShops();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update shop status");
    },
  });

  const deleteShopMutation = useMutation({
    mutationFn: (id: string) => deleteAdminShop({ data: { id } }),
    onSuccess: () => {
      toast.success("Shop deleted successfully");
      invalidateShops();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete shop");
    },
  });

  const updateCommissionMutation = useMutation({
    mutationFn: ({
      vendorId,
      commissionRate,
    }: {
      vendorId: string;
      commissionRate: string;
    }) => updateVendorCommission({ data: { vendorId, commissionRate } }),
    onSuccess: (result) => {
      toast.success(result.message || "Commission rate updated");
      invalidateShops();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update commission");
    },
  });

  return {
    updateStatus: updateStatusMutation.mutateAsync,
    deleteShop: deleteShopMutation.mutateAsync,
    updateCommission: updateCommissionMutation.mutateAsync,
    isUpdatingStatus: updateStatusMutation.isPending,
    isDeleting: deleteShopMutation.isPending,
    isUpdatingCommission: updateCommissionMutation.isPending,
  };
};

// ============================================================================
// Combined Hook
// ============================================================================

/**
 * Combined hook for admin shop management
 */
export const useAdminShops = () => {
  const mutations = useAdminShopMutations();

  return {
    adminShopsQueryOptions,
    adminShopByIdQueryOptions,
    ...mutations,
  };
};
