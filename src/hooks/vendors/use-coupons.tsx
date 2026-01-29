/**
 * Vendor Coupons Hook
 *
 * React hook for coupon management in the vendor dashboard.
 * Uses TanStack Query with server functions for SSR-compatible data fetching.
 */

import {
  queryOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createCoupon,
  deleteCoupon,
  getAvailableCouponsForUser,
  getCouponById,
  getCoupons,
  updateCoupon,
  validateCoupon,
} from "@/lib/functions/vendor/coupons";
import type {
  CreateCouponInput,
  GetAvailableCouponsForUserInput,
  UpdateCouponInput,
  ValidateCouponInput,
  VendorCouponsQuery,
} from "@/lib/validators/shared/coupon-query";
import type { CouponMutationState } from "@/types/coupons";

// ============================================================================
// Query Keys
// ============================================================================

export const vendorCouponsKeys = {
  all: (shopId: string) => ["vendor", "coupons", shopId] as const,
  lists: (shopId: string) =>
    [...vendorCouponsKeys.all(shopId), "list"] as const,
  list: (shopId: string, params: Partial<VendorCouponsQuery>) =>
    [...vendorCouponsKeys.lists(shopId), params] as const,
  details: (shopId: string) =>
    [...vendorCouponsKeys.all(shopId), "detail"] as const,
  detail: (shopId: string, id: string) =>
    [...vendorCouponsKeys.details(shopId), id] as const,
  available: (shopId: string) =>
    [...vendorCouponsKeys.all(shopId), "available"] as const,
  validation: (shopId: string) =>
    [...vendorCouponsKeys.all(shopId), "validation"] as const,
};

// ============================================================================
// Query Options
// ============================================================================

/**
 * Query options for fetching coupons with pagination
 */
export const couponsQueryOptions = (params: VendorCouponsQuery) =>
  queryOptions({
    queryKey: vendorCouponsKeys.list(params.shopId, params),
    queryFn: () => getCoupons({ data: params }),
    enabled: !!params.shopId,
  });

/**
 * Query options for fetching a single coupon by ID
 */
export const couponByIdQueryOptions = (id: string, shopId: string) =>
  queryOptions({
    queryKey: vendorCouponsKeys.detail(shopId, id),
    queryFn: () => getCouponById({ data: { id, shopId } }),
    enabled: !!id && !!shopId,
  });

/**
 * Query options for fetching available coupons for a user
 */
export const availableCouponsQueryOptions = (
  params: GetAvailableCouponsForUserInput,
) =>
  queryOptions({
    queryKey: vendorCouponsKeys.available(params.shopId),
    queryFn: () => getAvailableCouponsForUser({ data: params }),
    enabled: !!params.shopId,
  });

// ============================================================================
// Mutations Hook
// ============================================================================

/**
 * Hook providing mutations for coupon management
 */
export const useCouponMutations = (shopId: string) => {
  const queryClient = useQueryClient();

  const invalidateCoupons = () => {
    queryClient.invalidateQueries({
      queryKey: vendorCouponsKeys.all(shopId),
    });
    queryClient.invalidateQueries({
      queryKey: ["datatable"],
    });
  };

  // Create coupon mutation
  const createCouponMutation = useMutation({
    mutationFn: async (data: Omit<CreateCouponInput, "shopId">) => {
      const result = await createCoupon({ data: { ...data, shopId } });
      return result;
    },
    onSuccess: (result) => {
      toast.success(`Coupon "${result.coupon?.code}" created successfully!`);
      invalidateCoupons();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create coupon");
    },
  });

  // Update coupon mutation
  const updateCouponMutation = useMutation({
    mutationFn: async (data: Omit<UpdateCouponInput, "shopId">) => {
      const result = await updateCoupon({ data: { ...data, shopId } });
      return result;
    },
    onSuccess: (result) => {
      toast.success(`Coupon "${result.coupon?.code}" updated successfully!`);
      invalidateCoupons();
      // Also invalidate specific coupon query
      if (result.coupon?.id) {
        queryClient.invalidateQueries({
          queryKey: vendorCouponsKeys.detail(shopId, result.coupon.id),
        });
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update coupon");
    },
  });

  // Delete coupon mutation
  const deleteCouponMutation = useMutation({
    mutationFn: async (couponId: string) => {
      const result = await deleteCoupon({ data: { id: couponId, shopId } });
      return result;
    },
    onSuccess: () => {
      toast.success("Coupon deleted successfully");
      invalidateCoupons();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete coupon");
    },
  });

  // Validate coupon mutation
  const validateCouponMutation = useMutation({
    mutationKey: vendorCouponsKeys.validation(shopId),
    mutationFn: async (input: Omit<ValidateCouponInput, "shopId">) => {
      const result = await validateCoupon({ data: { ...input, shopId } });
      return result;
    },
    onSuccess: (data) => {
      if (data.coupon) {
        queryClient.setQueryData(
          [...vendorCouponsKeys.validation(shopId), data.coupon.code],
          data,
        );
      }
    },
  });

  const mutationState: CouponMutationState = {
    creatingId: createCouponMutation.isPending ? "new" : null,
    deletingId: deleteCouponMutation.isPending
      ? (deleteCouponMutation.variables as string)
      : null,
    updatingId: updateCouponMutation.isPending
      ? (updateCouponMutation.variables?.id as string)
      : null,
    isCreating: createCouponMutation.isPending,
    isAnyMutating:
      createCouponMutation.isPending ||
      deleteCouponMutation.isPending ||
      updateCouponMutation.isPending,
  };

  return {
    createCoupon: createCouponMutation.mutateAsync,
    updateCoupon: updateCouponMutation.mutateAsync,
    deleteCoupon: deleteCouponMutation.mutateAsync,
    validateCoupon: validateCouponMutation.mutateAsync,
    isCreating: createCouponMutation.isPending,
    isUpdating: updateCouponMutation.isPending,
    isDeleting: deleteCouponMutation.isPending,
    isValidating: validateCouponMutation.isPending,
    validationResult: validateCouponMutation.data,
    validationError: validateCouponMutation.error,
    resetValidation: validateCouponMutation.reset,
    mutationState,
    isCouponMutating: (id: string) =>
      mutationState.deletingId === id || mutationState.updatingId === id,
  };
};

// ============================================================================
// Combined Hook
// ============================================================================

/**
 * Combined hook for coupon management
 */
export const useCoupons = (shopId: string) => {
  const mutations = useCouponMutations(shopId);

  return {
    couponsQueryOptions: (params: Omit<VendorCouponsQuery, "shopId">) =>
      couponsQueryOptions({ ...params, shopId }),
    couponByIdQueryOptions: (id: string) => couponByIdQueryOptions(id, shopId),
    availableCouponsQueryOptions: (
      params: Omit<GetAvailableCouponsForUserInput, "shopId">,
    ) => availableCouponsQueryOptions({ ...params, shopId }),
    ...mutations,
  };
};
