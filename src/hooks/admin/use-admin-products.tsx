/**
 * Admin Products Hook
 *
 * React Query hooks for admin product management.
 * Provides query options and mutations for admin-level product operations.
 */

import {
  queryOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  deleteAdminProduct,
  getAdminProductById,
  getAdminProducts,
  toggleAdminProductFeatured,
  updateAdminProductStatus,
} from '@/lib/functions/admin/product';
import type { AdminProductsQuery } from '@/lib/validators/shared/product-query';

// ============================================================================
// Query Keys
// ============================================================================

export const adminProductsKeys = {
  all: ['admin', 'products'] as const,
  lists: () => [...adminProductsKeys.all, 'list'] as const,
  list: (params: Partial<AdminProductsQuery>) =>
    [...adminProductsKeys.lists(), params] as const,
  details: () => [...adminProductsKeys.all, 'detail'] as const,
  detail: (id: string) => [...adminProductsKeys.details(), id] as const,
};

// ============================================================================
// Default Query Params
// ============================================================================

const defaultParams: Partial<AdminProductsQuery> = {
  limit: 10,
  offset: 0,
  sortBy: 'createdAt',
  sortDirection: 'desc',
};

// ============================================================================
// Query Options
// ============================================================================

/**
 * Query options for fetching admin products with pagination and filters
 */
export const adminProductsQueryOptions = (
  params: Partial<AdminProductsQuery> = {}
) => {
  const mergedParams = { ...defaultParams, ...params };
  return queryOptions({
    queryKey: adminProductsKeys.list(mergedParams),
    queryFn: () => getAdminProducts({ data: mergedParams }),
  });
};

/**
 * Query options for fetching a single product by ID (admin)
 */
export const adminProductByIdQueryOptions = (id: string) =>
  queryOptions({
    queryKey: adminProductsKeys.detail(id),
    queryFn: () => getAdminProductById({ data: { id } }),
    enabled: !!id,
  });

// ============================================================================
// Types
// ============================================================================

export interface AdminProductMutationState {
  /** ID of the product currently being deleted, or null */
  deletingId: string | null;
  /** ID of the product currently being updated (status), or null */
  updatingId: string | null;
  /** ID of the product currently being toggled (featured), or null */
  togglingId: string | null;
  /** Whether any mutation is in progress */
  isAnyMutating: boolean;
}

// ============================================================================
// Mutations Hook
// ============================================================================

/**
 * Hook providing mutations for admin product management
 */
export const useAdminProductMutations = () => {
  const queryClient = useQueryClient();

  const invalidateProducts = () => {
    queryClient.invalidateQueries({
      queryKey: adminProductsKeys.all,
    });
  };

  const updateStatusMutation = useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string;
      status: 'draft' | 'active' | 'archived';
    }) => updateAdminProductStatus({ data: { id, status } }),
    onSuccess: (result) => {
      toast.success(result.message || 'Product status updated');
      invalidateProducts();
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update product status');
    },
  });

  const toggleFeaturedMutation = useMutation({
    mutationFn: async ({
      id,
      isFeatured,
    }: {
      id: string;
      isFeatured: boolean;
    }) => toggleAdminProductFeatured({ data: { id, isFeatured } }),
    onSuccess: (result) => {
      toast.success(result.message || 'Product featured status updated');
      invalidateProducts();
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update featured status');
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: (id: string) => deleteAdminProduct({ data: { id } }),
    onSuccess: () => {
      toast.success('Product deleted successfully');
      invalidateProducts();
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete product');
    },
  });

  const mutationState: AdminProductMutationState = {
    deletingId: deleteProductMutation.isPending
      ? (deleteProductMutation.variables as string)
      : null,
    updatingId: updateStatusMutation.isPending
      ? (updateStatusMutation.variables?.id as string)
      : null,
    togglingId: toggleFeaturedMutation.isPending
      ? (toggleFeaturedMutation.variables?.id as string)
      : null,
    isAnyMutating:
      deleteProductMutation.isPending ||
      updateStatusMutation.isPending ||
      toggleFeaturedMutation.isPending,
  };

  return {
    updateStatus: updateStatusMutation.mutateAsync,
    toggleFeatured: toggleFeaturedMutation.mutateAsync,
    deleteProduct: deleteProductMutation.mutateAsync,
    isUpdatingStatus: updateStatusMutation.isPending,
    isTogglingFeatured: toggleFeaturedMutation.isPending,
    isDeleting: deleteProductMutation.isPending,
    mutationState,
    isProductMutating: (id: string) =>
      mutationState.deletingId === id ||
      mutationState.updatingId === id ||
      mutationState.togglingId === id,
  };
};

// ============================================================================
// Combined Hook
// ============================================================================

/**
 * Combined hook for admin product management
 */
export const useAdminProducts = () => {
  const mutations = useAdminProductMutations();

  return {
    adminProductsQueryOptions,
    adminProductByIdQueryOptions,
    ...mutations,
  };
};
