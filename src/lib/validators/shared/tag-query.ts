/**
 * Shared Tag Query Validators
 *
 * Composable z schemas for tag queries.
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

export const tagSortByEnum = z.enum([
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
export const storeTagsQuerySchema = z.object({
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
export const adminTagsQuerySchema = z.object({
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
export const vendorTagsQuerySchema = z.object({
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
export const createTagSchema = z.object({
  shopId: z.string().min(1, "Shop ID is required"),
  name: z
    .string()
    .min(2, "Tag name must be at least 2 characters")
    .max(100, "Tag name must be at most 100 characters"),
  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters")
    .max(100, "Slug must be at most 100 characters")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must be lowercase with hyphens only",
    )
    .optional(),
  description: z
    .string()
    .max(500, "Description must be at most 500 characters")
    .optional()
    .nullable(),
  sortOrder: z.coerce.number().min(0).optional().default(0),
  isActive: z.boolean().optional().default(true),
});

/**
 * Schema for updating an existing tag (Vendor)
 */
export const updateTagSchema = z.object({
  id: z.string().min(1, "Tag ID is required"),
  shopId: z.string().min(1, "Shop ID is required"),
  name: z
    .string()
    .min(2, "Tag name must be at least 2 characters")
    .max(100, "Tag name must be at most 100 characters")
    .optional(),
  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters")
    .max(100, "Slug must be at most 100 characters")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must be lowercase with hyphens only",
    )
    .optional(),
  description: z
    .string()
    .max(500, "Description must be at most 500 characters")
    .optional()
    .nullable(),
  sortOrder: z.coerce.number().min(0).optional(),
  isActive: z.boolean().optional(),
});

// ============================================================================
// Type Exports
// ============================================================================

export type TagSortBy = z.infer<typeof tagSortByEnum>;
export type CreateTagInput = z.infer<typeof createTagSchema>;
export type UpdateTagInput = z.infer<typeof updateTagSchema>;

export type StoreTagsQuery = z.infer<typeof storeTagsQuerySchema>;
export type AdminTagsQuery = z.infer<typeof adminTagsQuerySchema>;
export type VendorTagsQuery = z.infer<typeof vendorTagsQuerySchema>;
