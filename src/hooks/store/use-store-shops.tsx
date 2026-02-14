/**
 * Store Shops Hook
 *
 * React Query hooks for store front shop/store listing.
 * Used in the public-facing store pages.
 */

import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";
import { getStoreShopBySlug, getStoreShops } from "@/lib/functions/store/shop";

// ============================================================================
// Types
// ============================================================================

export interface StoreShopsQueryParams {
  limit?: number;
  search?: string;
  category?: string;
  sortBy?: "name" | "rating" | "createdAt" | "totalProducts";
  sortDirection?: "asc" | "desc";
}

// ============================================================================
// Query Keys
// ============================================================================

export const storeShopsKeys = {
  all: ["store", "shops"] as const,
  lists: () => [...storeShopsKeys.all, "list"] as const,
  list: (params: StoreShopsQueryParams & { offset?: number }) =>
    [...storeShopsKeys.lists(), params] as const,
  infinite: (params: StoreShopsQueryParams) =>
    [...storeShopsKeys.lists(), "infinite", params] as const,
  details: () => [...storeShopsKeys.all, "detail"] as const,
  detailBySlug: (slug: string) =>
    [...storeShopsKeys.details(), "slug", slug] as const,
};

// ============================================================================
// Query Options
// ============================================================================

/**
 * Query options for fetching store shops list (paginated)
 */
export const storeShopsQueryOptions = (
  params: StoreShopsQueryParams & { offset?: number } = {},
) =>
  queryOptions({
    queryKey: storeShopsKeys.list(params),
    queryFn: () => getStoreShops({ data: params }),
  });

/**
 * Infinite query options for fetching store shops with infinite scroll
 */
export const storeShopsInfiniteQueryOptions = (
  params: StoreShopsQueryParams = {},
) => {
  const initialLimit = params.limit ?? 12;
  const subsequentLimit = 6;

  return infiniteQueryOptions({
    queryKey: storeShopsKeys.infinite(params),
    queryFn: async ({ pageParam = 0 }) => {
      const isFirstPage = pageParam === 0;
      const limit = isFirstPage ? initialLimit : subsequentLimit;

      const result = await getStoreShops({
        data: {
          ...params,
          limit,
          offset: pageParam,
        },
      });

      return result;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      // Calculate total items fetched so far
      const totalFetched = allPages.reduce(
        (acc, page) => acc + page.data.length,
        0,
      );

      // If we've fetched all items, return undefined to stop pagination
      if (totalFetched >= lastPage.total) {
        return undefined;
      }

      // Return the next offset
      return totalFetched;
    },
  });
};

/**
 * Query options for fetching a single shop by slug
 */
export const storeShopBySlugQueryOptions = (slug: string) =>
  queryOptions({
    queryKey: storeShopsKeys.detailBySlug(slug),
    queryFn: () => getStoreShopBySlug({ data: { slug } }),
    enabled: !!slug,
  });
