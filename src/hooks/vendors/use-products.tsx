/**
 * Vendor Products Hook
 *
 * React hook for product management in the vendor dashboard.
 * Uses TanStack Query with server functions for SSR-compatible data fetching.
 */

import {
  queryOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createProduct,
  deleteProduct,
  getProductById,
  updateProduct,
} from "@/lib/functions/vendor/products";
import type {
  CreateProductInput,
  UpdateProductInput,
  VendorProductsQuery,
} from "@/lib/validators/shared/product-query";
import type { ProductMutationState } from "@/types/products";

// ============================================================================
// Query Keys
// ============================================================================

export const vendorProductsKeys = {
  all: ["vendor", "products"] as const,
  lists: () => [...vendorProductsKeys.all, "list"] as const,
  list: (shopId: string, params: Partial<VendorProductsQuery>) =>
    [...vendorProductsKeys.lists(), shopId, params] as const,
  details: () => [...vendorProductsKeys.all, "detail"] as const,
  detail: (shopId: string, id: string) =>
    [...vendorProductsKeys.details(), shopId, id] as const,
};

// ============================================================================
// Query Options
// ============================================================================

/**
 * Query options for fetching a single product by ID
 */
export const productByIdQueryOptions = (id: string, shopId: string) =>
  queryOptions({
    queryKey: vendorProductsKeys.detail(shopId, id),
    queryFn: () => getProductById({ data: { id, shopId } }),
    enabled: !!id && !!shopId,
  });

// ============================================================================
// Mutations Hook
// ============================================================================

/**
 * Hook providing mutations for product management
 */
export const useProductMutations = (shopId: string) => {
  const queryClient = useQueryClient();

  const invalidateProducts = () => {
    queryClient.invalidateQueries({
      queryKey: vendorProductsKeys.lists(),
    });
    queryClient.invalidateQueries({
      queryKey: ["datatable"],
    });
  };

  const createProductMutation = useMutation({
    mutationFn: async (data: Omit<CreateProductInput, "shopId">) => {
      const result = await createProduct({ data: { ...data, shopId } });
      return result;
    },
    onSuccess: (result) => {
      toast.success(`Product "${result.product?.name}" created successfully!`);
      invalidateProducts();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create product");
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: async (data: Omit<UpdateProductInput, "shopId">) => {
      const result = await updateProduct({ data: { ...data, shopId } });
      return result;
    },
    onSuccess: (result) => {
      toast.success(`Product "${result.product?.name}" updated successfully!`);
      invalidateProducts();
      if (result.product?.id) {
        queryClient.invalidateQueries({
          queryKey: vendorProductsKeys.detail(shopId, result.product.id),
        });
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update product");
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (productId: string) => {
      const result = await deleteProduct({
        data: { id: productId, shopId },
      });
      return result;
    },
    onSuccess: () => {
      toast.success("Product deleted successfully");
      invalidateProducts();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete product");
    },
  });

  const mutationState: ProductMutationState = {
    creatingId: createProductMutation.isPending ? "new" : null,
    deletingId: deleteProductMutation.isPending
      ? (deleteProductMutation.variables as string)
      : null,
    isCreating: createProductMutation.isPending,
    updatingId: updateProductMutation.isPending
      ? (updateProductMutation.variables?.id as string)
      : null,
    isAnyMutating:
      createProductMutation.isPending ||
      updateProductMutation.isPending ||
      deleteProductMutation.isPending,
  };

  return {
    createProduct: createProductMutation.mutateAsync,
    updateProduct: updateProductMutation.mutateAsync,
    deleteProduct: deleteProductMutation.mutateAsync,
    isCreating: createProductMutation.isPending,
    isUpdating: updateProductMutation.isPending,
    isDeleting: deleteProductMutation.isPending,
    mutationState,
    isProductMutating: (id: string) =>
      mutationState.deletingId === id || mutationState.updatingId === id,
  };
};

// ============================================================================
// Combined Hook
// ============================================================================

/**
 * Combined hook for product management
 */
export const useProducts = (shopId: string) => {
  const mutations = useProductMutations(shopId);

  return {
    productByIdQueryOptions: (id: string) =>
      productByIdQueryOptions(id, shopId),
    ...mutations,
  };
};
