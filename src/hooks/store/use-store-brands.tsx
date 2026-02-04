/**
 * Store Brands Hook
 *
 * React Query hooks for store front brand listing.
 * Used in the public-facing product filter pages.
 */

import { queryOptions } from "@tanstack/react-query";
import {
  getPopularBrands,
  getStoreBrandBySlug,
  getStoreBrands,
} from "@/lib/functions/store/brands";
import type { StoreBrandsQuery } from "@/lib/validators/shared/brand-query";

// ============================================================================
// Query Keys
// ============================================================================

export const storeBrandsKeys = {
  all: ["store", "brands"] as const,
  lists: () => [...storeBrandsKeys.all, "list"] as const,
  list: (params: Partial<StoreBrandsQuery>) =>
    [...storeBrandsKeys.lists(), params] as const,
  details: () => [...storeBrandsKeys.all, "detail"] as const,
  detailBySlug: (slug: string, shopSlug?: string) =>
    [...storeBrandsKeys.details(), "slug", slug, shopSlug] as const,
  popular: (limit?: number) =>
    [...storeBrandsKeys.all, "popular", limit] as const,
};

// ============================================================================
// Default Query Params
// ============================================================================

const defaultParams: Partial<StoreBrandsQuery> = {
  limit: 50,
  offset: 0,
  sortBy: "name",
  sortDirection: "asc",
};

// ============================================================================
// Query Options
// ============================================================================

/**
 * Query options for fetching store brands
 */
export const storeBrandsQueryOptions = (
  params: Partial<StoreBrandsQuery> = {},
) => {
  const mergedParams = { ...defaultParams, ...params };
  return queryOptions({
    queryKey: storeBrandsKeys.list(mergedParams),
    queryFn: () => getStoreBrands({ data: mergedParams }),
  });
};

/**
 * Query options for fetching a single brand by slug
 */
export const storeBrandBySlugQueryOptions = (slug: string, shopSlug?: string) =>
  queryOptions({
    queryKey: storeBrandsKeys.detailBySlug(slug, shopSlug),
    queryFn: () => getStoreBrandBySlug({ data: { slug, shopSlug } }),
    enabled: !!slug,
  });

/**
 * Query options for fetching popular brands
 */
export const popularBrandsQueryOptions = (limit: number = 10) =>
  queryOptions({
    queryKey: storeBrandsKeys.popular(limit),
    queryFn: () => getPopularBrands({ data: { limit } }),
  });
