/**
 * Cart Validators
 *
 * Zod schemas for cart operations.
 */

import { z } from 'zod';

// ============================================================================
// Variant Options Schema
// ============================================================================

export const variantOptionsSchema = z.record(z.string(), z.string()).optional();

// ============================================================================
// Add to Cart
// ============================================================================

export const addToCartSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1').default(1),
  variantOptions: variantOptionsSchema,
});

export type AddToCartInput = z.infer<typeof addToCartSchema>;

// ============================================================================
// Update Cart Item
// ============================================================================

export const updateCartItemSchema = z.object({
  itemId: z.string().min(1, 'Item ID is required'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
});

export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;

// ============================================================================
// Remove from Cart
// ============================================================================

export const removeFromCartSchema = z.object({
  itemId: z.string().min(1, 'Item ID is required'),
});

export type RemoveFromCartInput = z.infer<typeof removeFromCartSchema>;

// ============================================================================
// Get Cart (No input needed - uses session)
// ============================================================================

export const getCartSchema = z.object({
  sessionId: z.string().optional(), // For guest carts
});

export type GetCartInput = z.infer<typeof getCartSchema>;

// ============================================================================
// Clear Cart
// ============================================================================

export const clearCartSchema = z.object({
  sessionId: z.string().optional(), // For guest carts
});

export type ClearCartInput = z.infer<typeof clearCartSchema>;

// ============================================================================
// Merge Carts (When guest logs in)
// ============================================================================

export const mergeCartsSchema = z.object({
  guestSessionId: z.string().min(1, 'Guest session ID is required'),
});

export type MergeCartsInput = z.infer<typeof mergeCartsSchema>;
