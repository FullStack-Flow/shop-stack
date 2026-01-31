import z from "zod";

export const shopSchema = z.object({
  name: z.string().min(2, "Shop name must be at least 2 characters"),
  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug can only contain lowercase letters, numbers, and hyphens"
    ),
  description: z.string().optional(),
  address: z.string().min(5, "Address must be at least 5 characters"),
  phone: z.string().min(10, "Phone number must be at least 10 characters"),
  email: z.email("Invalid email address").optional().or(z.literal("")),
});

export type ShopInput = z.infer<typeof shopSchema>;

export const getShopBySlugSchema = z.object({
  slug: z.string().min(1, "Slug is required"),
});

export const createShopSchema = z.object({
  name: z
    .string()
    .min(2, "Shop name must be at least 2 characters")
    .max(100, "Shop name must be at most 100 characters"),
  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters")
    .max(100, "Slug must be at most 100 characters")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must be lowercase with hyphens only"
    ),
  description: z
    .string()
    .max(500, "Description must be at most 500 characters")
    .optional(),
  logo: z.url().optional().or(z.literal("")),
  banner: z.url().optional().or(z.literal("")),
  category: z.string().max(50).optional(),
  address: z.string().max(200).optional(),
  phone: z.string().max(20).optional(),
  email: z.email("Invalid email address").optional().or(z.literal("")),
  enableNotifications: z.boolean().optional().default(false),
});

export const updateShopSchema = z.object({
  id: z.string().min(1, "Shop ID is required"),
  name: z
    .string()
    .min(2, "Shop name must be at least 2 characters")
    .max(100, "Shop name must be at most 100 characters")
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
  description: z.string().max(500).optional(),
  logo: z.url().optional().or(z.literal("")),
  banner: z.string().url().optional().or(z.literal("")),
  category: z.string().max(50).optional(),
  address: z.string().max(200).optional(),
  phone: z.string().max(20).optional(),
  email: z.email().optional().or(z.literal("")),
  enableNotifications: z.boolean().optional(),
  status: z.enum(["pending", "active", "suspended"]).optional(),
});

export const deleteShopSchema = z.object({
  id: z.string().min(1, "Shop ID is required"),
});

// Type exports
export type CreateShopInput = z.infer<typeof createShopSchema>;
export type UpdateShopInput = z.infer<typeof updateShopSchema>;
export type GetShopBySlugInput = z.infer<typeof getShopBySlugSchema>;
export type DeleteShopInput = z.infer<typeof deleteShopSchema>;
