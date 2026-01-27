/**
 * Shared Tag Query Validators
 *
 * Composable Zod schemas for tag queries.
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

export const tagSortByEnum = zod.enum([
  "name",
  "createdAt",
  "sortOrder",
  "productCount",
]);

// ============================================================================
// Entity-Specific Filter Fields
// ============================================================================

export const tagFilterFields = {
  ...isActiveField,
};

// ============================================================================
// Sort Fields
// ============================================================================

const sortFields = {
  sortBy: tagSortByEnum.optional().default("sortOrder"),
  sortDirection: sortDirectionEnum.optional().default("asc"),
};

// ============================================================================
// Get by ID/Slug Schemas (using factory functions)
// ============================================================================

export const getTagByIdSchema = createGetByIdSchema("Tag");

export const getTagBySlugSchema = createGetBySlugSchema("Tag");

// ============================================================================
// Composed Query Schemas
// ============================================================================

/**
 * Store Front Query Schema
 * - Public access (no auth)
 * - Only active tags
 */
export const storeTagsQuerySchema = zod.object({
  ...paginationFields,
  limit: paginationFields.limit.default(STORE_DEFAULT_LIMIT),
  ...sortFields,
  ...searchFields,
  ...shopSlugFields,
  ...optionalShopIdField,
  ...storeIsActiveField,
});

/**
 * Admin Query Schema
 * - Admin auth required
 * - Full filter access
 * - Can see all tags across all shops
 */
export const adminTagsQuerySchema = zod.object({
  ...paginationFields,
  limit: paginationFields.limit.default(ADMIN_DEFAULT_LIMIT),
  ...sortFields,
  ...searchFields,
  ...tagFilterFields,
  ...optionalShopIdField,
  ...optionalVendorIdField,
});

/**
 * Vendor Query Schema
 * - Vendor auth required
 * - Shop ID is required (scoped to their shop)
 */
export const vendorTagsQuerySchema = zod.object({
  ...shopScopeFields,
  ...paginationFields,
  limit: paginationFields.limit.default(VENDOR_DEFAULT_LIMIT),
  ...sortFields,
  ...searchFields,
  ...tagFilterFields,
});

// ============================================================================
// Action Schemas (using factory functions)
// ============================================================================

export const toggleTagActiveSchema = createToggleActiveSchema("Tag");

export const deleteTagSchema = createDeleteSchema("Tag");

/**
 * Schema for creating a new tag (Vendor)
 */
export const createTagSchema = zod.object({
  shopId: zod.string().min(1, "Shop ID is required"),
  name: zod
    .string()
    .min(2, "Tag name must be at least 2 characters")
    .max(100, "Tag name must be at most 100 characters"),
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
    .optional()
    .nullable(),
  sortOrder: zod.coerce.number().min(0).optional().default(0),
  isActive: zod.boolean().optional().default(true),
});

/**
 * Schema for updating an existing tag (Vendor)
 */
export const updateTagSchema = zod.object({
  id: zod.string().min(1, "Tag ID is required"),
  shopId: zod.string().min(1, "Shop ID is required"),
  name: zod
    .string()
    .min(2, "Tag name must be at least 2 characters")
    .max(100, "Tag name must be at most 100 characters")
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
  description: zod
    .string()
    .max(500, "Description must be at most 500 characters")
    .optional()
    .nullable(),
  sortOrder: zod.coerce.number().min(0).optional(),
  isActive: zod.boolean().optional(),
});

// ============================================================================
// Type Exports
// ============================================================================

export type TagSortBy = zod.infer<typeof tagSortByEnum>;
export type CreateTagInput = zod.infer<typeof createTagSchema>;
export type UpdateTagInput = zod.infer<typeof updateTagSchema>;

export type StoreTagsQuery = zod.infer<typeof storeTagsQuerySchema>;
export type AdminTagsQuery = zod.infer<typeof adminTagsQuerySchema>;
export type VendorTagsQuery = zod.infer<typeof vendorTagsQuerySchema>;
