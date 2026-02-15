import z from "zod";
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

export const categorySortByEnum = z.enum([
  "name",
  "createdAt",
  "sortOrder",
  "productCount",
]);

export const categoryFilterFields = {
  parentId: z.string().optional(),
  ...isActiveField,
  featured: z.coerce.boolean().optional(),
};

const sortFields = {
  sortBy: categorySortByEnum.optional().default("sortOrder"),
  sortDirection: sortDirectionEnum.optional().default("asc"),
};

export const vendorCategoriesQuerySchema = z.object({
  ...shopScopeFields,
  ...paginationFields,
  limit: paginationFields.limit.default(VENDOR_DEFAULT_LIMIT),
  ...sortFields,
  ...searchFields,
  ...categoryFilterFields,
});

export const getCategoryByIdSchema = createGetByIdSchema("Category");

export const getCategoryBySlugSchema = createGetBySlugSchema("Category");

export const deleteCategorySchema = createDeleteSchema("Category");

// ============================================================================
// Entity Schemas
// ============================================================================

/**
 * Full Category Entity Schema (Response)
 */
export const categorySchema = z.object({
  id: z.string(),
  shopId: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string().optional().nullable(),
  image: z.string().optional().nullable(),
  icon: z.string().optional().nullable(),
  parentId: z.string().optional().nullable(),
  parentName: z.string().optional().nullable(),
  level: z.number().default(0),
  sortOrder: z.number().default(0),
  isActive: z.boolean().default(true),
  featured: z.boolean().default(false),
  productCount: z.number().default(0),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// ============================================================================
// Mutation Schemas
// ============================================================================

/**
 * Schema for creating a new category
 */
export const createCategorySchema = z.object({
  shopId: z.string().min(1, "Shop ID is required"),
  name: z
    .string()
    .min(2, "Category name must be at least 2 characters")
    .max(100, "Category name must be at most 100 characters"),
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
    .optional(),
  image: z.string().url().optional().or(z.literal("")),
  icon: z.string().max(50).optional(),
  parentId: z.string().optional().nullable(),
  sortOrder: z.coerce.number().min(0).optional().default(0),
  isActive: z.boolean().optional().default(true),
  featured: z.boolean().optional().default(false),
});

/**
 * Schema for updating an existing category
 */
export const updateCategorySchema = z.object({
  id: z.string().min(1, "Category ID is required"),
  shopId: z.string().min(1, "Shop ID is required"),
  name: z
    .string()
    .min(2, "Category name must be at least 2 characters")
    .max(100, "Category name must be at most 100 characters")
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
  description: z.string().max(500).optional().nullable(),
  image: z.url().optional().or(z.literal("")).nullable(),
  icon: z.string().max(50).optional().nullable(),
  parentId: z.string().optional().nullable(),
  sortOrder: z.coerce.number().min(0).optional(),
  isActive: z.boolean().optional(),
  featured: z.boolean().optional(),
});

/**
 * Store Front Query Schema
 * - Public access (no auth)
 * - Limited filters (customer-facing only)
 * - Only active categories
 */
export const storeCategoriesQuerySchema = z.object({
  ...paginationFields,
  limit: paginationFields.limit.default(STORE_DEFAULT_LIMIT),
  ...sortFields,
  ...searchFields,
  ...categoryFilterFields,
  ...storeIsActiveField,
  ...shopSlugFields,
  ...optionalShopIdField,
});

/**
 * Admin Query Schema
 * - Admin auth required
 * - Full filter access
 * - Can see all categories across all shops
 */
export const adminCategoriesQuerySchema = z.object({
  ...paginationFields,
  limit: paginationFields.limit.default(ADMIN_DEFAULT_LIMIT),
  ...sortFields,
  ...searchFields,
  ...categoryFilterFields,
  ...optionalShopIdField,
  ...optionalVendorIdField,
});

export const toggleCategoryActiveSchema = createToggleActiveSchema("Category");

export const toggleCategoryFeaturedSchema = z.object({
  id: z.string().min(1, "Category ID is required"),
  featured: z.boolean(),
});

// ============================================================================
// Type Exports
// ============================================================================

export type CategorySortBy = z.infer<typeof categorySortByEnum>;
export type VendorCategoriesQuery = z.infer<typeof vendorCategoriesQuerySchema>;
export type Category = z.infer<typeof categorySchema>;
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type StoreCategoriesQuery = z.infer<typeof storeCategoriesQuerySchema>;
export type AdminCategoriesQuery = z.infer<typeof adminCategoriesQuerySchema>;
export type ToggleCategoryActiveInput = z.infer<
  typeof toggleCategoryActiveSchema
>;
export type ToggleCategoryFeaturedInput = z.infer<
  typeof toggleCategoryFeaturedSchema
>;
