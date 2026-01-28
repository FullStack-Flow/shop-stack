/**
 * Shared Product Query Validators
 *
 * Composable z schemas for product queries.
 * Uses base-query for common schemas to ensure DRY compliance.
 */

import { z } from "zod";
import {
  ADMIN_DEFAULT_LIMIT,
  createDeleteSchema,
  createGetByIdSchema,
  createGetBySlugSchema,
  createToggleActiveSchema,
  isActiveField,
  optionalShopIdField,
  optionalVendorIdField,
  paginationFields,
  STORE_DEFAULT_LIMIT,
  searchFields,
  shopScopeFields,
  shopSlugFields,
  sortDirectionEnum,
  storeIsActiveField,
  VENDOR_DEFAULT_LIMIT,
} from "./base-query";

// Re-export common types
export type { SortDirection } from "./base-query";

// ============================================================================
// Entity-Specific Enums
// ============================================================================

export const productStatusEnum = z.enum(["draft", "active", "archived"]);

export const productTypeEnum = z.enum(["simple", "variable"]);

export const productSortByEnum = z.enum([
  "name",
  "sellingPrice",
  "stock",
  "createdAt",
  "averageRating",
  "reviewCount",
]);

// ============================================================================
// Entity-Specific Filter Fields
// ============================================================================

export const productFilterFields = {
  ...isActiveField,
  status: productStatusEnum.optional(),
  productType: productTypeEnum.optional(),
  categoryId: z.string().optional(),
  brandId: z.string().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  inStock: z.coerce.boolean().optional(),
  isFeatured: z.coerce.boolean().optional(),
};

/**
 * Common filter fields - used across all contexts
 */
export const productBaseFilterFields = {
  categoryId: z.string().optional(),
  brandId: z.string().optional(),
  tagId: z.string().optional(),
  productType: productTypeEnum.optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
};

/**
 * Stock filter fields
 */
export const stockFilterFields = {
  inStock: z.coerce.boolean().optional(),
  lowStock: z.coerce.boolean().optional(),
};

/**
 * Status filter fields
 */
export const statusFilterFields = {
  status: productStatusEnum.optional(),
  isFeatured: z.coerce.boolean().optional(),
  isActive: z.coerce.boolean().optional(),
};

/**
 * Attribute filter field
 */
export const attributeFilterFields = {
  attributeId: z.string().optional(),
};

// ============================================================================
// Sort Fields
// ============================================================================

const sortFields = {
  sortBy: productSortByEnum.optional().default("createdAt"),
  sortDirection: sortDirectionEnum.optional().default("desc"),
};

// ============================================================================
// Get by ID/Slug Schemas (using factory functions)
// ============================================================================

export const getProductByIdSchema = createGetByIdSchema("Product");

export const getProductBySlugSchema = createGetBySlugSchema("Product");

// ============================================================================
// Composed Query Schemas
// ============================================================================

/**
 * Store Front Query Schema
 * - Public access (no auth)
 * - Limited filters (customer-facing only)
 * - Only active products
 */
export const storeProductsQuerySchema = z.object({
  ...paginationFields,
  limit: paginationFields.limit.default(STORE_DEFAULT_LIMIT),
  ...sortFields,
  ...searchFields,
  ...productFilterFields,
  ...storeIsActiveField,
  ...shopSlugFields,
  ...optionalShopIdField,
});

/**
 * Admin Query Schema
 * - Admin auth required
 * - Full filter access
 * - Can see all products across all shops
 */
export const adminProductsQuerySchema = z.object({
  ...paginationFields,
  limit: paginationFields.limit.default(ADMIN_DEFAULT_LIMIT),
  ...sortFields,
  ...searchFields,
  ...productFilterFields,
  ...optionalShopIdField,
  ...optionalVendorIdField,
});

/**
 * Vendor Query Schema
 * - Vendor auth required
 * - Shop ID is required (scoped to their shop)
 */
export const vendorProductsQuerySchema = z.object({
  ...shopScopeFields,
  ...paginationFields,
  limit: paginationFields.limit.default(VENDOR_DEFAULT_LIMIT),
  ...sortFields,
  ...searchFields,
  ...productBaseFilterFields,
  ...stockFilterFields,
  ...statusFilterFields,
  ...attributeFilterFields,
});

// ============================================================================
// Action Schemas (using factory functions)
// ============================================================================

export const toggleProductActiveSchema = createToggleActiveSchema("Product");

export const deleteProductSchema = createDeleteSchema("Product");

// ============================================================================
// Entity Schemas
// ============================================================================

/**
 * Product Image Schema (for API responses - full schema)
 */
export const productImageSchema = z.object({
  id: z.string(),
  productId: z.string(),
  url: z.string(),
  alt: z.string().optional().nullable(),
  sortOrder: z.number().default(0),
  isPrimary: z.boolean().default(false),
  createdAt: z.string(),
});

/**
 * Product Image Input Schema (for create/update operations)
 * - id is optional since it's generated server-side
 * - productId is optional since it's assigned server-side
 * - createdAt is optional since it's set server-side
 */
export const productImageInputSchema = z.object({
  id: z.string().optional(),
  productId: z.string().optional(),
  url: z.string(),
  alt: z.string().optional().nullable(),
  sortOrder: z.number().default(0),
  isPrimary: z.boolean().default(false),
  createdAt: z.string().optional(),
});

/**
 * Product Tag Relation Schema
 */
export const productTagRelationSchema = z.object({
  productId: z.string(),
  tagId: z.string(),
});

/**
 * Product Attribute Relation Schema
 */
export const productAttributeRelationSchema = z.object({
  productId: z.string(),
  attributeId: z.string(),
  value: z.string().optional().nullable(),
});

/**
 * Variation Price Schema
 * { [valueId]: { regularPrice?, sellingPrice?, image? } }
 */
export const variationPriceSchema = z.object({
  regularPrice: z.number().optional(),
  sellingPrice: z.number().optional(),
  image: z.string().optional(),
});

/**
 * Full Product Entity Schema (Response)
 */
export const productSchema = z.object({
  id: z.string(),
  shopId: z.string(),
  name: z.string(),
  slug: z.string(),
  sku: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  shortDescription: z.string().optional().nullable(),

  // Pricing
  sellingPrice: z.string(),
  regularPrice: z.string().optional().nullable(),
  costPrice: z.string().optional().nullable(),

  // Inventory
  stock: z.number().default(0),
  lowStockThreshold: z.number().default(5),
  trackInventory: z.boolean().default(true),

  // Relations
  categoryId: z.string().optional().nullable(),
  brandId: z.string().optional().nullable(),
  taxId: z.string().optional().nullable(),

  // Status & Type
  status: productStatusEnum.default("draft"),
  productType: productTypeEnum.default("simple"),

  // Flags
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),

  // SEO
  metaTitle: z.string().optional().nullable(),
  metaDescription: z.string().optional().nullable(),

  // Variation Pricing
  variationPrices: z
    .record(z.string(), variationPriceSchema)
    .optional()
    .nullable(),

  // Denormalized rating data
  averageRating: z.string().default("0"),
  reviewCount: z.number().default(0),

  // Timestamps
  createdAt: z.string(),
  updatedAt: z.string(),
});

// ============================================================================
// Product Entity Field Groups (DRY - Reusable across Create/Update)
// ============================================================================

/**
 * Required product identification fields (for create)
 */
const productRequiredIdFields = {
  shopId: z.string().min(1, "Shop ID is required"),
};

/**
 * Optional product identification fields (for update)
 */
const productOptionalIdFields = {
  id: z.string().min(1, "Product ID is required"),
  shopId: z.string().min(1, "Shop ID is required"),
};

/**
 * Product name field with validation
 */
const productNameField = z
  .string()
  .min(2, "Product name must be at least 2 characters")
  .max(200, "Product name must be at most 200 characters");

/**
 * Product slug field with validation
 */
const productSlugField = z
  .string()
  .min(2, "Slug must be at least 2 characters")
  .max(200, "Slug must be at most 200 characters")
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Slug must be lowercase with hyphens only",
  );

/**
 * Product SKU field
 */
const productSkuField = z.string().max(100);

/**
 * Product description fields
 */
const productDescriptionFields = {
  description: z.string(),
  shortDescription: z.string().max(500),
};

/**
 * Product pricing fields (for create - required sellingPrice)
 */
const productPricingFieldsCreate = {
  sellingPrice: z.string().min(1, "Selling price is required"),
  regularPrice: z.string().optional(),
  costPrice: z.string().optional(),
};

/**
 * Product pricing fields (for update - all optional)
 */
const productPricingFieldsUpdate = {
  sellingPrice: z.string().optional(),
  regularPrice: z.string().optional().nullable(),
  costPrice: z.string().optional().nullable(),
};

/**
 * Product inventory fields (for create - with defaults)
 */
const productInventoryFieldsCreate = {
  stock: z.coerce.number().min(0).optional().default(0),
  lowStockThreshold: z.coerce.number().min(0).optional().default(5),
  trackInventory: z.boolean().optional().default(true),
};

/**
 * Product inventory fields (for update - no defaults)
 */
const productInventoryFieldsUpdate = {
  stock: z.coerce.number().min(0).optional(),
  lowStockThreshold: z.coerce.number().min(0).optional(),
  trackInventory: z.boolean().optional(),
};

/**
 * Product relation fields (for create - optional)
 */
const productRelationFieldsCreate = {
  categoryId: z.string().optional(),
  brandId: z.string().optional(),
  taxId: z.string().optional(),
};

/**
 * Product relation fields (for update - optional nullable)
 */
const productRelationFieldsUpdate = {
  categoryId: z.string().optional().nullable(),
  brandId: z.string().optional().nullable(),
  taxId: z.string().optional().nullable(),
};

/**
 * Product status and type fields (for create - with defaults)
 */
const productStatusFieldsCreate = {
  status: productStatusEnum.optional().default("draft"),
  productType: productTypeEnum.optional().default("simple"),
};

/**
 * Product status and type fields (for update - no defaults)
 */
const productStatusFieldsUpdate = {
  status: productStatusEnum.optional(),
  productType: productTypeEnum.optional(),
};

/**
 * Product flag fields (for create - with defaults)
 */
const productFlagFieldsCreate = {
  isFeatured: z.boolean().optional().default(false),
  isActive: z.boolean().optional().default(true),
};

/**
 * Product flag fields (for update - no defaults)
 */
const productFlagFieldsUpdate = {
  isFeatured: z.boolean().optional(),
  isActive: z.boolean().optional(),
};

/**
 * Product SEO fields (for create - optional)
 */
const productSeoFieldsCreate = {
  metaTitle: z.string().max(100).optional(),
  metaDescription: z.string().max(300).optional(),
};

/**
 * Product SEO fields (for update - optional nullable)
 */
const productSeoFieldsUpdate = {
  metaTitle: z.string().max(100).optional().nullable(),
  metaDescription: z.string().max(300).optional().nullable(),
};

/**
 * Variation price entry schema (reusable)
 */
const variationPriceEntrySchema = z.object({
  regularPrice: z.string().optional(),
  sellingPrice: z.string().optional(),
  image: z.string().optional(),
});

/**
 * Product relation arrays (for create - with defaults)
 * Uses productImageInputSchema since productId is assigned server-side
 */
const productRelationArraysCreate = {
  images: z.array(productImageInputSchema).optional().default([]),
  tagIds: z.array(z.string()).optional().default([]),
  attributeIds: z.array(z.string()).optional().default([]),
  attributeValues: z
    .record(z.string(), z.array(z.string()))
    .optional()
    .default({}),
  variationPrices: z
    .record(z.string(), variationPriceEntrySchema)
    .optional()
    .default({}),
};

/**
 * Product relation arrays (for update - no defaults)
 * Uses productImageInputSchema since productId is assigned server-side
 */
const productRelationArraysUpdate = {
  images: z.array(productImageInputSchema).optional(),
  tagIds: z.array(z.string()).optional(),
  attributeIds: z.array(z.string()).optional(),
  attributeValues: z.record(z.string(), z.array(z.string())).optional(),
  variationPrices: z.record(z.string(), variationPriceEntrySchema).optional(),
};

// ============================================================================
// Composed Product Schemas
// ============================================================================

/**
 * Schema for creating a new product (Vendor)
 */
export const createProductSchema = z.object({
  ...productRequiredIdFields,
  name: productNameField,
  slug: productSlugField.optional(),
  sku: productSkuField.optional(),
  description: z.string().optional(),
  shortDescription: z.string().max(500).optional(),
  ...productPricingFieldsCreate,
  ...productInventoryFieldsCreate,
  ...productRelationFieldsCreate,
  ...productStatusFieldsCreate,
  ...productFlagFieldsCreate,
  ...productSeoFieldsCreate,
  ...productRelationArraysCreate,
});

/**
 * Schema for product form values (UI-specific)
 */
export const productFormSchema = z.object({
  name: productNameField,
  slug: productSlugField.optional(),
  sku: productSkuField.optional(),
  description: z.string().optional(),
  shortDescription: z.string().max(500).optional(),
  ...productPricingFieldsCreate,
  ...productInventoryFieldsCreate,
  ...productRelationFieldsCreate,
  ...productStatusFieldsCreate,
  ...productFlagFieldsCreate,
  ...productSeoFieldsCreate,
  tagIds: z.array(z.string()).optional().default([]),
  attributeIds: z.array(z.string()).optional().default([]),
  attributeValues: z
    .record(z.string(), z.array(z.string()))
    .optional()
    .default({}),
  variationPrices: z
    .record(
      z.string(),
      z.object({
        regularPrice: z.string().optional(),
        sellingPrice: z.string().optional(),
        image: z.string().optional(),
      }),
    )
    .optional()
    .default({}),
  thumbnailImage: z.string().nullable().optional(),
  galleryImages: z.array(z.string()).optional().default([]),
});

/**
 * Schema for updating an existing product (Vendor)
 */
export const updateProductSchema = z.object({
  ...productOptionalIdFields,
  name: productNameField.optional(),
  slug: productSlugField.optional(),
  sku: productSkuField.optional().nullable(),
  description: productDescriptionFields.description.optional().nullable(),
  shortDescription: productDescriptionFields.shortDescription
    .optional()
    .nullable(),
  ...productPricingFieldsUpdate,
  ...productInventoryFieldsUpdate,
  ...productRelationFieldsUpdate,
  ...productStatusFieldsUpdate,
  ...productFlagFieldsUpdate,
  ...productSeoFieldsUpdate,
  ...productRelationArraysUpdate,
});

// ============================================================================
// Type Exports
// ============================================================================

export type ProductStatus = z.infer<typeof productStatusEnum>;
export type ProductType = z.infer<typeof productTypeEnum>;
export type ProductSortBy = z.infer<typeof productSortByEnum>;

export type Product = z.infer<typeof productSchema>;
export type ProductImage = z.infer<typeof productImageSchema>;
export type ProductTagRelation = z.infer<typeof productTagRelationSchema>;
export type ProductAttributeRelation = z.infer<
  typeof productAttributeRelationSchema
>;
export type VariationPrice = z.infer<typeof variationPriceSchema>;

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;

export type StoreProductsQuery = z.infer<typeof storeProductsQuerySchema>;
export type AdminProductsQuery = z.infer<typeof adminProductsQuerySchema>;
export type VendorProductsQuery = z.infer<typeof vendorProductsQuerySchema>;
