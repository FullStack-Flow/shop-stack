/**
 * Vendor Transactions Hooks
 *
 * React Query hooks for vendor transaction management.
 */

import { useQuery } from "@tanstack/react-query";
import { getVendorTransactionStats } from "@/lib/functions/vendor/transactions";

// ============================================================================
// Query Keys
// ============================================================================

export const vendorTransactionKeys = {
  all: ["vendor-transactions"] as const,
  list: (params?: {
    limit?: number;
    offset?: number;
    status?: string;
    shopSlug?: string;
  }) => [...vendorTransactionKeys.all, "list", params] as const,
  stats: (shopSlug?: string) =>
    [...vendorTransactionKeys.all, "stats", shopSlug] as const,
};

// ============================================================================
// Hooks
// ============================================================================

/**
 * Hook to fetch vendor transaction stats
 */
export function useVendorTransactionStats(shopSlug?: string) {
  return useQuery({
    queryKey: vendorTransactionKeys.stats(shopSlug),
    queryFn: async () => {
      const result = await getVendorTransactionStats({
        data: { shopSlug },
      });
      return result;
    },
  });
}
