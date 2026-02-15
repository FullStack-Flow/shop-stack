import type {
  DataTableFetchParams,
  DataTableFetchResult,
} from "@/components/base/data-table/types";
import { getAdminAttributes } from "@/lib/functions/admin/attribute";
import { getAdminBrands } from "@/lib/functions/admin/brand";
import { getAdminCategories } from "@/lib/functions/admin/category";
import { getAdminCoupons } from "@/lib/functions/admin/coupon";
import { getAdminOrders } from "@/lib/functions/admin/order";
import { getAdminProducts } from "@/lib/functions/admin/product";
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

export const ADMIN_STATUS_OPTIONS = [
  { label: "Active", value: "true" },
  { label: "Inactive", value: "false" },
];

export function createAdminCategoriesFetcher(): (
  params: DataTableFetchParams,
) => Promise<DataTableFetchResult<NormalizedCategory>> {
  return createServerFetcher<NormalizedCategory, any>({
    fetchFn: async (query) => {
      const response = await getAdminCategories({ data: query });
      return { data: response.data ?? [], total: response.total ?? 0 };
    },
    sortFieldMap: { name: "name", createdAt: "createdAt" },
    filterFieldMap: { isActive: "isActive", featured: "featured" },
    defaultQuery: { sortBy: "sortOrder", sortDirection: "asc" },
    transformFilters: booleanFilterTransform,
  });
}

export function createAdminBrandsFetcher(): (
  params: DataTableFetchParams,
) => Promise<DataTableFetchResult<BrandItem>> {
  return createServerFetcher<BrandItem, any>({
    fetchFn: async (query) => {
      const response = await getAdminBrands({ data: query });
      return { data: response.data ?? [], total: response.total ?? 0 };
    },
    sortFieldMap: { name: "name", createdAt: "createdAt" },
    filterFieldMap: { isActive: "isActive" },
    defaultQuery: { sortBy: "sortOrder", sortDirection: "asc" },
    transformFilters: booleanFilterTransform,
  });
}

export function createAdminAttributesFetcher(): (
  params: DataTableFetchParams,
) => Promise<DataTableFetchResult<AttributeItem>> {
  return createServerFetcher<AttributeItem, any>({
    fetchFn: async (query) => {
      const response = await getAdminAttributes({ data: query });
      return { data: response.data ?? [], total: response.total ?? 0 };
    },
    sortFieldMap: { name: "name", createdAt: "createdAt" },
    filterFieldMap: { isActive: "isActive", type: "type" },
    defaultQuery: { sortBy: "sortOrder", sortDirection: "asc" },
    transformFilters: booleanFilterTransform,
  });
}

export function createAdminCouponsFetcher(): (
  params: DataTableFetchParams,
) => Promise<DataTableFetchResult<CouponItem>> {
  return createServerFetcher<CouponItem, any>({
    fetchFn: async (query) => {
      const response = await getAdminCoupons({ data: query });
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

export function createAdminOrdersFetcher(): (
  params: DataTableFetchParams,
) => Promise<DataTableFetchResult<VendorOrderResponse>> {
  return createServerFetcher<VendorOrderResponse, any>({
    fetchFn: async (query) => {
      const response = await getAdminOrders({ data: query });
      return {
        data: (response.orders ?? []) as unknown as VendorOrderResponse[],
        total: response.total ?? 0,
      };
    },
    sortFieldMap: {
      createdAt: "createdAt",
      orderNumber: "orderNumber",
      totalAmount: "totalAmount",
    },
    filterFieldMap: { status: "status", paymentStatus: "paymentStatus" },
    defaultQuery: { sortBy: "createdAt", sortDirection: "desc" },
  });
}

export function createAdminProductsFetcher(): (
  params: DataTableFetchParams,
) => Promise<DataTableFetchResult<ProductItem>> {
  return createServerFetcher<ProductItem, any>({
    fetchFn: async (query) => {
      const response = await getAdminProducts({ data: query });
      return { data: response.data ?? [], total: response.total ?? 0 };
    },
    sortFieldMap: {
      name: "name",
      sellingPrice: "sellingPrice",
      stock: "stock",
      createdAt: "createdAt",
      averageRating: "averageRating",
      reviewCount: "reviewCount",
    },
    filterFieldMap: {
      isActive: "isActive",
      status: "status",
      productType: "productType",
      categoryId: "categoryId",
      brandId: "brandId",
      isFeatured: "isFeatured",
      inStock: "inStock",
    },
    defaultQuery: { sortBy: "createdAt", sortDirection: "desc" },
    transformFilters: booleanFilterTransform,
  });
}
