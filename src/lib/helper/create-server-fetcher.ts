/**
 * Generic Server-Side Fetcher Factory
 *
 * Provides reusable utilities for creating server-side data fetchers
 * that work with the DataTable component. This factory pattern allows
 * any listing page to implement server-side pagination, sorting, and filtering.
 *
 * @example
 * // Usage for admin products
 * const fetcher = createServerFetcher({
 *   fetchFn: (query) => getAdminProducts({ data: query }),
 *   sortFieldMap: { name: 'name', price: 'sellingPrice' },
 * });
 */

import type {
  DataTableFetchParams,
  DataTableFetchResult,
} from "@/components/base/data-table/types";

// ============================================================================
// Types
// ============================================================================

/**
 * Maps DataTable column IDs to server-side field names
 * Use this when column IDs differ from database column names
 */
export type SortFieldMap = Record<string, string>;

/**
 * Maps DataTable column filter IDs to server query parameter names
 */
export type FilterFieldMap = Record<string, string>;

/**
 * Standard paginated API response format
 */
export interface PaginatedApiResponse<T> {
  data: T[];
  total: number;
  limit?: number;
  offset?: number;
}

/**
 * Query parameters that most listing APIs expect
 */
export interface BaseServerQuery {
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
  search?: string;
  [key: string]: unknown;
}

/**
 * Configuration for creating a server fetcher
 */
export interface ServerFetcherConfig<TData, TQuery extends BaseServerQuery> {
  /**
   * The server function to call for fetching data
   * Should return PaginatedApiResponse format
   */
  fetchFn: (query: TQuery) => Promise<PaginatedApiResponse<TData>>;

  /**
   * Maps DataTable sort column IDs to server field names
   * @example { name: 'name', price: 'sellingPrice', createdAt: 'createdAt' }
   */
  sortFieldMap?: SortFieldMap;

  /**
   * Maps DataTable column filter IDs to server query parameter names
   * @example { status: 'status', shopName: 'shopId' }
   */
  filterFieldMap?: FilterFieldMap;

  /**
   * Default query parameters to merge with every request
   * @example { includeInactive: false }
   */
  defaultQuery?: Partial<TQuery>;

  /**
   * Transform column filter values before sending to server
   * Useful for converting display values to IDs
   */
  transformFilters?: (
    filters: Record<string, unknown>
  ) => Record<string, unknown>;

  /**
   * Custom query builder for complex filter logic
   * Called after standard translation, allows full customization
   */
  buildQuery?: (params: DataTableFetchParams, baseQuery: TQuery) => TQuery;
}

// ============================================================================
// Core Factory Function
// ============================================================================

/**
 * Creates a server-side fetcher function compatible with DataTable
 *
 * This factory translates DataTable's internal state (pagination, sorting, filters)
 * into server API query parameters, executes the fetch, and formats the response
 * for DataTable consumption.
 *
 * @param config - Configuration object for the fetcher
 * @returns A fetcher function that can be passed to DataTable's server prop
 *
 * @example
 * const productsFetcher = createServerFetcher({
 *   fetchFn: (query) => getAdminProducts({ data: query }),
 *   sortFieldMap: { name: 'name', price: 'sellingPrice' },
 *   defaultQuery: { sortBy: 'createdAt', sortDirection: 'desc' },
 * });
 *
 * <DataTable server={{ fetcher: productsFetcher }} />
 */
export function createServerFetcher<TData, TQuery extends BaseServerQuery>(
  config: ServerFetcherConfig<TData, TQuery>
): (params: DataTableFetchParams) => Promise<DataTableFetchResult<TData>> {
  const {
    fetchFn,
    sortFieldMap = {},
    filterFieldMap = {},
    defaultQuery = {},
    transformFilters,
    buildQuery,
  } = config;

  return async (
    params: DataTableFetchParams
  ): Promise<DataTableFetchResult<TData>> => {
    const { pageIndex, pageSize, sorting, columnFilters, globalFilter } =
      params;

    // 1. Build base pagination
    const baseQuery: BaseServerQuery = {
      limit: pageSize,
      offset: pageIndex * pageSize,
    };

    // 2. Handle sorting
    if (sorting.length > 0) {
      const sortCol = sorting[0];
      const mappedField = sortFieldMap[sortCol.id] ?? sortCol.id;
      baseQuery.sortBy = mappedField;
      baseQuery.sortDirection = sortCol.desc ? "desc" : "asc";
    }

    // 3. Handle global search
    if (globalFilter?.trim()) {
      baseQuery.search = globalFilter.trim();
    }

    // 4. Handle column filters
    const filters: Record<string, unknown> = {};
    for (const filter of columnFilters) {
      const mappedField = filterFieldMap[filter.id] ?? filter.id;
      filters[mappedField] = filter.value;
    }

    // Apply filter transformation if provided
    const transformedFilters = transformFilters
      ? transformFilters(filters)
      : filters;

    // Merge filters into query
    Object.assign(baseQuery, transformedFilters);

    // 5. Merge with defaults
    const mergedQuery = {
      ...defaultQuery,
      ...baseQuery,
    } as TQuery;

    // 6. Apply custom query builder if provided
    const finalQuery = buildQuery
      ? buildQuery(params, mergedQuery)
      : mergedQuery;

    // 7. Execute fetch
    const response = await fetchFn(finalQuery);

    // 8. Format response for DataTable
    return {
      rows: response.data ?? [],
      pageCount: Math.ceil((response.total ?? 0) / pageSize),
      total: response.total ?? 0,
    };
  };
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Creates a simple fetcher for boolean filters
 * Converts string 'true'/'false' to actual booleans
 */
export function booleanFilterTransform(
  filters: Record<string, unknown>
): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(filters)) {
    if (value === "true") {
      result[key] = true;
    } else if (value === "false") {
      result[key] = false;
    } else {
      result[key] = value;
    }
  }
  return result;
}

/**
 * Combines multiple filter transform functions
 */
export function composeFilterTransforms(
  ...transforms: Array<
    (filters: Record<string, unknown>) => Record<string, unknown>
  >
): (filters: Record<string, unknown>) => Record<string, unknown> {
  return (filters) =>
    transforms.reduce((acc, transform) => transform(acc), filters);
}
