/**
 * Cart Hook
 *
 * React Query hooks for cart operations.
 * Syncs with server while maintaining local state for optimistic updates.
 */

import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useCallback, useEffect } from "react";
import { toast } from "sonner";
import {
  addToCart,
  clearCart,
  getCart,
  mergeCarts,
  removeFromCart,
  updateCartItem,
} from "@/lib/functions/store/cart";
import {
  clearGuestSessionId,
  getGuestSessionId,
  setGuestSessionId,
} from "@/lib/helper/cart-helpers";
import type {
  AddToCartInput,
  UpdateCartItemInput,
} from "@/lib/validators/cart";
import type { CartItemResponse, CartResponse } from "@/types/cart";

// ============================================================================
// Query Keys
// ============================================================================

export const cartKeys = {
  all: ["cart"] as const,
  session: (sessionId?: string) =>
    [...cartKeys.all, "session", sessionId] as const,
};

// ============================================================================
// Query Options
// ============================================================================

export const cartQueryOptions = (sessionId?: string) =>
  queryOptions({
    queryKey: cartKeys.session(sessionId),
    queryFn: () => getCart({ data: { sessionId } }),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

// ============================================================================
// Main Cart Hook
// ============================================================================

export function useCart() {
  const queryClient = useQueryClient();
  const guestSessionId = getGuestSessionId();

  // Fetch cart data
  const {
    data: cart,
    isLoading,
    error,
    refetch,
  } = useQuery(cartQueryOptions(guestSessionId));

  // Update guest session ID when cart returns one
  useEffect(() => {
    if (cart?.sessionId && !guestSessionId) {
      setGuestSessionId(cart.sessionId);
    }
  }, [cart?.sessionId, guestSessionId]);

  // Invalidate cart queries
  const invalidateCart = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: cartKeys.all });
  }, [queryClient]);

  // Add to cart mutation
  const addToCartMutation = useMutation({
    mutationFn: async (input: AddToCartInput) => {
      const sessionId = getGuestSessionId();
      const result = await addToCart({
        data: { ...input, sessionId },
      });
      return result;
    },
    onSuccess: (result) => {
      // Update guest session if returned
      if (result.cart.sessionId) {
        setGuestSessionId(result.cart.sessionId);
      }
      // Update cache with new cart data
      queryClient.setQueryData(
        cartKeys.session(getGuestSessionId()),
        result.cart,
      );
      toast.success("Added to cart!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to add to cart");
    },
  });

  // Update cart item mutation
  const updateCartItemMutation = useMutation({
    mutationFn: async (input: UpdateCartItemInput) => {
      const sessionId = getGuestSessionId();
      const result = await updateCartItem({
        data: { ...input, sessionId },
      });
      return result;
    },
    onMutate: async (input) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: cartKeys.all });

      // Snapshot previous value
      const previousCart = queryClient.getQueryData<CartResponse>(
        cartKeys.session(guestSessionId),
      );

      // Optimistically update
      if (previousCart) {
        const updatedItems = previousCart.items.map((item) =>
          item.id === input.itemId
            ? { ...item, quantity: input.quantity }
            : item,
        );
        const totalItems = updatedItems.reduce(
          (sum, item) => sum + item.quantity,
          0,
        );
        const subtotal = updatedItems.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0,
        );

        queryClient.setQueryData(cartKeys.session(guestSessionId), {
          ...previousCart,
          items: updatedItems,
          totalItems,
          subtotal,
        });
      }

      return { previousCart };
    },
    onError: (error: Error, _vars, context) => {
      // Rollback on error
      if (context?.previousCart) {
        queryClient.setQueryData(
          cartKeys.session(guestSessionId),
          context.previousCart,
        );
      }
      toast.error(error.message || "Failed to update cart");
    },
    onSuccess: (result) => {
      // Update cache with server response
      queryClient.setQueryData(
        cartKeys.session(getGuestSessionId()),
        result.cart,
      );
    },
  });

  // Remove from cart mutation
  const removeFromCartMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const sessionId = getGuestSessionId();
      const result = await removeFromCart({
        data: { itemId, sessionId },
      });
      return result;
    },
    onMutate: async (itemId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: cartKeys.all });

      // Snapshot previous value
      const previousCart = queryClient.getQueryData<CartResponse>(
        cartKeys.session(guestSessionId),
      );

      // Optimistically update
      if (previousCart) {
        const updatedItems = previousCart.items.filter(
          (item) => item.id !== itemId,
        );
        const totalItems = updatedItems.reduce(
          (sum, item) => sum + item.quantity,
          0,
        );
        const subtotal = updatedItems.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0,
        );

        queryClient.setQueryData(cartKeys.session(guestSessionId), {
          ...previousCart,
          items: updatedItems,
          totalItems,
          subtotal,
        });
      }

      return { previousCart };
    },
    onError: (error: Error, _vars, context) => {
      // Rollback on error
      if (context?.previousCart) {
        queryClient.setQueryData(
          cartKeys.session(guestSessionId),
          context.previousCart,
        );
      }
      toast.error(error.message || "Failed to remove item");
    },
    onSuccess: (result) => {
      toast.success("Item removed from cart");
      // Update cache with server response
      queryClient.setQueryData(
        cartKeys.session(getGuestSessionId()),
        result.cart,
      );
    },
  });

  // Clear cart mutation
  const clearCartMutation = useMutation({
    mutationFn: async () => {
      const sessionId = getGuestSessionId();
      const result = await clearCart({ data: { sessionId } });
      return result;
    },
    onSuccess: (result) => {
      queryClient.setQueryData(
        cartKeys.session(getGuestSessionId()),
        result.cart,
      );
      toast.success("Cart cleared");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to clear cart");
    },
  });

  // Merge carts mutation (for when guest logs in)
  const mergeCartsMutation = useMutation({
    mutationFn: async () => {
      const guestSession = getGuestSessionId();
      if (!guestSession) {
        throw new Error("No guest session to merge");
      }
      const result = await mergeCarts({
        data: { guestSessionId: guestSession },
      });
      return result;
    },
    onSuccess: (result) => {
      // Clear guest session after merge
      clearGuestSessionId();
      // Update cache
      queryClient.setQueryData(cartKeys.session(undefined), result);
      invalidateCart();
      toast.success("Cart merged successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to merge carts");
    },
  });

  return {
    // Data
    items: (cart?.items || []) as CartItemResponse[],
    totalItems: cart?.totalItems || 0,
    subtotal: cart?.subtotal || 0,
    isLoading,
    error,

    // Actions
    addItem: addToCartMutation.mutateAsync,
    updateQuantity: (itemId: string, quantity: number) =>
      updateCartItemMutation.mutateAsync({ itemId, quantity }),
    removeItem: removeFromCartMutation.mutateAsync,
    clearCart: clearCartMutation.mutateAsync,
    mergeCarts: mergeCartsMutation.mutateAsync,
    refetch,

    // Loading states
    isAdding: addToCartMutation.isPending,
    isUpdating: updateCartItemMutation.isPending,
    isRemoving: removeFromCartMutation.isPending,
    isClearing: clearCartMutation.isPending,
    isMerging: mergeCartsMutation.isPending,
  };
}

// ============================================================================
// Cart Count Hook (Lightweight for header)
// ============================================================================

export function useCartCount() {
  const guestSessionId = getGuestSessionId();
  const { data: cart } = useQuery(cartQueryOptions(guestSessionId));

  return cart?.totalItems || 0;
}

// ============================================================================
// Export Types
// ============================================================================

export type { CartItemResponse, CartResponse };
