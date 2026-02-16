/**
 * Shop Dashboard Hook
 *
 * React Query hook for fetching aggregated shop dashboard data.
 * Follows the queryOptions pattern for consistency with the codebase.
 */

import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { getShopDashboardData } from "@/lib/functions/vendor/dashboard";
import type { ShopDashboardData } from "@/types/shop-dashboard";

// ============================================================================
// Query Keys
// ============================================================================

export const shopDashboardKeys = {
  all: ["vendor", "dashboard"] as const,
  byShop: (shopId: string) => [...shopDashboardKeys.all, shopId] as const,
};

// ============================================================================
// Query Options
// ============================================================================

export const shopDashboardQueryOptions = (shopId: string, shopSlug: string) =>
  queryOptions({
    queryKey: shopDashboardKeys.byShop(shopId),
    queryFn: () => getShopDashboardData({ data: { shopId, shopSlug } }),
    enabled: !!shopId && !!shopSlug,
    // Dashboard data is refreshed every 2 minutes
    staleTime: 2 * 60 * 1000,
  });

// ============================================================================
// Hook
// ============================================================================

/**
 * Hook to fetch aggregated shop dashboard data
 */
export function useShopDashboard(shopId: string, shopSlug: string) {
  const { data, ...rest } = useSuspenseQuery(
    shopDashboardQueryOptions(shopId, shopSlug),
  );

  return {
    data: data as ShopDashboardData,
    ...rest,
  };
}
