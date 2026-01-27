/**
 * Category Validators
 *
 * z schemas for category-related operations.
 * Query schemas are in shared/category-query.ts for cross-context usage.
 */

import { z } from "zod";

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
      "Slug must be lowercase with hyphens only"
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
      "Slug must be lowercase with hyphens only"
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

// ============================================================================
// Type Exports
// ============================================================================

export type Category = z.infer<typeof categorySchema>;
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;

// Re-export shared query schemas for backward compatibility
export {
  deleteCategorySchema,
  getCategoryByIdSchema,
  getCategoryBySlugSchema,
  type VendorCategoriesQuery as GetCategoriesQueryInput,
  vendorCategoriesQuerySchema as getCategoriesQuerySchema,
} from "./shared/category-query";
