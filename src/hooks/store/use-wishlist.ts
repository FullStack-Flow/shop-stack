/**
 * Wishlist Hook
 *
 * React hook for wishlist management in the client.
 * Uses TanStack Query with server functions.
 */

import {
  queryOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import {
  checkWishlistStatus,
  getWishlist,
  toggleWishlist,
} from "@/lib/functions/store/wishlist";
import type { ToggleWishlistInput } from "@/lib/validators/wishlist";

// ============================================================================
// Query Keys
// ============================================================================

export const wishlistKeys = {
  all: ["account", "wishlist"] as const,
  lists: () => [...wishlistKeys.all, "list"] as const,
  item: (productId: string) =>
    [...wishlistKeys.all, "item", productId] as const,
};

// ============================================================================
// Query Options
// ============================================================================

/**
 * Query options for fetching user wishlist
 */
export const wishlistQueryOptions = () =>
  queryOptions({
    queryKey: wishlistKeys.lists(),
    queryFn: () => getWishlist(),
  });

/**
 * Query options for checking if a product is in wishlist
 */
export const wishlistStatusQueryOptions = (productId: string) =>
  queryOptions({
    queryKey: wishlistKeys.item(productId),
    queryFn: () => checkWishlistStatus({ data: { productId } }),
    enabled: !!productId,
  });

// ============================================================================
// Mutations Hook
// ============================================================================

/**
 * Hook providing mutations for wishlist management
 */
export const useWishlistMutations = () => {
  const queryClient = useQueryClient();

  const invalidateWishlist = () => {
    queryClient.invalidateQueries({
      queryKey: wishlistKeys.lists(),
    });
  };

  const invalidateStatus = (productId: string) => {
    queryClient.invalidateQueries({
      queryKey: wishlistKeys.item(productId),
    });
  };

  // Toggle wishlist item mutation
  const toggleWishlistMutation = useMutation({
    mutationFn: async (data: ToggleWishlistInput) => {
      const result = await toggleWishlist({ data });
      return { ...result, productId: data.productId };
    },
    onSuccess: (result) => {
      if (result.added) {
        toast.success("Added to wishlist");
      } else {
        toast.success("Removed from wishlist");
      }
      invalidateWishlist();
      invalidateStatus(result.productId);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update wishlist");
    },
  });

  return {
    toggleWishlist: toggleWishlistMutation.mutateAsync,
    isToggling: toggleWishlistMutation.isPending,
  };
};
