/**
 * Address Validators
 *
 * Zod schemas for validating customer address data.
 */

import { z } from "zod";

/**
 * Address type enum
 */
export const addressTypeSchema = z.enum(["billing", "shipping"]);

/**
 * Create Address Schema
 */
export const createAddressSchema = z.object({
  type: addressTypeSchema.default("shipping"),
  title: z.string().min(1, "Title is required"),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  street: z.string().min(1, "Street address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zip: z.string().min(1, "ZIP code is required"),
  country: z.string().min(1, "Country is required"),
  isDefault: z.boolean().optional().default(false),
});

/**
 * Update Address Schema
 */
export const updateAddressSchema = z.object({
  id: z.string().min(1, "Address ID is required"),
  type: addressTypeSchema.optional(),
  title: z.string().min(1, "Title is required").optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  street: z.string().min(1, "Street address is required").optional(),
  city: z.string().min(1, "City is required").optional(),
  state: z.string().min(1, "State is required").optional(),
  zip: z.string().min(1, "ZIP code is required").optional(),
  country: z.string().min(1, "Country is required").optional(),
  isDefault: z.boolean().optional(),
});

/**
 * Delete Address Schema
 */
export const deleteAddressSchema = z.object({
  id: z.string().min(1, "Address ID is required"),
});

// Type exports
export type CreateAddressInput = z.infer<typeof createAddressSchema>;
export type UpdateAddressInput = z.infer<typeof updateAddressSchema>;
export type DeleteAddressInput = z.infer<typeof deleteAddressSchema>;
