/**
 * Checkout Hooks
 *
 * React Query hooks for checkout operations.
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  cancelOrder,
  confirmPayment,
  createCheckoutSession,
  getCustomerOrders,
  getOrderById,
  getOrderPaymentSession,
  getOrdersByIds,
} from "@/lib/functions/store/order";
import type {
  CancelOrderInput,
  ConfirmPaymentInput,
  CreateCheckoutSessionInput,
  GetOrderByIdInput,
  GetOrdersByIdsInput,
  GetOrdersInput,
} from "@/lib/validators/order";
import type { CheckoutSessionData } from "@/types/orders";

// ============================================================================
// Query Keys
// ============================================================================

const orderKeys = {
  all: ["orders"] as const,
  lists: () => [...orderKeys.all, "list"] as const,
  list: (filters: GetOrdersInput) => [...orderKeys.lists(), filters] as const,
  details: () => [...orderKeys.all, "detail"] as const,
  detail: (id: string) => [...orderKeys.details(), id] as const,
  batch: (ids: string[]) =>
    [...orderKeys.all, "batch", [...ids].sort()] as const,
};

// ============================================================================
// Checkout Session Storage Key
// ============================================================================

const CHECKOUT_SESSION_KEY = "checkout-session-data";
/**
 * Store checkout session data in localStorage
 */
export function storeCheckoutSession(data: CheckoutSessionData): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(CHECKOUT_SESSION_KEY, JSON.stringify(data));
  }
}

/**
 * Retrieve checkout session data from localStorage
 */
export function getCheckoutSession(): CheckoutSessionData | null {
  if (typeof window !== "undefined") {
    const data = localStorage.getItem(CHECKOUT_SESSION_KEY);
    if (data) {
      try {
        return JSON.parse(data);
      } catch {
        return null;
      }
    }
  }
  return null;
}

/**
 * Clear checkout session from localStorage
 */
export function clearCheckoutSession(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(CHECKOUT_SESSION_KEY);
  }
}

// ============================================================================
// Checkout Session Mutation
// ============================================================================

export function useCreateCheckoutSession(options?: {
  onSuccess?: (data: CheckoutSessionData) => void;
}) {
  return useMutation({
    mutationFn: async (data: CreateCheckoutSessionInput) => {
      const result = await createCheckoutSession({ data });
      return result;
    },
    onSuccess: (result) => {
      // Store the checkout session data
      const sessionData: CheckoutSessionData = {
        orderIds: result.orderIds,
        paymentIntentId: result.paymentIntentId,
        clientSecret: result.clientSecret,
        totalAmount: result.totalAmount,
      };
      storeCheckoutSession(sessionData);

      // Call custom success handler if provided
      options?.onSuccess?.(sessionData);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create checkout session");
    },
  });
}

// ============================================================================
// Confirm Payment Mutation
// ============================================================================

export function useConfirmPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ConfirmPaymentInput) => {
      const result = await confirmPayment({ data });
      return result;
    },
    onSuccess: () => {
      // Clear checkout session after successful payment
      clearCheckoutSession();

      // Invalidate orders to refresh the list
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
      toast.success("Payment confirmed successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to confirm payment");
    },
  });
}

// ============================================================================
// Get Customer Orders
// ============================================================================

export function useCustomerOrders(input?: Partial<GetOrdersInput>) {
  return useQuery({
    queryKey: orderKeys.list({ limit: 10, offset: 0, ...input }),
    queryFn: async () => {
      const result = await getCustomerOrders({
        data: { limit: 10, offset: 0, ...input },
      });
      return result;
    },
  });
}

// ============================================================================
// Get Order By ID
// ============================================================================

export function useOrderById(orderId: string) {
  return useQuery({
    queryKey: orderKeys.detail(orderId),
    queryFn: async () => {
      const result = await getOrderById({ data: { orderId } });
      return result.order;
    },
    enabled: !!orderId,
  });
}

// ============================================================================
// Get Orders By IDs (Batch)
// ============================================================================

export function useOrdersByIds(input: GetOrdersByIdsInput) {
  return useQuery({
    queryKey: orderKeys.batch(input.orderIds),
    queryFn: async () => {
      const result = await getOrdersByIds({ data: input });
      return result.orders;
    },
    enabled: input.orderIds.length > 0,
  });
}

// ============================================================================
// Cancel Order Mutation
// ============================================================================

export function useCancelOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CancelOrderInput) => {
      const result = await cancelOrder({ data });
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
      toast.success("Order cancelled successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to cancel order");
    },
  });
}

// ============================================================================
// Get Order Payment Session Mutation
// ============================================================================

export function useGetOrderPaymentSession(options?: {
  onSuccess?: (data: CheckoutSessionData) => void;
}) {
  return useMutation({
    mutationFn: async (data: GetOrderByIdInput) => {
      const result = await getOrderPaymentSession({ data });
      return result;
    },
    onSuccess: (result) => {
      options?.onSuccess?.(result);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to retrieve payment session");
    },
  });
}
