/**
 * Shipping Validators
 *
 * z schemas for shipping-related operations.
 */

import { z } from "zod";

// ============================================================================
// Entity Schemas
// ============================================================================

/**
 * Full Shipping Method Entity Schema (Response)
 */
export const shippingMethodSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  price: z.string(), // Decimal returned as string
  duration: z.string(),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// ============================================================================
// Query Schemas
// ============================================================================

/**
 * Schema for listing shipping methods with pagination and filters
 */
export const getShippingMethodsQuerySchema = z.object({
  shopId: z.string().min(1, "Shop ID is required"),
  limit: z.coerce.number().min(1).max(100).optional().default(10),
  offset: z.coerce.number().min(0).optional().default(0),
  search: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
  sortBy: z
    .enum(["name", "createdAt", "price"])
    .optional()
    .default("createdAt"),
  sortDirection: z.enum(["asc", "desc"]).optional().default("desc"),
});

/**
 * Schema for getting a single shipping method by ID
 */
export const getShippingMethodByIdSchema = z.object({
  id: z.string().min(1, "Shipping Method ID is required"),
  shopId: z.string().min(1, "Shop ID is required"),
});

// ============================================================================
// Mutation Schemas
// ============================================================================

/**
 * Schema for creating a new shipping method
 */
export const createShippingMethodSchema = z.object({
  shopId: z.string().min(1, "Shop ID is required"),
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be at most 100 characters"),
  description: z.string().optional(),
  price: z.coerce.number().min(0, "Price must be greater than or equal to 0"),
  duration: z
    .string()
    .min(1, "Duration is required")
    .max(50, "Duration must be at most 50 characters"),
  isActive: z.boolean().optional().default(true),
});

/**
 * Schema for updating a shipping method
 */
export const updateShippingMethodSchema = createShippingMethodSchema
  .partial()
  .extend({
    id: z.string().min(1, "Shipping Method ID is required"),
    shopId: z.string().min(1, "Shop ID is required"),
  });

/**
 * Schema for deleting a shipping method
 */
export const deleteShippingMethodSchema = z.object({
  id: z.string().min(1, "Shipping Method ID is required"),
  shopId: z.string().min(1, "Shop ID is required"),
});

export type CreateShippingMethodInput = z.input<
  typeof createShippingMethodSchema
>;
export type UpdateShippingMethodInput = z.input<
  typeof updateShippingMethodSchema
>;
export type DeleteShippingMethodInput = z.input<
  typeof deleteShippingMethodSchema
>;
