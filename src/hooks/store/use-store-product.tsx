/**
 * Store Products Hook
 *
 * React Query hooks for store front product listing.
 * Used in the public-facing product pages.
 */

import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";
import { PRODUCTS_PAGE_SIZE } from "@/lib/constants/store-products";
import {
  getFeaturedProducts,
  getRelatedProducts,
  getStoreProductById,
  getStoreProductBySlug,
  getStoreProducts,
} from "@/lib/functions/store/products";
import type { StoreProductsQuery } from "@/lib/validators/shared/product-query";

// ============================================================================
// Query Keys
// ============================================================================

export const storeProductsKeys = {
  all: ["store", "products"] as const,
  lists: () => [...storeProductsKeys.all, "list"] as const,
  list: (params: Partial<StoreProductsQuery>) =>
    [...storeProductsKeys.lists(), params] as const,
  infinite: (params: Partial<StoreProductsQuery>) =>
    [...storeProductsKeys.all, "infinite", params] as const,
  details: () => [...storeProductsKeys.all, "detail"] as const,
  detailBySlug: (slug: string, shopSlug?: string) =>
    [...storeProductsKeys.details(), "slug", slug, shopSlug] as const,
  detailById: (id: string) =>
    [...storeProductsKeys.details(), "id", id] as const,
  featured: (limit?: number) =>
    [...storeProductsKeys.all, "featured", limit] as const,
  related: (productId: string, limit?: number) =>
    [...storeProductsKeys.all, "related", productId, limit] as const,
};

// ============================================================================
// Default Query Params
// ============================================================================

const defaultParams: Partial<StoreProductsQuery> = {
  limit: PRODUCTS_PAGE_SIZE.initial,
  offset: 0,
  sortBy: "createdAt",
  sortDirection: "desc",
};

// ============================================================================
// Query Options
// ============================================================================

/**
 * Query options for fetching store products with pagination and filters
 */
export const storeProductsQueryOptions = (
  params: Partial<StoreProductsQuery> = {},
) => {
  const mergedParams = { ...defaultParams, ...params };
  return queryOptions({
    queryKey: storeProductsKeys.list(mergedParams),
    queryFn: () => getStoreProducts({ data: mergedParams }),
  });
};

/**
 * Infinite query options for fetching store products with infinite scrolling
 * Used for the main product listing page with load-more pagination
 */
export const storeProductsInfiniteQueryOptions = (
  params: Partial<Omit<StoreProductsQuery, "limit" | "offset">> = {},
) => {
  // Base params without pagination (used as query key)
  const baseParams = {
    search: params.search,
    minPrice: params.minPrice,
    maxPrice: params.maxPrice,
    inStock: params.inStock,
    sortBy: params.sortBy ?? defaultParams.sortBy,
    sortDirection: params.sortDirection ?? defaultParams.sortDirection,
  };

  return infiniteQueryOptions({
    queryKey: storeProductsKeys.infinite(baseParams),
    queryFn: async ({ pageParam = 0 }) => {
      const isFirstPage = pageParam === 0;
      const limit = isFirstPage
        ? PRODUCTS_PAGE_SIZE.initial
        : PRODUCTS_PAGE_SIZE.subsequent;

      const result = await getStoreProducts({
        data: {
          ...baseParams,
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
 * Query options for fetching a single product by slug
 */
export const storeProductBySlugQueryOptions = (
  slug: string,
  shopSlug?: string,
) =>
  queryOptions({
    queryKey: storeProductsKeys.detailBySlug(slug, shopSlug),
    queryFn: () => getStoreProductBySlug({ data: { slug, shopSlug } }),
    enabled: !!slug,
  });

/**
 * Query options for fetching a single product by ID
 */
export const storeProductByIdQueryOptions = (id: string) =>
  queryOptions({
    queryKey: storeProductsKeys.detailById(id),
    queryFn: () => getStoreProductById({ data: { id } }),
    enabled: !!id,
  });

/**
 * Query options for fetching featured products
 */
export const featuredProductsQueryOptions = (limit: number = 8) =>
  queryOptions({
    queryKey: storeProductsKeys.featured(limit),
    queryFn: () => getFeaturedProducts({ data: { limit } }),
  });

/**
 * Query options for fetching related products
 */
export const relatedProductsQueryOptions = (
  productId: string,
  limit: number = 4,
) =>
  queryOptions({
    queryKey: storeProductsKeys.related(productId, limit),
    queryFn: () => getRelatedProducts({ data: { productId, limit } }),
    enabled: !!productId,
  });

// ============================================================================
// Combined Hook
// ============================================================================

/**
 * Combined hook for store product queries
 * Provides a unified interface for all store product query options
 */
export const useStoreProducts = () => ({
  productsQueryOptions: storeProductsQueryOptions,
  productBySlugQueryOptions: storeProductBySlugQueryOptions,
  productByIdQueryOptions: storeProductByIdQueryOptions,
  infiniteProductsQueryOptions: storeProductsInfiniteQueryOptions,
  featuredProductsQueryOptions,
  relatedProductsQueryOptions,
});
