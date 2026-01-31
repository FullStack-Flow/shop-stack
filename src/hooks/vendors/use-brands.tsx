/**
 * Vendor Brands Hook
 *
 * React hook for brand management in the vendor dashboard.
 * Uses TanStack Query with server functions for SSR-compatible data fetching.
 */

import {
  queryOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createBrand,
  deleteBrand,
  getBrandById,
  getBrands,
  updateBrand,
} from "@/lib/functions/vendor/brands";
import type {
  CreateBrandInput,
  UpdateBrandInput,
} from "@/lib/validators/brands";
import type { ListBrandsQuery } from "@/types/brands";

// ============================================================================
// Query Keys
// ============================================================================

export const vendorBrandsKeys = {
  all: (shopId: string) => ["vendor", "brands", shopId] as const,
  lists: (shopId: string) => [...vendorBrandsKeys.all(shopId), "list"] as const,
  list: (params: ListBrandsQuery) =>
    [...vendorBrandsKeys.lists(params.shopId), params] as const,
  details: (shopId: string) =>
    [...vendorBrandsKeys.all(shopId), "detail"] as const,
  detail: (shopId: string, id: string) =>
    [...vendorBrandsKeys.details(shopId), id] as const,
};

// ============================================================================
// Default Query Params
// ============================================================================

const defaultParams: Partial<ListBrandsQuery> = {
  limit: 10,
  offset: 0,
  sortBy: "sortOrder",
  sortDirection: "asc",
};

// ============================================================================
// Query Options
// ============================================================================

/**
 * Query options for fetching brands with pagination
 */
export const brandsQueryOptions = (params: ListBrandsQuery) =>
  queryOptions({
    queryKey: vendorBrandsKeys.list(params),
    queryFn: () => getBrands({ data: { ...defaultParams, ...params } }),
    enabled: !!params.shopId,
  });

/**
 * Query options for fetching a single brand by ID
 */
export const brandByIdQueryOptions = (id: string, shopId: string) =>
  queryOptions({
    queryKey: vendorBrandsKeys.detail(shopId, id),
    queryFn: () => getBrandById({ data: { id, shopId } }),
    enabled: !!id && !!shopId,
  });

// ============================================================================
// Mutation Types
// ============================================================================

export interface VendorBrandMutationState {
  /** ID of the brand currently being created, or null */
  creatingId: string | null;
  /** ID of the brand currently being deleted, or null */
  deletingId: string | null;
  /** ID of the brand currently being updated, or null */
  updatingId: string | null;
  /** Whether any mutation is in progress */
  isAnyMutating: boolean;
}

// ============================================================================
// Mutations Hook
// ============================================================================

/**
 * Hook providing mutations for brand management
 */
export const useBrandMutations = (shopId: string) => {
  const queryClient = useQueryClient();

  const invalidateBrands = () => {
    queryClient.invalidateQueries({
      queryKey: vendorBrandsKeys.all(shopId),
    });
  };

  // Create brand mutation
  const createBrandMutation = useMutation({
    mutationFn: async (data: Omit<CreateBrandInput, "shopId">) => {
      const result = await createBrand({ data: { ...data, shopId } });
      return result;
    },
    onSuccess: (result) => {
      toast.success(`Brand "${result.brand?.name}" created successfully!`);
      invalidateBrands();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create brand");
    },
  });

  // Update brand mutation
  const updateBrandMutation = useMutation({
    mutationFn: async (data: Omit<UpdateBrandInput, "shopId">) => {
      const result = await updateBrand({ data: { ...data, shopId } });
      return result;
    },
    onSuccess: (result) => {
      toast.success(`Brand "${result.brand?.name}" updated successfully!`);
      invalidateBrands();
      // Also invalidate specific brand query
      if (result.brand?.id) {
        queryClient.invalidateQueries({
          queryKey: vendorBrandsKeys.detail(shopId, result.brand.id),
        });
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update brand");
    },
  });

  // Delete brand mutation
  const deleteBrandMutation = useMutation({
    mutationFn: async (brandId: string) => {
      const result = await deleteBrand({ data: { id: brandId, shopId } });
      return result;
    },
    onSuccess: () => {
      toast.success("Brand deleted successfully");
      invalidateBrands();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete brand");
    },
  });

  // Enhanced mutation state with specific IDs
  const mutationState: VendorBrandMutationState = {
    creatingId: createBrandMutation.isPending ? "new" : null,
    deletingId: deleteBrandMutation.isPending
      ? (deleteBrandMutation.variables ?? null)
      : null,
    updatingId: updateBrandMutation.isPending
      ? (updateBrandMutation.variables?.id ?? null)
      : null,
    isAnyMutating:
      createBrandMutation.isPending ||
      updateBrandMutation.isPending ||
      deleteBrandMutation.isPending,
  };

  return {
    createBrand: createBrandMutation.mutateAsync,
    updateBrand: updateBrandMutation.mutateAsync,
    deleteBrand: deleteBrandMutation.mutateAsync,
    isCreating: createBrandMutation.isPending,
    isUpdating: updateBrandMutation.isPending,
    isDeleting: deleteBrandMutation.isPending,

    // Enhanced mutation state
    mutationState,

    // Helper function to check if a specific brand is being mutated
    isBrandMutating: (id: string) =>
      mutationState.deletingId === id || mutationState.updatingId === id,
  };
};

// ============================================================================
// Combined Hook
// ============================================================================

/**
 * Combined hook for brand management
 */
export const useBrands = (shopId: string) => {
  const mutations = useBrandMutations(shopId);

  return {
    brandsQueryOptions: (params: Omit<ListBrandsQuery, "shopId">) =>
      brandsQueryOptions({ ...params, shopId }),
    brandByIdQueryOptions: (id: string) => brandByIdQueryOptions(id, shopId),
    queryKeys: vendorBrandsKeys,
    ...mutations,
  };
};
