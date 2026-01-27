import { z } from "zod";

/**
 * Full Brand Entity Schema (Response)
 */
export const brandSchema = z.object({
  id: z.string(),
  shopId: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string().optional().nullable(),
  logo: z.string().optional().nullable(),
  website: z.string().optional().nullable(),
  sortOrder: z.number().default(0),
  isActive: z.boolean().default(true),
  productCount: z.number().default(0),
  createdAt: z.string(),
  updatedAt: z.string(),
});

/**
 * Schema for creating a new brand
 */
export const createBrandSchema = z.object({
  shopId: z.string().min(1, "Shop ID is required"),
  name: z
    .string()
    .min(2, "Brand name must be at least 2 characters")
    .max(100, "Brand name must be at most 100 characters"),
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
  logo: z.string().optional(),
  website: z.string().optional(),
  sortOrder: z.coerce.number().min(0).optional().default(0),
  isActive: z.boolean().optional().default(true),
});

/**
 * Schema for updating an existing brand
 */
export const updateBrandSchema = z.object({
  id: z.string().min(1, "Brand ID is required"),
  shopId: z.string().min(1, "Shop ID is required"),
  name: z
    .string()
    .min(2, "Brand name must be at least 2 characters")
    .max(100, "Brand name must be at most 100 characters")
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
  logo: z.string().optional().nullable(),
  website: z.string().optional().nullable(),
  sortOrder: z.coerce.number().min(0).optional(),
  isActive: z.boolean().optional(),
});

export type Brand = z.infer<typeof brandSchema>;
export type CreateBrandInput = z.infer<typeof createBrandSchema>;
export type UpdateBrandInput = z.infer<typeof updateBrandSchema>;

// Re-export shared query schemas for backward compatibility
export {
  deleteBrandSchema,
  getBrandByIdSchema,
  getBrandBySlugSchema,
  type VendorBrandsQuery as GetBrandsQueryInput,
  vendorBrandsQuerySchema as getBrandsQuerySchema,
} from "./shared/brand-query";
