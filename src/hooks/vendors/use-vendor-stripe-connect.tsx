/**
 * Vendor Stripe Connect Hook
 *
 * React Query hooks for vendor Stripe Connect operations.
 * Handles onboarding, status checking, and dashboard access.
 */

import {
  queryOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getStripeDashboardLink,
  getVendorStripeStatus,
  startStripeOnboarding,
} from "@/lib/functions/vendor/vendor-connect";
import type { StripeConnectStatus } from "@/types/orders";

// ============================================================================
// Query Keys
// ============================================================================

export const vendorStripeConnectKeys = {
  all: ["vendor", "stripe-connect"] as const,
  status: (shopSlug: string) =>
    [...vendorStripeConnectKeys.all, "status", shopSlug] as const,
};

// ============================================================================
// Query Options
// ============================================================================

/**
 * Query options for fetching vendor's Stripe Connect status
 */
export const vendorStripeStatusQueryOptions = (shopSlug: string) =>
  queryOptions({
    queryKey: vendorStripeConnectKeys.status(shopSlug),
    queryFn: () => getVendorStripeStatus({ data: { shopSlug } }),
    enabled: !!shopSlug,
  });

// ============================================================================
// Mutation Hooks
// ============================================================================

interface UseStartStripeOnboardingOptions {
  onSuccess?: (data: { url: string }) => void;
}

/**
 * Hook for starting Stripe Connect onboarding
 */
export function useStartStripeOnboarding(
  options?: UseStartStripeOnboardingOptions,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { shopSlug: string; returnPath?: string }) => {
      const result = await startStripeOnboarding({
        data: {
          shopSlug: params.shopSlug,
          returnPath: params.returnPath,
        },
      });
      return result;
    },
    onSuccess: (data, variables) => {
      // Invalidate status query to reflect any changes
      queryClient.invalidateQueries({
        queryKey: vendorStripeConnectKeys.status(variables.shopSlug),
      });
      options?.onSuccess?.(data);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to start Stripe onboarding");
    },
  });
}

interface UseGetStripeDashboardOptions {
  onSuccess?: (data: { url: string }) => void;
}

/**
 * Hook for getting Stripe Express Dashboard link
 */
export function useGetStripeDashboard(options?: UseGetStripeDashboardOptions) {
  return useMutation({
    mutationFn: async () => {
      const result = await getStripeDashboardLink();
      return result;
    },
    onSuccess: (data) => {
      options?.onSuccess?.(data);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to access Stripe dashboard");
    },
  });
}

interface UseDisconnectStripeOptions {
  onSuccess?: () => void;
}

/**
 * Hook for disconnecting Stripe account
 */
export function useDisconnectStripe(
  shopSlug: string,
  options?: UseDisconnectStripeOptions,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { disconnectStripeAccount } =
        await import("@/lib/functions/vendor/vendor-connect");
      const result = await disconnectStripeAccount();
      return result;
    },
    onSuccess: () => {
      // Invalidate status query to reflect disconnection
      queryClient.invalidateQueries({
        queryKey: vendorStripeConnectKeys.status(shopSlug),
      });
      toast.success("Stripe account disconnected successfully");
      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to disconnect Stripe account");
    },
  });
}

// ============================================================================
// Combined Hook
// ============================================================================

interface UseVendorStripeConnectOptions {
  onOnboardingSuccess?: (url: string) => void;
  onDashboardSuccess?: (url: string) => void;
  onDisconnectSuccess?: () => void;
}

/**
 * Combined hook for all Stripe Connect operations
 */
export function useVendorStripeConnect(
  shopSlug: string,
  options?: UseVendorStripeConnectOptions,
) {
  // Status query options for external use
  const statusQueryOptions = vendorStripeStatusQueryOptions(shopSlug);

  // Mutation for starting onboarding
  const startOnboarding = useStartStripeOnboarding({
    onSuccess: (data) => {
      options?.onOnboardingSuccess?.(data.url);
    },
  });

  // Mutation for opening dashboard
  const openDashboard = useGetStripeDashboard({
    onSuccess: (data) => {
      options?.onDashboardSuccess?.(data.url);
    },
  });

  // Mutation for disconnecting
  const disconnect = useDisconnectStripe(shopSlug, {
    onSuccess: () => {
      options?.onDisconnectSuccess?.();
    },
  });

  return {
    statusQueryOptions,
    startOnboarding,
    openDashboard,
    disconnect,
  };
}

// ============================================================================
// Types Re-export
// ============================================================================

export type { StripeConnectStatus };
