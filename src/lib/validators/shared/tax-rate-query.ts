/**
 * Shared Tax Rate Query Validators
 *
 * Composable z schemas for tax rate queries.
 * Uses base-query for common schemas to ensure DRY compliance.
 */

import { z } from "zod";
import {
  ADMIN_DEFAULT_LIMIT,
  createDeleteSchema,
  createGetByIdSchema,
  createToggleActiveSchema,
  isActiveField,
  optionalShopIdField,
  optionalVendorIdField,
  paginationFields,
  searchFields,
  shopScopeFields,
  sortDirectionEnum,
  VENDOR_DEFAULT_LIMIT,
} from "./base-query";

// Re-export common types
export type { SortDirection } from "./base-query";

// ============================================================================
// Entity-Specific Enums
// ============================================================================

export const taxRateSortByEnum = z.enum([
  "name",
  "rate",
  "priority",
  "createdAt",
]);

// ============================================================================
// Entity-Specific Filter Fields
// ============================================================================

export const taxRateFilterFields = {
  ...isActiveField,
  country: z.string().optional(),
};

// ============================================================================
// Sort Fields
// ============================================================================

const sortFields = {
  sortBy: taxRateSortByEnum.optional().default("priority"),
  sortDirection: sortDirectionEnum.optional().default("asc"),
};

// ============================================================================
// Get by ID Schema (using factory functions)
// ============================================================================

export const getTaxRateByIdSchema = createGetByIdSchema("TaxRate");

// ============================================================================
// Composed Query Schemas
// ============================================================================

/**
 * Admin Query Schema
 * - Admin auth required
 * - Full filter access
 * - Can see all tax rates across all shops
 */
export const adminTaxRatesQuerySchema = z.object({
  ...paginationFields,
  limit: paginationFields.limit.default(ADMIN_DEFAULT_LIMIT),
  ...sortFields,
  ...searchFields,
  ...taxRateFilterFields,
  ...optionalShopIdField,
  ...optionalVendorIdField,
});

/**
 * Vendor Query Schema
 * - Vendor auth required
 * - Shop ID is required (scoped to their shop)
 */
export const vendorTaxRatesQuerySchema = z.object({
  ...shopScopeFields,
  ...paginationFields,
  limit: paginationFields.limit.default(VENDOR_DEFAULT_LIMIT),
  ...sortFields,
  ...searchFields,
  ...taxRateFilterFields,
});

// ============================================================================
// Action Schemas (using factory functions)
// ============================================================================

export const toggleTaxRateActiveSchema = createToggleActiveSchema("TaxRate");

export const deleteTaxRateSchema = createDeleteSchema("TaxRate");

/**
 * Schema for creating a new tax rate (Vendor)
 */
export const createTaxRateSchema = z.object({
  shopId: z.string().min(1, "Shop ID is required"),
  name: z
    .string()
    .min(2, "Tax rate name must be at least 2 characters")
    .max(100, "Tax rate name must be at most 100 characters"),
  rate: z.coerce
    .number({ message: "Tax rate is required" })
    .min(0.01, "Tax rate must be between 0.01 and 100")
    .max(100, "Tax rate must be between 0.01 and 100"),
  country: z
    .string()
    .min(2, "Country code is required")
    .max(2, "Country code must be 2 characters"),
  state: z
    .string()
    .max(50, "State must be at most 50 characters")
    .optional()
    .nullable(),
  zip: z
    .string()
    .max(20, "ZIP code must be at most 20 characters")
    .optional()
    .nullable(),
  priority: z.coerce
    .number({ message: "Priority is required" })
    .min(1, "Priority must be at least 1"),
  isActive: z.boolean().optional().default(true),
  isCompound: z.boolean().optional().default(false),
});

/**
 * Schema for updating an existing tax rate (Vendor)
 */
export const updateTaxRateSchema = z.object({
  id: z.string().min(1, "Tax rate ID is required"),
  shopId: z.string().min(1, "Shop ID is required"),
  name: z
    .string()
    .min(2, "Tax rate name must be at least 2 characters")
    .max(100, "Tax rate name must be at most 100 characters")
    .optional(),
  rate: z.coerce
    .number()
    .min(0.01, "Tax rate must be between 0.01 and 100")
    .max(100, "Tax rate must be between 0.01 and 100")
    .optional(),
  country: z
    .string()
    .min(2, "Country code is required")
    .max(2, "Country code must be 2 characters")
    .optional(),
  state: z
    .string()
    .max(50, "State must be at most 50 characters")
    .optional()
    .nullable(),
  zip: z
    .string()
    .max(20, "ZIP code must be at most 20 characters")
    .optional()
    .nullable(),
  priority: z.coerce.number().min(1, "Priority must be at least 1").optional(),
  isActive: z.boolean().optional(),
  isCompound: z.boolean().optional(),
});

// ============================================================================
// Type Exports
// ============================================================================

export type TaxRateSortBy = z.infer<typeof taxRateSortByEnum>;
export type CreateTaxRateInput = z.infer<typeof createTaxRateSchema>;
export type UpdateTaxRateInput = z.infer<typeof updateTaxRateSchema>;

export type AdminTaxRatesQuery = z.infer<typeof adminTaxRatesQuerySchema>;
export type VendorTaxRatesQuery = z.infer<typeof vendorTaxRatesQuerySchema>;
