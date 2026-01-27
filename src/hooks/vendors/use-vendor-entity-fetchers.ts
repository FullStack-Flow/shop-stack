import type {
  DataTableFetchParams,
  DataTableFetchResult,
} from "@/components/base/data-table/types";
import { getAttributes } from "@/lib/functions/vendor/attribute";
import { getBrands } from "@/lib/functions/vendor/brands";
import { getCategories } from "@/lib/functions/vendor/categories";
import { getTags } from "@/lib/functions/vendor/tag";
import {
  booleanFilterTransform,
  createServerFetcher,
} from "@/lib/helper/create-server-fetcher";
import type { AttributeItem } from "@/types/attributes";
import type { BrandItem } from "@/types/brands";
import type { NormalizedCategory } from "@/types/category-types";
import type { TagItem } from "@/types/tags";

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
): (params: DataTableFetchParams) => Promise<DataTableFetchResult<BrandItem>> {
  return createServerFetcher<BrandItem, any>({
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

export function createVendorAttributesFetcher(
  shopId: string,
): (
  params: DataTableFetchParams,
) => Promise<DataTableFetchResult<AttributeItem>> {
  return createServerFetcher<AttributeItem, any>({
    fetchFn: async (query) => {
      const response = await getAttributes({ data: { ...query, shopId } });
      return { data: response.data ?? [], total: response.total ?? 0 };
    },
    sortFieldMap: { name: "name", createdAt: "createdAt" },
    filterFieldMap: { isActive: "isActive", type: "type" },
    defaultQuery: { sortBy: "sortOrder", sortDirection: "asc" },
    transformFilters: booleanFilterTransform,
  });
}

export function createVendorTagsFetcher(
  shopId: string,
): (params: DataTableFetchParams) => Promise<DataTableFetchResult<TagItem>> {
  return createServerFetcher<TagItem, any>({
    fetchFn: async (query) => {
      const response = await getTags({ data: { ...query, shopId } });
      return { data: response.data ?? [], total: response.total ?? 0 };
    },
    sortFieldMap: {
      name: "name",
      createdAt: "createdAt",
      productCount: "productCount",
    },
    filterFieldMap: { isActive: "isActive" },
    defaultQuery: { sortBy: "sortOrder", sortDirection: "asc" },
    transformFilters: booleanFilterTransform,
  });
}
