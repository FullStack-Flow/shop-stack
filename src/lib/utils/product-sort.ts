/**
 * Product Sort Utilities
 *
 * Shared utilities for mapping sort options to API parameters.
 */

import type { SortOption } from "@/types/products";

/**
 * Maps frontend sort options to API sort parameters
 */
export const sortMapping: Record<
  SortOption,
  { sortBy: "name" | "price" | "createdAt"; sortDirection: "asc" | "desc" }
> = {
  relevance: { sortBy: "createdAt", sortDirection: "desc" },
  "price-asc": { sortBy: "price", sortDirection: "asc" },
  "price-desc": { sortBy: "price", sortDirection: "desc" },
  newest: { sortBy: "createdAt", sortDirection: "desc" },
  rating: { sortBy: "createdAt", sortDirection: "desc" }, // TODO: Add rating sort when available
  "best-selling": { sortBy: "createdAt", sortDirection: "desc" }, // TODO: Add sales sort when available
};

/**
 * Get API sort parameters from a sort option
 */
export const getSortParams = (sort: SortOption) => {
  return sortMapping[sort] || sortMapping.relevance;
};
