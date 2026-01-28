/**
 * Shared Attribute Query Validators
 *
 * Composable z schemas for attribute queries.
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

export const attributeTypeEnum = z.enum(["select", "color", "image", "label"]);

export const attributeSortByEnum = z.enum(["name", "createdAt", "sortOrder"]);

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
export const storeAttributesQuerySchema = z.object({
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
export const adminAttributesQuerySchema = z.object({
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
export const vendorAttributesQuerySchema = z.object({
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

export const attributeValueInputSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Value name is required"),
  slug: z.string().min(1, "Value slug is required"),
  value: z.string(),
});

export const updateAdminAttributeSchema = z.object({
  id: z.string().min(1, "Attribute ID is required"),
  name: z
    .string()
    .min(2, "Attribute name must be at least 2 characters")
    .max(100, "Attribute name must be at most 100 characters")
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
  type: attributeTypeEnum.optional(),
  values: z.array(attributeValueInputSchema).optional(),
  sortOrder: z.coerce.number().min(0).optional(),
  isActive: z.boolean().optional(),
});

/**
 * Schema for creating a new attribute (Vendor)
 */
export const createAttributeSchema = z.object({
  shopId: z.string().min(1, "Shop ID is required"),
  name: z
    .string()
    .min(2, "Attribute name must be at least 2 characters")
    .max(100, "Attribute name must be at most 100 characters"),
  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters")
    .max(100, "Slug must be at most 100 characters")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must be lowercase with hyphens only",
    )
    .optional(),
  type: attributeTypeEnum.default("select"),
  values: z.array(attributeValueInputSchema).default([]),
  sortOrder: z.coerce.number().min(0).optional().default(0),
  isActive: z.boolean().optional().default(true),
});

/**
 * Schema for updating an existing attribute (Vendor)
 */
export const updateAttributeSchema = z.object({
  id: z.string().min(1, "Attribute ID is required"),
  shopId: z.string().min(1, "Shop ID is required"),
  name: z
    .string()
    .min(2, "Attribute name must be at least 2 characters")
    .max(100, "Attribute name must be at most 100 characters")
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
  type: attributeTypeEnum.optional(),
  values: z.array(attributeValueInputSchema).optional(),
  sortOrder: z.coerce.number().min(0).optional(),
  isActive: z.boolean().optional(),
});

// ============================================================================
// Type Exports
// ============================================================================

export type AttributeType = z.infer<typeof attributeTypeEnum>;
export type AttributeSortBy = z.infer<typeof attributeSortByEnum>;
export type CreateAttributeInput = z.infer<typeof createAttributeSchema>;
export type UpdateAttributeInput = z.infer<typeof updateAttributeSchema>;

export type StoreAttributesQuery = z.infer<typeof storeAttributesQuerySchema>;
export type AdminAttributesQuery = z.infer<typeof adminAttributesQuerySchema>;
export type VendorAttributesQuery = z.infer<typeof vendorAttributesQuerySchema>;
