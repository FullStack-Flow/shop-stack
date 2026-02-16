/**
 * Admin Brands Hook
 *
 * React Query hooks for admin brand management.
 * Provides query options and mutations for admin-level brand operations.
 */

import {
  queryOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import {
  deleteAdminBrand,
  getAdminBrandById,
  getAdminBrands,
  toggleAdminBrandActive,
} from "@/lib/functions/admin/brand";
import type { AdminBrandsQuery } from "@/lib/validators/shared/brand-query";

// ============================================================================
// Query Keys
// ============================================================================

export const adminBrandsKeys = {
  all: ["admin", "brands"] as const,
  lists: () => [...adminBrandsKeys.all, "list"] as const,
  list: (params: Partial<AdminBrandsQuery>) =>
    [...adminBrandsKeys.lists(), params] as const,
  details: () => [...adminBrandsKeys.all, "detail"] as const,
  detail: (id: string) => [...adminBrandsKeys.details(), id] as const,
};

// ============================================================================
// Default Query Params
// ============================================================================

const defaultParams: Partial<AdminBrandsQuery> = {
  limit: 10,
  offset: 0,
  sortBy: "sortOrder",
  sortDirection: "asc",
};

// ============================================================================
// Query Options
// ============================================================================

/**
 * Query options for fetching admin brands with pagination and filters
 */
export const adminBrandsQueryOptions = (
  params: Partial<AdminBrandsQuery> = {},
) => {
  const mergedParams = { ...defaultParams, ...params };
  return queryOptions({
    queryKey: adminBrandsKeys.list(mergedParams),
    queryFn: () => getAdminBrands({ data: mergedParams }),
  });
};

/**
 * Query options for fetching a single brand by ID (admin)
 */
export const adminBrandByIdQueryOptions = (id: string) =>
  queryOptions({
    queryKey: adminBrandsKeys.detail(id),
    queryFn: () => getAdminBrandById({ data: { id } }),
    enabled: !!id,
  });

// ============================================================================
// Mutation Types
// ============================================================================

export interface AdminBrandMutationState {
  deletingId: string | null;
  togglingId: string | null;
  isAnyMutating: boolean;
}

// ============================================================================
// Mutations Hook
// ============================================================================

/**
 * Hook providing mutations for admin brand management
 */
export const useAdminBrandMutations = () => {
  const queryClient = useQueryClient();

  const invalidateBrands = () => {
    queryClient.invalidateQueries({
      queryKey: adminBrandsKeys.all,
    });
  };

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) =>
      toggleAdminBrandActive({ data: { id, isActive } }),
    onSuccess: (result) => {
      toast.success(result.message || "Brand status updated");
      invalidateBrands();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update brand status");
    },
  });

  const deleteBrandMutation = useMutation({
    mutationFn: (id: string) => deleteAdminBrand({ data: { id } }),
    onSuccess: () => {
      toast.success("Brand deleted successfully");
      invalidateBrands();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete brand");
    },
  });

  // Enhanced mutation state with specific IDs
  const mutationState: AdminBrandMutationState = {
    deletingId: deleteBrandMutation.isPending
      ? (deleteBrandMutation.variables ?? null)
      : null,
    togglingId: toggleActiveMutation.isPending
      ? (toggleActiveMutation.variables?.id ?? null)
      : null,
    isAnyMutating:
      toggleActiveMutation.isPending || deleteBrandMutation.isPending,
  };

  return {
    toggleActive: toggleActiveMutation.mutateAsync,
    deleteBrand: deleteBrandMutation.mutateAsync,
    isTogglingActive: toggleActiveMutation.isPending,
    isDeleting: deleteBrandMutation.isPending,

    // Enhanced mutation state
    mutationState,

    // Helper function to check if a specific brand is being mutated
    isBrandMutating: (id: string) =>
      mutationState.deletingId === id || mutationState.togglingId === id,
  };
};

// ============================================================================
// Combined Hook
// ============================================================================

/**
 * Combined hook for admin brand management
 */
export const useAdminBrands = () => {
  const mutations = useAdminBrandMutations();

  return {
    adminBrandsQueryOptions,
    adminBrandByIdQueryOptions,
    adminBrandsKeys,
    ...mutations,
  };
};
