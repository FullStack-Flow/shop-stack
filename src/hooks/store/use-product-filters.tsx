/**
 * Store Product Filters Hook
 *
 * Hook for managing product filters on the store front.
 * Uses real API data via React Query with infinite scrolling pagination.
 */

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { storeBrandsQueryOptions } from "@/hooks/store/use-store-brands";
import { storeCategoriesQueryOptions } from "@/hooks/store/use-store-categories";
import { storeProductsInfiniteQueryOptions } from "@/hooks/store/use-store-product";
import { toDisplayProducts } from "@/lib/helper/products-query-helpers";
import type { FilterState } from "@/lib/store/product-filters-store";
import { getSortParams } from "@/lib/utils/product-sort";

/**
 * Type for the updateFilter function
 */
export type UpdateFilterFn = (
  key: keyof FilterState,
  value: FilterState[keyof FilterState],
) => void;

const initialState: FilterState = {
  search: "",
  sort: "relevance",
  categories: [],
  brands: [],
  priceRange: [0, 1000],
  colors: [],
  sizes: [],
  rating: null,
  availability: [],
  conditions: [],
};

// ============================================================================
// Hook
// ============================================================================

export const useProductFilters = () => {
  const [filters, setFilters] = useState<FilterState>(initialState);

  // Build base query params from filter state (without pagination)
  const baseQueryParams = useMemo(() => {
    const sortParams = getSortParams(filters.sort);

    return {
      search: filters.search || undefined,
      minPrice: filters.priceRange[0] > 0 ? filters.priceRange[0] : undefined,
      maxPrice:
        filters.priceRange[1] < 1000 ? filters.priceRange[1] : undefined,
      inStock: filters.availability.includes("In Stock") ? true : undefined,
      sortBy: sortParams.sortBy,
      sortDirection: sortParams.sortDirection,
    };
  }, [filters.search, filters.priceRange, filters.availability, filters.sort]);

  // Infinite query for products with server-side pagination using shared options
  const {
    data: infiniteData,
    isPending,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery(storeProductsInfiniteQueryOptions(baseQueryParams));

  // Fetch categories for filter sidebar
  const { data: categoriesData, isPending: isCategoriesPending } = useQuery(
    storeCategoriesQueryOptions({ limit: 50 }),
  );

  // Fetch brands for filter sidebar
  const { data: brandsData, isPending: isBrandsPending } = useQuery(
    storeBrandsQueryOptions({ limit: 50 }),
  );

  // Extract category and brand names for filters
  const availableCategories = useMemo(() => {
    return categoriesData?.data?.map((c) => c.name) ?? [];
  }, [categoriesData]);

  const availableBrands = useMemo(() => {
    return brandsData?.data?.map((b) => b.name) ?? [];
  }, [brandsData]);

  // Flatten all pages of products and apply client-side filtering
  const filteredProducts = useMemo(() => {
    // Flatten all pages
    const allProducts = infiniteData?.pages.flatMap((page) => page.data) ?? [];

    let result = allProducts;

    // Category filter (by name - client side for now)
    if (filters.categories.length > 0) {
      result = result.filter(
        (p) => p.categoryName && filters.categories.includes(p.categoryName),
      );
    }

    // Brand filter (by name - client side for now)
    if (filters.brands.length > 0) {
      result = result.filter(
        (p) => p.brandName && filters.brands.includes(p.brandName),
      );
    }

    // Transform to display format for UI components
    return toDisplayProducts(result);
  }, [infiniteData, filters.categories, filters.brands]);

  // Get total count from API (first page has the total)
  const totalProducts = infiniteData?.pages[0]?.total ?? 0;

  const updateFilter: UpdateFilterFn = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  // Derived state for active filters chips
  const activeFilters = useMemo(() => {
    const active = [];
    if (filters.search)
      active.push({
        id: "search",
        label: `Search: ${filters.search}`,
        type: "search",
      });
    filters.categories.forEach((c) => {
      active.push({ id: c, label: c, type: "category" });
    });
    filters.brands.forEach((b) => {
      active.push({ id: b, label: b, type: "brand" });
    });
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 1000) {
      active.push({
        id: "price",
        label: `$${filters.priceRange[0]} - $${filters.priceRange[1]}`,
        type: "price",
      });
    }
    filters.colors.forEach((c) => {
      active.push({ id: c, label: c, type: "color" });
    });
    filters.sizes.forEach((s) => {
      active.push({ id: s, label: `Size: ${s}`, type: "size" });
    });
    if (filters.rating)
      active.push({
        id: "rating",
        label: `${filters.rating}+ Stars`,
        type: "rating",
      });
    filters.availability.forEach((a) => {
      active.push({ id: a, label: a, type: "availability" });
    });
    filters.conditions.forEach((c) => {
      active.push({ id: c, label: c, type: "condition" });
    });

    return active;
  }, [filters]);

  const removeFilter = (id: string, type: string) => {
    switch (type) {
      case "search":
        updateFilter("search", "");
        break;
      case "category":
        updateFilter(
          "categories",
          filters.categories.filter((c) => c !== id),
        );
        break;
      case "brand":
        updateFilter(
          "brands",
          filters.brands.filter((b) => b !== id),
        );
        break;
      case "price":
        updateFilter("priceRange", [0, 1000]);
        break;
      case "color":
        updateFilter(
          "colors",
          filters.colors.filter((c) => c !== id),
        );
        break;
      case "size":
        updateFilter(
          "sizes",
          filters.sizes.filter((s) => s !== id),
        );
        break;
      case "rating":
        updateFilter("rating", null);
        break;
      case "availability":
        updateFilter(
          "availability",
          filters.availability.filter((a) => a !== id),
        );
        break;
      case "condition":
        updateFilter(
          "conditions",
          filters.conditions.filter((c) => c !== id),
        );
        break;
    }
  };

  const clearAllFilters = () => {
    setFilters(initialState);
  };

  return {
    filters,
    updateFilter,
    products: filteredProducts,
    totalProducts,
    isPending,
    error,
    activeFilters,
    removeFilter,
    clearAllFilters,
    // Expose categories and brands for filter sidebar
    availableCategories,
    availableBrands,
    isFilterDataPending: isCategoriesPending || isBrandsPending,
    // Infinite scrolling controls
    fetchNextPage,
    hasNextPage: hasNextPage ?? false,
    isFetchingNextPage,
  };
};
