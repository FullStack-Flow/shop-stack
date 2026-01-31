/**
 * Shared Brand Query Validators
 *
 * Composable Zod schemas for brand queries.
 * Uses base-query for common schemas to ensure DRY compliance.
 */

import { z as zod } from "zod";
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

export const brandSortByEnum = zod.enum([
  "name",
  "createdAt",
  "sortOrder",
  "productCount",
]);

// ============================================================================
// Entity-Specific Filter Fields
// ============================================================================

export const brandFilterFields = {
  ...isActiveField,
};

// ============================================================================
// Sort Fields
// ============================================================================

const sortFields = {
  sortBy: brandSortByEnum.optional().default("sortOrder"),
  sortDirection: sortDirectionEnum.optional().default("asc"),
};

// ============================================================================
// Get by ID/Slug Schemas (using factory functions)
// ============================================================================

export const getBrandByIdSchema = createGetByIdSchema("Brand");

export const getBrandBySlugSchema = createGetBySlugSchema("Brand");

// ============================================================================
// Composed Query Schemas
// ============================================================================

/**
 * Store Front Query Schema
 * - Public access (no auth)
 * - Limited filters (customer-facing only)
 * - Only active brands
 */
export const storeBrandsQuerySchema = zod.object({
  ...paginationFields,
  limit: paginationFields.limit.default(STORE_DEFAULT_LIMIT),
  ...sortFields,
  ...searchFields,
  ...brandFilterFields,
  ...storeIsActiveField,
  ...shopSlugFields,
  ...optionalShopIdField,
});

/**
 * Admin Query Schema
 * - Admin auth required
 * - Full filter access
 * - Can see all brands across all shops
 */
export const adminBrandsQuerySchema = zod.object({
  ...paginationFields,
  limit: paginationFields.limit.default(ADMIN_DEFAULT_LIMIT),
  ...sortFields,
  ...searchFields,
  ...brandFilterFields,
  ...optionalShopIdField,
  ...optionalVendorIdField,
});

/**
 * Vendor Query Schema
 * - Vendor auth required
 * - Shop ID is required (scoped to their shop)
 */
export const vendorBrandsQuerySchema = zod.object({
  ...shopScopeFields,
  ...paginationFields,
  limit: paginationFields.limit.default(VENDOR_DEFAULT_LIMIT),
  ...sortFields,
  ...searchFields,
  ...brandFilterFields,
});

// ============================================================================
// Action Schemas (using factory functions)
// ============================================================================

export const toggleBrandActiveSchema = createToggleActiveSchema("Brand");

export const deleteBrandSchema = createDeleteSchema("Brand");

// ============================================================================
// Entity Schemas
// ============================================================================

/**
 * Full Brand Entity Schema (Response)
 */
export const brandSchema = zod.object({
  id: zod.string(),
  shopId: zod.string(),
  name: zod.string(),
  slug: zod.string(),
  description: zod.string().optional().nullable(),
  logo: zod.string().optional().nullable(),
  website: zod.string().optional().nullable(),
  sortOrder: zod.number().default(0),
  isActive: zod.boolean().default(true),
  productCount: zod.number().default(0),
  createdAt: zod.string(),
  updatedAt: zod.string(),
});

/**
 * Schema for creating a new brand
 */
export const createBrandSchema = zod.object({
  shopId: zod.string().min(1, "Shop ID is required"),
  name: zod
    .string()
    .min(2, "Brand name must be at least 2 characters")
    .max(100, "Brand name must be at most 100 characters"),
  slug: zod
    .string()
    .min(2, "Slug must be at least 2 characters")
    .max(100, "Slug must be at most 100 characters")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must be lowercase with hyphens only",
    )
    .optional(),
  description: zod
    .string()
    .max(500, "Description must be at most 500 characters")
    .optional(),
  logo: zod.string().optional(),
  website: zod.string().optional(),
  sortOrder: zod.coerce.number().min(0).optional().default(0),
  isActive: zod.boolean().optional().default(true),
});

/**
 * Schema for updating an existing brand
 */
export const updateBrandSchema = zod.object({
  id: zod.string().min(1, "Brand ID is required"),
  shopId: zod.string().min(1, "Shop ID is required"),
  name: zod
    .string()
    .min(2, "Brand name must be at least 2 characters")
    .max(100, "Brand name must be at most 100 characters")
    .optional(),
  slug: zod
    .string()
    .min(2, "Slug must be at least 2 characters")
    .max(100, "Slug must be at most 100 characters")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must be lowercase with hyphens only",
    )
    .optional(),
  description: zod.string().max(500).optional().nullable(),
  logo: zod.string().optional().nullable(),
  website: zod.string().optional().nullable(),
  sortOrder: zod.coerce.number().min(0).optional(),
  isActive: zod.boolean().optional(),
});

// ============================================================================
// Type Exports
// ============================================================================

export type BrandSortBy = zod.infer<typeof brandSortByEnum>;
export type Brand = zod.infer<typeof brandSchema>;
export type CreateBrandInput = zod.infer<typeof createBrandSchema>;
export type UpdateBrandInput = zod.infer<typeof updateBrandSchema>;

export type StoreBrandsQuery = zod.infer<typeof storeBrandsQuerySchema>;
export type AdminBrandsQuery = zod.infer<typeof adminBrandsQuerySchema>;
export type VendorBrandsQuery = zod.infer<typeof vendorBrandsQuerySchema>;
