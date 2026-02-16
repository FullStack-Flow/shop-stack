/**
 * Product Types
 *
 * Type definitions for products in the marketplace.
 */

import type { SQL } from "drizzle-orm";
import type { ProductImage } from "@/lib/db/schema/products-schema";
import type { PaginatedResponse } from "./api-response";

// ============================================================================
// Enums
// ============================================================================

export type ProductStatus = "draft" | "active" | "archived";

export type ProductType = "simple" | "variable";

// ============================================================================
// Base Product Types
// ============================================================================

export interface ProductTagRelation {
  productId: string;
  tagId: string;
}

export interface ProductAttributeRelation {
  productId: string;
  attributeId: string;
  value?: string | null;
}

export interface VariationPrice {
  regularPrice?: number;
  sellingPrice?: number;
  image?: string;
}

// ============================================================================
// Product Item (Full Entity)
// ============================================================================

export interface ProductItem {
  id: string;
  shopId: string;
  name: string;
  slug: string;
  sku?: string | null;
  description?: string | null;
  shortDescription?: string | null;
  // Pricing
  sellingPrice: string;
  regularPrice?: string | null;
  costPrice?: string | null;
  // Inventory
  stock: number;
  lowStockThreshold: number;
  trackInventory: boolean;
  // Relations
  categoryId?: string | null;
  categoryName?: string | null;
  brandId?: string | null;
  brandName?: string | null;
  taxId?: string | null;
  taxName?: string | null;
  // Status & Type
  status: ProductStatus;
  productType: ProductType;
  // Flags
  isFeatured: boolean;
  isActive: boolean;
  // Ratings (denormalized for performance)
  averageRating: string;
  reviewCount: number;
  // SEO
  metaTitle?: string | null;
  metaDescription?: string | null;
  // Relations
  images: ProductImage[];
  thumbnailImage?: string | null;
  galleryImages?: string[];
  tagIds: string[];
  tagNames: string[];
  attributeIds: string[];
  attributeNames: string[];
  shippingMethodIds: string[];
  shippingMethodNames: string[];
  // Maps attribute ID to selected value IDs: { [attributeId]: [valueId1, valueId2] }
  attributeValues: Record<string, string[]>;
  /** Maps valueId → valueName for UI display */
  attributeValueNames: Record<string, string>;
  // Maps attribute value ID to custom pricing/image: { [valueId]: { regularPrice?, sellingPrice?, image? } }
  variationPrices: Record<
    string,
    { regularPrice?: string; sellingPrice?: string; image?: string }
  >;
  // Timestamps
  createdAt: string;
  updatedAt: string;
}

export interface NormalizedProduct extends ProductItem {
  shopName?: string | null;
  shopSlug?: string | null;
  vendorId?: string | null;
  vendorName?: string | null;
}

// ============================================================================
// Form Values
// ============================================================================
export type SelectedAttributeValues = Record<string, string[]>;

export type VariationPrices = Record<
  string,
  { regularPrice?: string; sellingPrice?: string; image?: string }
>;

export interface ProductFormValues {
  name: string;
  slug?: string;
  sku?: string;
  shortDescription?: string;
  regularPrice?: string;
  sellingPrice: string;
  costPrice?: string;
  stock: number;
  lowStockThreshold: number;
  trackInventory: boolean;
  description?: string;
  productType: "simple" | "variable";
  status: "draft" | "active" | "archived";
  categoryId?: string;
  brandId?: string;
  tagIds: string[];
  attributeIds: string[];
  shippingMethodIds: string[];
  attributeValues: SelectedAttributeValues;
  variationPrices: VariationPrices;
  taxId?: string;
  // Flags
  isFeatured: boolean;
  isActive: boolean;
  // SEO
  metaTitle?: string;
  metaDescription?: string;
  // Image fields
  thumbnailImage?: string | null;
  galleryImages: string[];
}

// ============================================================================
// Permissions
// ============================================================================

export interface ProductPermissions {
  canDelete: boolean;
  canEdit: boolean;
  canView: boolean;
  canCreate: boolean;
}

// ============================================================================
// Filters & Query Options
// ============================================================================
export interface ProductFilters {
  isActive?: boolean;
  status?: ProductStatus;
  productType?: ProductType;
  categoryId?: string;
  brandId?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  isFeatured?: boolean;
  search?: string;
}

export interface ProductQueryOptions {
  baseConditions?: SQL[];
  search?: string;
  status?: "draft" | "active" | "archived";
  productType?: "simple" | "variable";
  categoryId?: string;
  brandId?: string;
  tagId?: string;
  attributeId?: string;
  isFeatured?: boolean;
  isActive?: boolean;
  inStock?: boolean;
  lowStock?: boolean;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  limit?: number;
  offset?: number;
  sortBy?:
    | "name"
    | "sellingPrice"
    | "stock"
    | "createdAt"
    | "averageRating"
    | "reviewCount"
    | "updatedAt";
  sortDirection?: "asc" | "desc";
  includeShopInfo?: boolean;
  includeVendorInfo?: boolean;
  excludeCostPrice?: boolean;
}

// ============================================================================
// Query Types
// ============================================================================

export interface ListProductsQuery {
  shopId: string;
  limit?: number;
  offset?: number;
  search?: string;
  isActive?: boolean;
  status?: ProductStatus;
  productType?: ProductType;
  categoryId?: string;
  brandId?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  isFeatured?: boolean;
  sortBy?:
    | "name"
    | "sellingPrice"
    | "stock"
    | "createdAt"
    | "averageRating"
    | "reviewCount";
  sortDirection?: "asc" | "desc";
}

// ============================================================================
// Response Types
// ============================================================================

export type ProductListResponse = PaginatedResponse<ProductItem>;

export interface BatchedProductRelations {
  imagesMap: Map<string, ProductImage[]>;
  tagsMap: Map<string, { tagId: string; tagName: string }[]>;
  attributesMap: Map<
    string,
    { attributeId: string; attributeName: string; value: string | null }[]
  >;
  /** Maps valueId → { name, value } for displaying human-readable attribute values */
  attributeValuesMap: Map<string, { name: string; value: string }>;
  categoriesMap: Map<string, string>;
  brandsMap: Map<string, string>;
  taxRatesMap: Map<string, string>;
  shopsMap: Map<string, { id: string; name: string; slug: string }>;
  vendorsMap: Map<string, { id: string; businessName: string | null }>;
  shippingMethodsMap: Map<
    string,
    { shippingMethodId: string; shippingMethodName: string }[]
  >;
}

export interface ListProductsResponse {
  data: ProductItem[];
  total: number;
  limit: number;
  offset: number;
}

export interface CreateProductResponse {
  success: boolean;
  product: ProductItem;
  message?: string;
}

export interface UpdateProductResponse {
  success: boolean;
  product: ProductItem;
  message?: string;
}

export interface DeleteProductResponse {
  success: boolean;
  message: string;
}

// ============================================================================
// Mutation State
// ============================================================================

export interface ProductMutationState {
  creatingId: string | null;
  deletingId: string | null;
  updatingId: string | null;
  isCreating: boolean;
  isAnyMutating: boolean;
}

// ============================================================================
// Legacy Product Type (for backward compatibility)
// ============================================================================

export interface Product {
  id: string;
  name: string;
  sku: string;
  shop: string;
  price: string;
  stock: number;
  status: "active" | "out_of_stock";
  image: string;
  productType: string;
  category?: string;
  brand?: string;
  tags?: string[];
}

export type SortOption =
  | "relevance"
  | "price-asc"
  | "price-desc"
  | "newest"
  | "rating"
  | "best-selling";
