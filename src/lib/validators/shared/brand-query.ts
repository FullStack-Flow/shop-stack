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
// Type Exports
// ============================================================================

export type BrandSortBy = zod.infer<typeof brandSortByEnum>;

export type StoreBrandsQuery = zod.infer<typeof storeBrandsQuerySchema>;
export type AdminBrandsQuery = zod.infer<typeof adminBrandsQuerySchema>;
export type VendorBrandsQuery = zod.infer<typeof vendorBrandsQuerySchema>;
