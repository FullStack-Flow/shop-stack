/**
 * Base Query Validators - Single Source of Truth
 *
 * This module contains all shared, reusable z schemas and factory functions
 * used across entity-specific query validators. Import from here to ensure
 * DRY compliance and consistent validation across the application.
 */

import { z } from "zod";

// ============================================================================
// Common Enums (Single Source of Truth)
// ============================================================================

/**
 * Sort direction enum - used in all list queries
 */
export const sortDirectionEnum = z.enum(["asc", "desc"]);

// ============================================================================
// Common Field Groups (Composable Parts)
// ============================================================================

/**
 * Pagination fields - used in all list queries
 * - limit: 1-100, optional
 * - offset: 0+, defaults to 0
 */
export const paginationFields = {
  limit: z.coerce.number().min(1).max(100).optional(),
  offset: z.coerce.number().min(0).optional().default(0),
};

/**
 * Search field - used for full-text search
 */
export const searchFields = {
  search: z.string().optional(),
};

/**
 * Shop scope fields - for vendor context (shopId required)
 */
export const shopScopeFields = {
  shopId: z.string().min(1, "Shop ID is required"),
};

/**
 * Optional shop ID field - for admin/public contexts
 */
export const optionalShopIdField = {
  shopId: z.string().optional(),
};

/**
 * Optional vendor ID field - for admin context
 */
export const optionalVendorIdField = {
  vendorId: z.string().optional(),
};

/**
 * Shop slug filter - for public store pages
 */
export const shopSlugFields = {
  shopSlug: z.string().optional(),
};

/**
 * isActive filter field - used across most entities
 */
export const isActiveField = {
  isActive: z.coerce.boolean().optional(),
};

/**
 * Store-only isActive field - always defaults to true
 */
export const storeIsActiveField = {
  isActive: z.literal(true).optional().default(true),
};

// ============================================================================
// Schema Factory Functions
// ============================================================================

/**
 * Creates a "get by ID" schema for any entity
 */
export const createGetByIdSchema = (entityName: string) =>
  z.object({
    id: z.string().min(1, `${entityName} ID is required`),
  });

/**
 * Creates a "get by slug" schema for any entity
 */
export const createGetBySlugSchema = (entityName: string) =>
  z.object({
    slug: z.string().min(1, `${entityName} slug is required`),
    shopSlug: z.string().optional(),
  });

/**
 * Creates a "toggle active" schema for any entity
 */
export const createToggleActiveSchema = (entityName: string) =>
  z.object({
    id: z.string().min(1, `${entityName} ID is required`),
    isActive: z.boolean(),
  });

/**
 * Creates a "delete" schema for any entity
 */
export const createDeleteSchema = (entityName: string) =>
  z.object({
    id: z.string().min(1, `${entityName} ID is required`),
  });

// ============================================================================
// Default Limits
// ============================================================================

export const STORE_DEFAULT_LIMIT = 50;
export const ADMIN_DEFAULT_LIMIT = 10;
export const VENDOR_DEFAULT_LIMIT = 10;

// ============================================================================
// Type Exports
// ============================================================================

export type SortDirection = z.infer<typeof sortDirectionEnum>;
