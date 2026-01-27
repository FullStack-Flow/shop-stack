/**
 * Shared Attribute Query Validators
 *
 * Composable Zod schemas for attribute queries.
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

export const attributeTypeEnum = zod.enum([
  "select",
  "color",
  "image",
  "label",
]);

export const attributeSortByEnum = zod.enum(["name", "createdAt", "sortOrder"]);

// ============================================================================
// Entity-Specific Filter Fields
// ============================================================================

export const attributeFilterFields = {
  type: attributeTypeEnum.optional(),
  ...isActiveField,
};

// ============================================================================
// Sort Fields
// ============================================================================

const sortFields = {
  sortBy: attributeSortByEnum.optional().default("sortOrder"),
  sortDirection: sortDirectionEnum.optional().default("asc"),
};

// ============================================================================
// Get by ID/Slug Schemas (using factory functions)
// ============================================================================

export const getAttributeByIdSchema = createGetByIdSchema("Attribute");

export const getAttributeBySlugSchema = createGetBySlugSchema("Attribute");

// ============================================================================
// Composed Query Schemas
// ============================================================================

/**
 * Store Front Query Schema
 * - Public access (no auth)
 * - Only active attributes
 */
export const storeAttributesQuerySchema = zod.object({
  ...paginationFields,
  limit: paginationFields.limit.default(STORE_DEFAULT_LIMIT),
  ...sortFields,
  ...searchFields,
  ...shopSlugFields,
  ...optionalShopIdField,
  type: attributeTypeEnum.optional(),
  ...storeIsActiveField,
});

/**
 * Admin Query Schema
 * - Admin auth required
 * - Full filter access
 * - Can see all attributes across all shops
 */
export const adminAttributesQuerySchema = zod.object({
  ...paginationFields,
  limit: paginationFields.limit.default(ADMIN_DEFAULT_LIMIT),
  ...sortFields,
  ...searchFields,
  ...attributeFilterFields,
  ...optionalShopIdField,
  ...optionalVendorIdField,
});

/**
 * Vendor Query Schema
 * - Vendor auth required
 * - Shop ID is required (scoped to their shop)
 */
export const vendorAttributesQuerySchema = zod.object({
  ...shopScopeFields,
  ...paginationFields,
  limit: paginationFields.limit.default(VENDOR_DEFAULT_LIMIT),
  ...sortFields,
  ...searchFields,
  ...attributeFilterFields,
});

// ============================================================================
// Action Schemas (using factory functions)
// ============================================================================

export const toggleAttributeActiveSchema =
  createToggleActiveSchema("Attribute");

export const deleteAttributeSchema = createDeleteSchema("Attribute");

export const attributeValueInputSchema = zod.object({
  name: zod.string().min(1, "Value name is required"),
  slug: zod.string().min(1, "Value slug is required"),
  value: zod.string(),
});

export const updateAdminAttributeSchema = zod.object({
  id: zod.string().min(1, "Attribute ID is required"),
  name: zod
    .string()
    .min(2, "Attribute name must be at least 2 characters")
    .max(100, "Attribute name must be at most 100 characters")
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
  type: attributeTypeEnum.optional(),
  values: zod.array(attributeValueInputSchema).optional(),
  sortOrder: zod.coerce.number().min(0).optional(),
  isActive: zod.boolean().optional(),
});

/**
 * Schema for creating a new attribute (Vendor)
 */
export const createAttributeSchema = zod.object({
  shopId: zod.string().min(1, "Shop ID is required"),
  name: zod
    .string()
    .min(2, "Attribute name must be at least 2 characters")
    .max(100, "Attribute name must be at most 100 characters"),
  slug: zod
    .string()
    .min(2, "Slug must be at least 2 characters")
    .max(100, "Slug must be at most 100 characters")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must be lowercase with hyphens only",
    )
    .optional(),
  type: attributeTypeEnum.default("select"),
  values: zod.array(attributeValueInputSchema).default([]),
  sortOrder: zod.coerce.number().min(0).optional().default(0),
  isActive: zod.boolean().optional().default(true),
});

/**
 * Schema for updating an existing attribute (Vendor)
 */
export const updateAttributeSchema = zod.object({
  id: zod.string().min(1, "Attribute ID is required"),
  shopId: zod.string().min(1, "Shop ID is required"),
  name: zod
    .string()
    .min(2, "Attribute name must be at least 2 characters")
    .max(100, "Attribute name must be at most 100 characters")
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
  type: attributeTypeEnum.optional(),
  values: zod.array(attributeValueInputSchema).optional(),
  sortOrder: zod.coerce.number().min(0).optional(),
  isActive: zod.boolean().optional(),
});

// ============================================================================
// Type Exports
// ============================================================================

export type AttributeType = zod.infer<typeof attributeTypeEnum>;
export type AttributeSortBy = zod.infer<typeof attributeSortByEnum>;

export type StoreAttributesQuery = zod.infer<typeof storeAttributesQuerySchema>;
export type AdminAttributesQuery = zod.infer<typeof adminAttributesQuerySchema>;
export type VendorAttributesQuery = zod.infer<
  typeof vendorAttributesQuerySchema
>;
