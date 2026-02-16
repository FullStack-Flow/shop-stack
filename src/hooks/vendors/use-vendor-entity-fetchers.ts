import type {
  DataTableFetchParams,
  DataTableFetchResult,
} from "@/components/base/data-table/types";
import { getAttributes } from "@/lib/functions/vendor/attribute";
import { getBrands } from "@/lib/functions/vendor/brands";
import { getCategories } from "@/lib/functions/vendor/categories";
import { getCoupons } from "@/lib/functions/vendor/coupons";
import { getVendorOrders } from "@/lib/functions/vendor/order";
import { getProducts } from "@/lib/functions/vendor/products";
import { getTags } from "@/lib/functions/vendor/tag";
import { getTaxRates } from "@/lib/functions/vendor/tax";
import { getVendorTransactions } from "@/lib/functions/vendor/transactions";
import {
  booleanFilterTransform,
  createServerFetcher,
} from "@/lib/helper/create-server-fetcher";
import type { AttributeItem } from "@/types/attributes";
import type { BrandItem } from "@/types/brands";
import type { NormalizedCategory } from "@/types/category-types";
import type { CouponItem } from "@/types/coupons";
import type { VendorOrderResponse } from "@/types/orders";
import type { ProductItem } from "@/types/products";
import type { TagItem } from "@/types/tags";
import type { TaxRateItem } from "@/types/taxes";
import type { VendorTransactionResponse } from "@/types/transaction";

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

export function createVendorTaxRatesFetcher(
  shopId: string,
): (
  params: DataTableFetchParams,
) => Promise<DataTableFetchResult<TaxRateItem>> {
  return createServerFetcher<TaxRateItem, any>({
    fetchFn: async (query) => {
      const response = await getTaxRates({ data: { ...query, shopId } });
      return { data: response.data ?? [], total: response.total ?? 0 };
    },
    sortFieldMap: {
      name: "name",
      rate: "rate",
      priority: "priority",
      createdAt: "createdAt",
    },
    filterFieldMap: { isActive: "isActive", country: "country" },
    defaultQuery: { sortBy: "priority", sortDirection: "asc" },
    transformFilters: booleanFilterTransform,
  });
}

// ============================================================================
// Coupons Fetcher
// ============================================================================

export function createVendorCouponsFetcher(
  shopId: string,
): (params: DataTableFetchParams) => Promise<DataTableFetchResult<CouponItem>> {
  return createServerFetcher<CouponItem, any>({
    fetchFn: async (query) => {
      const response = await getCoupons({ data: { ...query, shopId } });
      return { data: response.data ?? [], total: response.total ?? 0 };
    },
    sortFieldMap: {
      code: "code",
      discountAmount: "discountAmount",
      usageCount: "usageCount",
      activeFrom: "activeFrom",
      activeTo: "activeTo",
      createdAt: "createdAt",
    },
    filterFieldMap: {
      isActive: "isActive",
      type: "type",
      status: "status",
      applicableTo: "applicableTo",
    },
    defaultQuery: { sortBy: "createdAt", sortDirection: "desc" },
    transformFilters: booleanFilterTransform,
  });
}

// ============================================================================
// Products Fetcher
// ============================================================================

export function createVendorProductsFetcher(
  shopId: string,
): (
  params: DataTableFetchParams,
) => Promise<DataTableFetchResult<ProductItem>> {
  return createServerFetcher<ProductItem, any>({
    fetchFn: async (query) => {
      const response = await getProducts({ data: { ...query, shopId } });
      return { data: response.data ?? [], total: response.total ?? 0 };
    },
    sortFieldMap: {
      name: "name",
      sellingPrice: "sellingPrice",
      stock: "stock",
      createdAt: "createdAt",
    },
    filterFieldMap: {
      isActive: "isActive",
      status: "status",
      categoryId: "categoryId",
      brandId: "brandId",
    },
    defaultQuery: { sortBy: "createdAt", sortDirection: "desc" },
    transformFilters: booleanFilterTransform,
  });
}

// ============================================================================
// Transactions Fetcher
// ============================================================================

export function createVendorTransactionsFetcher(
  shopSlug: string,
): (
  params: DataTableFetchParams,
) => Promise<DataTableFetchResult<VendorTransactionResponse>> {
  return createServerFetcher<VendorTransactionResponse, any>({
    fetchFn: async (query) => {
      const response = await getVendorTransactions({
        data: { ...query, shopSlug },
      });
      return {
        data: response.transactions ?? [],
        total: response.total ?? 0,
      };
    },
    sortFieldMap: {
      createdAt: "createdAt",
      totalAmount: "totalAmount",
    },
    filterFieldMap: { status: "status" },
    defaultQuery: { sortBy: "createdAt", sortDirection: "desc" },
  });
}

// ============================================================================
// Orders Fetcher
// ============================================================================

export function createVendorOrdersFetcher(
  shopSlug: string,
): (
  params: DataTableFetchParams,
) => Promise<DataTableFetchResult<VendorOrderResponse>> {
  return createServerFetcher<VendorOrderResponse, any>({
    fetchFn: async (query) => {
      const response = await getVendorOrders({
        data: { ...query, shopSlug },
      });
      return {
        data: (response.orders ?? []) as unknown as VendorOrderResponse[],
        total: response.total ?? 0,
      };
    },
    sortFieldMap: {
      createdAt: "createdAt",
      orderNumber: "orderNumber",
    },
    filterFieldMap: { status: "status" },
    defaultQuery: { sortBy: "createdAt", sortDirection: "desc" },
  });
}
