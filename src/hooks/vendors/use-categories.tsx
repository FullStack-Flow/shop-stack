/**
 * Vendor Categories Hook
 *
 * React hook for category management in the vendor dashboard.
 * Uses TanStack Query with server functions for SSR-compatible data fetching.
 */

import {
  queryOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createCategory,
  deleteCategory,
  getCategories,
  getCategoryById,
  updateCategory,
} from "@/lib/functions/vendor/categories";
import type {
  CreateCategoryInput,
  UpdateCategoryInput,
} from "@/lib/validators/category";
import type { VendorCategoriesQuery } from "@/lib/validators/shared/category-query";

// ============================================================================
// Query Options
// ============================================================================

/**
 * Query options for fetching categories with pagination
 */
export const categoriesQueryOptions = (params: VendorCategoriesQuery) =>
  queryOptions({
    queryKey: ["vendor", "categories", params.shopId, params],
    queryFn: () => getCategories({ data: params }),
    enabled: !!params.shopId,
  });

/**
 * Query options for fetching a single category by ID
 */
export const categoryByIdQueryOptions = (id: string, shopId: string) =>
  queryOptions({
    queryKey: ["vendor", "categories", shopId, id],
    queryFn: () => getCategoryById({ data: { id, shopId } }),
    enabled: !!id && !!shopId,
  });

// ============================================================================
// Types
// ============================================================================

export interface VendorCategoryMutationState {
  creatingId: string | null;
  deletingId: string | null;
  updatingId: string | null;
  isAnyMutating: boolean;
}

// ============================================================================
// Mutations Hook
// ============================================================================

/**
 * Hook providing mutations for category management
 */
export const useCategoryMutations = (shopId: string) => {
  const queryClient = useQueryClient();

  const invalidateCategories = () => {
    queryClient.invalidateQueries({
      queryKey: ["vendor", "categories", shopId],
    });
  };

  // Create category mutation
  const createCategoryMutation = useMutation({
    mutationFn: async (data: Omit<CreateCategoryInput, "shopId">) => {
      const result = await createCategory({ data: { ...data, shopId } });
      return result;
    },
    onSuccess: (result) => {
      toast.success(
        `Category "${result.category?.name}" created successfully!`,
      );
      invalidateCategories();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create category");
    },
  });

  // Update category mutation
  const updateCategoryMutation = useMutation({
    mutationFn: async (data: Omit<UpdateCategoryInput, "shopId">) => {
      const result = await updateCategory({ data: { ...data, shopId } });
      return result;
    },
    onSuccess: (result) => {
      toast.success(
        `Category "${result.category?.name}" updated successfully!`,
      );
      invalidateCategories();
      // Also invalidate specific category query
      if (result.category?.id) {
        queryClient.invalidateQueries({
          queryKey: ["vendor", "categories", shopId, result.category.id],
        });
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update category");
    },
  });

  // Delete category mutation
  const deleteCategoryMutation = useMutation({
    mutationFn: async (categoryId: string) => {
      const result = await deleteCategory({ data: { id: categoryId, shopId } });
      return result;
    },
    onSuccess: () => {
      toast.success("Category deleted successfully");
      invalidateCategories();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete category");
    },
  });

  const mutationState: VendorCategoryMutationState = {
    creatingId: createCategoryMutation.isPending ? "new" : null,
    deletingId: deleteCategoryMutation.isPending
      ? (deleteCategoryMutation.variables as string)
      : null,
    updatingId: updateCategoryMutation.isPending
      ? (updateCategoryMutation.variables?.id as string)
      : null,
    isAnyMutating:
      createCategoryMutation.isPending ||
      deleteCategoryMutation.isPending ||
      updateCategoryMutation.isPending,
  };

  return {
    createCategory: createCategoryMutation.mutateAsync,
    updateCategory: updateCategoryMutation.mutateAsync,
    deleteCategory: deleteCategoryMutation.mutateAsync,
    isCreating: createCategoryMutation.isPending,
    isUpdating: updateCategoryMutation.isPending,
    isDeleting: deleteCategoryMutation.isPending,
    mutationState,
    isCategoryMutating: (id: string) =>
      mutationState.deletingId === id || mutationState.updatingId === id,
  };
};

// ============================================================================
// Combined Hook
// ============================================================================

/**
 * Combined hook for category management
 */
export const useCategories = (shopId: string) => {
  const mutations = useCategoryMutations(shopId);

  return {
    categoriesQueryOptions: (params: Omit<VendorCategoriesQuery, "shopId">) =>
      categoriesQueryOptions({ ...params, shopId }),
    categoryByIdQueryOptions: (id: string) =>
      categoryByIdQueryOptions(id, shopId),
    ...mutations,
  };
};
