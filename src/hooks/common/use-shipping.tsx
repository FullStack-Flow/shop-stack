/**
 * Vendor Shipping Hook
 *
 * React hook for shipping management in the vendor dashboard.
 * Uses TanStack Query with server functions for SSR-compatible data fetching.
 */

import {
  queryOptions,
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createShippingMethod,
  deleteShippingMethod,
  getShippingMethodById,
  getShippingMethods,
  updateShippingMethod,
} from "@/lib/functions/shipping";
import type {
  CreateShippingMethodInput,
  UpdateShippingMethodInput,
} from "@/lib/validators/shipping";
import type { ListShippingMethodsQuery } from "@/types/shipping";

// ============================================================================
// Query Keys
// ============================================================================

export const vendorShippingKeys = {
  all: (shopId: string) => ["vendor", "shipping", shopId] as const,
  lists: (shopId: string) =>
    [...vendorShippingKeys.all(shopId), "list"] as const,
  list: (params: ListShippingMethodsQuery) =>
    [...vendorShippingKeys.lists(params.shopId), params] as const,
  details: (shopId: string) =>
    [...vendorShippingKeys.all(shopId), "detail"] as const,
  detail: (shopId: string, id: string) =>
    [...vendorShippingKeys.details(shopId), id] as const,
};

// ============================================================================
// Default Query Params
// ============================================================================

const defaultParams: Partial<ListShippingMethodsQuery> = {
  limit: 10,
  offset: 0,
  sortBy: "createdAt",
  sortDirection: "desc",
};

// ============================================================================
// Query Options
// ============================================================================

export const shippingMethodsQueryOptions = (params: ListShippingMethodsQuery) =>
  queryOptions({
    queryKey: vendorShippingKeys.list(params),
    queryFn: () =>
      getShippingMethods({ data: { ...defaultParams, ...params } }),
    enabled: !!params.shopId,
    staleTime: 30 * 1000,
  });

export const shippingMethodByIdQueryOptions = (id: string, shopId: string) =>
  queryOptions({
    queryKey: vendorShippingKeys.detail(shopId, id),
    queryFn: () => getShippingMethodById({ data: { id, shopId } }),
    enabled: !!id && !!shopId,
    staleTime: 60 * 1000,
  });

// ============================================================================
// Suspense Hooks
// ============================================================================

export const useShippingMethodsSuspense = (
  params: ListShippingMethodsQuery,
) => {
  return useSuspenseQuery(shippingMethodsQueryOptions(params));
};

export const useShippingMethodByIdSuspense = (id: string, shopId: string) => {
  return useSuspenseQuery(shippingMethodByIdQueryOptions(id, shopId));
};

// ============================================================================
// Mutation Types
// ============================================================================

export interface VendorShippingMutationState {
  creatingId: string | null;
  deletingId: string | null;
  updatingId: string | null;
  isAnyMutating: boolean;
}

// ============================================================================
// Mutations Hook
// ============================================================================

export const useShippingMutations = (shopId: string) => {
  const queryClient = useQueryClient();

  const invalidateShipping = () => {
    queryClient.invalidateQueries({
      queryKey: vendorShippingKeys.all(shopId),
    });
  };

  const createShippingMutation = useMutation({
    mutationFn: async (data: Omit<CreateShippingMethodInput, "shopId">) => {
      const result = await createShippingMethod({ data: { ...data, shopId } });
      return result;
    },
    onSuccess: (result) => {
      toast.success(
        `Shipping method "${result.shippingMethod?.name}" created successfully!`,
      );
      invalidateShipping();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create shipping method");
    },
  });

  const updateShippingMutation = useMutation({
    mutationFn: async (data: Omit<UpdateShippingMethodInput, "shopId">) => {
      const result = await updateShippingMethod({ data: { ...data, shopId } });
      return result;
    },
    onSuccess: (result) => {
      toast.success(
        `Shipping method "${result.shippingMethod?.name}" updated successfully!`,
      );
      invalidateShipping();
      if (result.shippingMethod?.id) {
        queryClient.invalidateQueries({
          queryKey: vendorShippingKeys.detail(shopId, result.shippingMethod.id),
        });
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update shipping method");
    },
  });

  const deleteShippingMutation = useMutation({
    mutationFn: async (shippingId: string) => {
      const result = await deleteShippingMethod({
        data: { id: shippingId, shopId },
      });
      return result;
    },
    onSuccess: () => {
      toast.success("Shipping method deleted successfully");
      invalidateShipping();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete shipping method");
    },
  });

  const mutationState: VendorShippingMutationState = {
    creatingId: createShippingMutation.isPending ? "new" : null,
    deletingId: deleteShippingMutation.isPending
      ? (deleteShippingMutation.variables ?? null)
      : null,
    updatingId: updateShippingMutation.isPending
      ? (updateShippingMutation.variables?.id ?? null)
      : null,
    isAnyMutating:
      createShippingMutation.isPending ||
      updateShippingMutation.isPending ||
      deleteShippingMutation.isPending,
  };

  return {
    createShipping: createShippingMutation.mutateAsync,
    updateShipping: updateShippingMutation.mutateAsync,
    deleteShipping: deleteShippingMutation.mutateAsync,
    isCreating: createShippingMutation.isPending,
    isUpdating: updateShippingMutation.isPending,
    isDeleting: deleteShippingMutation.isPending,
    mutationState,
    isShippingMutating: (id: string) =>
      mutationState.deletingId === id || mutationState.updatingId === id,
  };
};

// ============================================================================
// Combined Hook
// ============================================================================

export const useShipping = (shopId: string) => {
  const mutations = useShippingMutations(shopId);

  return {
    shippingMethodsQueryOptions: (
      params: Omit<ListShippingMethodsQuery, "shopId">,
    ) => shippingMethodsQueryOptions({ ...params, shopId }),
    shippingMethodByIdQueryOptions: (id: string) =>
      shippingMethodByIdQueryOptions(id, shopId),
    queryKeys: vendorShippingKeys,
    ...mutations,
  };
};
