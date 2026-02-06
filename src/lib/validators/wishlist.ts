/**
 * Wishlist Validators
 *
 * Zod validation schemas for wishlist operations.
 */

import { z } from 'zod';

export const toggleWishlistSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
});

export type ToggleWishlistInput = z.infer<typeof toggleWishlistSchema>;
