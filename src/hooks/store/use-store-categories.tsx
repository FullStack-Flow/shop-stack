/**
 * Store Categories Hook
 *
 * React Query hooks for store front category listing.
 * Used in the public-facing product filter pages.
 */

import { queryOptions } from "@tanstack/react-query";
import {
  getCategoryTree,
  getFeaturedCategories,
  getStoreCategories,
  getStoreCategoryBySlug,
  getSubcategories,
} from "@/lib/functions/store/categories";
import type { StoreCategoriesQuery } from "@/lib/validators/shared/category-query";

// ============================================================================
// Query Keys
// ============================================================================

export const storeCategoriesKeys = {
  all: ["store", "categories"] as const,
  lists: () => [...storeCategoriesKeys.all, "list"] as const,
  list: (params: Partial<StoreCategoriesQuery>) =>
    [...storeCategoriesKeys.lists(), params] as const,
  details: () => [...storeCategoriesKeys.all, "detail"] as const,
  detailBySlug: (slug: string, shopSlug?: string) =>
    [...storeCategoriesKeys.details(), "slug", slug, shopSlug] as const,
  featured: (limit?: number) =>
    [...storeCategoriesKeys.all, "featured", limit] as const,
  tree: (shopSlug?: string, maxDepth?: number) =>
    [...storeCategoriesKeys.all, "tree", shopSlug, maxDepth] as const,
  subcategories: (parentId: string) =>
    [...storeCategoriesKeys.all, "subcategories", parentId] as const,
};

// ============================================================================
// Default Query Params
// ============================================================================

const defaultParams: Partial<StoreCategoriesQuery> = {
  limit: 50,
  offset: 0,
  sortBy: "sortOrder",
  sortDirection: "asc",
};

// ============================================================================
// Query Options
// ============================================================================

/**
 * Query options for fetching store categories
 */
export const storeCategoriesQueryOptions = (
  params: Partial<StoreCategoriesQuery> = {},
) => {
  const mergedParams = { ...defaultParams, ...params };
  return queryOptions({
    queryKey: storeCategoriesKeys.list(mergedParams),
    queryFn: () => getStoreCategories({ data: mergedParams }),
  });
};

/**
 * Query options for fetching a single category by slug
 */
export const storeCategoryBySlugQueryOptions = (
  slug: string,
  shopSlug?: string,
) =>
  queryOptions({
    queryKey: storeCategoriesKeys.detailBySlug(slug, shopSlug),
    queryFn: () => getStoreCategoryBySlug({ data: { slug, shopSlug } }),
    enabled: !!slug,
  });

/**
 * Query options for fetching featured categories
 */
export const featuredCategoriesQueryOptions = (limit: number = 8) =>
  queryOptions({
    queryKey: storeCategoriesKeys.featured(limit),
    queryFn: () => getFeaturedCategories({ data: { limit } }),
  });

/**
 * Query options for fetching the category tree
 */
export const categoryTreeQueryOptions = (
  shopSlug?: string,
  maxDepth: number = 3,
) =>
  queryOptions({
    queryKey: storeCategoriesKeys.tree(shopSlug, maxDepth),
    queryFn: () => getCategoryTree({ data: { shopSlug, maxDepth } }),
  });

/**
 * Query options for fetching subcategories of a parent category
 */
export const subcategoriesQueryOptions = (
  parentId: string,
  limit: number = 20,
) =>
  queryOptions({
    queryKey: storeCategoriesKeys.subcategories(parentId),
    queryFn: () => getSubcategories({ data: { parentId, limit } }),
    enabled: !!parentId,
  });
