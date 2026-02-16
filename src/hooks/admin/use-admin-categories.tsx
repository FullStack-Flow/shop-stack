/**
 * Admin Categories Hook
 *
 * React Query hooks for admin category management.
 * Provides query options and mutations for admin-level category operations.
 */

import {
  queryOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  deleteAdminCategory,
  getAdminCategories,
  getAdminCategoryById,
  toggleAdminCategoryActive,
  toggleAdminCategoryFeatured,
} from '@/lib/functions/admin/category';
import type { AdminCategoriesQuery } from '@/lib/validators/shared/category-query';

// ============================================================================
// Query Keys
// ============================================================================

export const adminCategoriesKeys = {
  all: ['admin', 'categories'] as const,
  lists: () => [...adminCategoriesKeys.all, 'list'] as const,
  list: (params: Partial<AdminCategoriesQuery>) =>
    [...adminCategoriesKeys.lists(), params] as const,
  details: () => [...adminCategoriesKeys.all, 'detail'] as const,
  detail: (id: string) => [...adminCategoriesKeys.details(), id] as const,
};

// ============================================================================
// Default Query Params
// ============================================================================

const defaultParams: Partial<AdminCategoriesQuery> = {
  limit: 10,
  offset: 0,
  sortBy: 'sortOrder',
  sortDirection: 'asc',
};

// ============================================================================
// Query Options
// ============================================================================

/**
 * Query options for fetching admin categories with pagination and filters
 */
export const adminCategoriesQueryOptions = (
  params: Partial<AdminCategoriesQuery> = {}
) => {
  const mergedParams = { ...defaultParams, ...params };
  return queryOptions({
    queryKey: adminCategoriesKeys.list(mergedParams),
    queryFn: () => getAdminCategories({ data: mergedParams }),
  });
};

/**
 * Query options for fetching a single category by ID (admin)
 */
export const adminCategoryByIdQueryOptions = (id: string) =>
  queryOptions({
    queryKey: adminCategoriesKeys.detail(id),
    queryFn: () => getAdminCategoryById({ data: { id } }),
    enabled: !!id,
  });

// ============================================================================
// Types
// ============================================================================

export interface AdminCategoryMutationState {
  /** ID of the category currently being deleted, or null */
  deletingId: string | null;
  /** ID of the category currently being toggled, or null */
  togglingId: string | null;
  /** Whether any mutation is in progress */
  isAnyMutating: boolean;
}

// ============================================================================
// Mutations Hook
// ============================================================================

/**
 * Hook providing mutations for admin category management
 */
export const useAdminCategoryMutations = () => {
  const queryClient = useQueryClient();

  const invalidateCategories = () => {
    queryClient.invalidateQueries({
      queryKey: adminCategoriesKeys.all,
    });
  };

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) =>
      toggleAdminCategoryActive({ data: { id, isActive } }),
    onSuccess: (result) => {
      toast.success(result.message || 'Category status updated');
      invalidateCategories();
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update category status');
    },
  });

  const toggleFeaturedMutation = useMutation({
    mutationFn: async ({ id, featured }: { id: string; featured: boolean }) =>
      toggleAdminCategoryFeatured({ data: { id, featured } }),
    onSuccess: (result) => {
      toast.success(result.message || 'Category featured status updated');
      invalidateCategories();
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update featured status');
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: (id: string) => deleteAdminCategory({ data: { id } }),
    onSuccess: () => {
      toast.success('Category deleted successfully');
      invalidateCategories();
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete category');
    },
  });

  const mutationState: AdminCategoryMutationState = {
    deletingId: deleteCategoryMutation.isPending
      ? (deleteCategoryMutation.variables as string)
      : null,
    togglingId:
      toggleActiveMutation.isPending || toggleFeaturedMutation.isPending
        ? ((toggleActiveMutation.variables?.id ||
            toggleFeaturedMutation.variables?.id) as string)
        : null,
    isAnyMutating:
      deleteCategoryMutation.isPending ||
      toggleActiveMutation.isPending ||
      toggleFeaturedMutation.isPending,
  };

  return {
    toggleActive: toggleActiveMutation.mutateAsync,
    toggleFeatured: toggleFeaturedMutation.mutateAsync,
    deleteCategory: deleteCategoryMutation.mutateAsync,
    isTogglingActive: toggleActiveMutation.isPending,
    isTogglingFeatured: toggleFeaturedMutation.isPending,
    isDeleting: deleteCategoryMutation.isPending,
    mutationState,
    isCategoryMutating: (id: string) =>
      mutationState.deletingId === id || mutationState.togglingId === id,
  };
};

// ============================================================================
// Combined Hook
// ============================================================================

/**
 * Combined hook for admin category management
 */
export const useAdminCategories = () => {
  const mutations = useAdminCategoryMutations();

  return {
    adminCategoriesQueryOptions,
    adminCategoryByIdQueryOptions,
    ...mutations,
  };
};
