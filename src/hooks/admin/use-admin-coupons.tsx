/**
 * Admin Coupons Hook
 *
 * React Query hooks for admin coupon management.
 * Provides query options and mutations for admin-level coupon operations.
 */

import {
  queryOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import {
  deleteAdminCoupon,
  getAdminCouponById,
  getAdminCoupons,
  toggleAdminCouponActive,
} from "@/lib/functions/admin/coupon";
import type { AdminCouponsQuery } from "@/lib/validators/shared/coupon-query";

// ============================================================================
// Query Keys
// ============================================================================

export const adminCouponsKeys = {
  all: ["admin", "coupons"] as const,
  lists: () => [...adminCouponsKeys.all, "list"] as const,
  list: (params: Partial<AdminCouponsQuery>) =>
    [...adminCouponsKeys.lists(), params] as const,
  details: () => [...adminCouponsKeys.all, "detail"] as const,
  detail: (id: string) => [...adminCouponsKeys.details(), id] as const,
};

// ============================================================================
// Default Query Params
// ============================================================================

const defaultParams: Partial<AdminCouponsQuery> = {
  limit: 10,
  offset: 0,
  sortBy: "createdAt",
  sortDirection: "desc",
};

// ============================================================================
// Query Options
// ============================================================================

/**
 * Query options for fetching admin coupons with pagination and filters
 */
export const adminCouponsQueryOptions = (
  params: Partial<AdminCouponsQuery> = {},
) => {
  const mergedParams = { ...defaultParams, ...params };
  return queryOptions({
    queryKey: adminCouponsKeys.list(mergedParams),
    queryFn: () => getAdminCoupons({ data: mergedParams }),
  });
};

/**
 * Query options for fetching a single coupon by ID (admin)
 */
export const adminCouponByIdQueryOptions = (id: string) =>
  queryOptions({
    queryKey: adminCouponsKeys.detail(id),
    queryFn: () => getAdminCouponById({ data: { id } }),
    enabled: !!id,
  });

// ============================================================================
// Types
// ============================================================================

export interface AdminCouponMutationState {
  deletingId: string | null;
  togglingId: string | null;
  isAnyMutating: boolean;
}

// ============================================================================
// Mutations Hook
// ============================================================================

/**
 * Hook providing mutations for admin coupon management
 */
export const useAdminCouponMutations = () => {
  const queryClient = useQueryClient();

  const invalidateCoupons = () => {
    queryClient.invalidateQueries({
      queryKey: adminCouponsKeys.all,
    });
  };

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) =>
      toggleAdminCouponActive({ data: { id, isActive } }),
    onSuccess: (result) => {
      toast.success(result.message || "Coupon status updated");
      invalidateCoupons();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update coupon status");
    },
  });

  const deleteCouponMutation = useMutation({
    mutationFn: (id: string) => deleteAdminCoupon({ data: { id } }),
    onSuccess: () => {
      toast.success("Coupon deleted successfully");
      invalidateCoupons();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete coupon");
    },
  });

  const mutationState: AdminCouponMutationState = {
    deletingId: deleteCouponMutation.isPending
      ? (deleteCouponMutation.variables as string)
      : null,
    togglingId: toggleActiveMutation.isPending
      ? (toggleActiveMutation.variables?.id as string)
      : null,
    isAnyMutating:
      deleteCouponMutation.isPending || toggleActiveMutation.isPending,
  };

  return {
    toggleActive: toggleActiveMutation.mutateAsync,
    deleteCoupon: deleteCouponMutation.mutateAsync,
    isTogglingActive: toggleActiveMutation.isPending,
    isDeleting: deleteCouponMutation.isPending,
    mutationState,
    isCouponMutating: (id: string) =>
      mutationState.deletingId === id || mutationState.togglingId === id,
  };
};

// ============================================================================
// Combined Hook
// ============================================================================

/**
 * Combined hook for admin coupon management
 */
export const useAdminCoupons = () => {
  const mutations = useAdminCouponMutations();

  return {
    adminCouponsQueryOptions,
    adminCouponByIdQueryOptions,
    ...mutations,
  };
};
