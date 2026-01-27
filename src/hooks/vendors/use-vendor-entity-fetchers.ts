import type {
  DataTableFetchParams,
  DataTableFetchResult,
} from "@/components/base/data-table/types";
import { getBrands } from "@/lib/functions/vendor/brands";
import { getCategories } from "@/lib/functions/vendor/categories";
import {
  booleanFilterTransform,
  createServerFetcher,
} from "@/lib/helper/create-server-fetcher";
import type { NormalizedBrand } from "@/types/brands";
import type { NormalizedCategory } from "@/types/category-types";

export const VENDOR_STATUS_OPTIONS = [
  { label: "Active", value: "true" },
  { label: "Inactive", value: "false" },
];

export function createVendorCategoriesFetcher(
  shopId: string,
): (
  params: DataTableFetchParams,
) => Promise<DataTableFetchResult<NormalizedCategory>> {
  return createServerFetcher<NormalizedCategory, any>({
    fetchFn: async (query) => {
      const response = await getCategories({ data: { ...query, shopId } });
      return { data: response.data ?? [], total: response.total ?? 0 };
    },
    sortFieldMap: { name: "name", level: "level", createdAt: "createdAt" },
    filterFieldMap: { isActive: "isActive", featured: "featured" },
    defaultQuery: { sortBy: "sortOrder", sortDirection: "asc" },
    transformFilters: booleanFilterTransform,
  });
}

export function createVendorBrandsFetcher(
  shopId: string,
): (
  params: DataTableFetchParams,
) => Promise<DataTableFetchResult<NormalizedBrand>> {
  return createServerFetcher<NormalizedBrand, any>({
    fetchFn: async (query) => {
      const response = await getBrands({ data: { ...query, shopId } });
      return { data: response.data ?? [], total: response.total ?? 0 };
    },
    sortFieldMap: { name: "name", createdAt: "createdAt" },
    filterFieldMap: { isActive: "isActive" },
    defaultQuery: { sortBy: "sortOrder", sortDirection: "asc" },
    transformFilters: booleanFilterTransform,
  });
}
