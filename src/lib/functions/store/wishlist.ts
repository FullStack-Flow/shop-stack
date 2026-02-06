/**
 * Wishlist Server Functions
 *
 * Server functions for managing user wishlists.
 * Uses TanStack Start's createServerFn with authentication middleware.
 */

import { createServerFn } from "@tanstack/react-start";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { wishlistItems } from "@/lib/db/schema/wishlist-schema";
import { authMiddleware } from "@/lib/middleware/auth";
import { optionalAuthMiddleware } from "@/lib/middleware/optional-auth";
import { toggleWishlistSchema } from "@/lib/validators/wishlist";

// ============================================================================
// Get User Wishlist
// ============================================================================

export const getWishlist = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const userId = context.session?.user?.id;

    if (!userId) {
      throw new Error("Unauthorized: User not found");
    }

    const items = await db.query.wishlistItems.findMany({
      where: eq(wishlistItems.userId, userId),
      with: {
        product: {
          with: {
            images: true, // Fetch product images
            shop: true,
          },
        },
      },
      orderBy: [desc(wishlistItems.createdAt)],
    });

    return { items };
  });

// ============================================================================
// Toggle Wishlist Item
// ============================================================================

export const toggleWishlist = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator(toggleWishlistSchema)
  .handler(async ({ context, data }) => {
    const userId = context.session?.user?.id;

    if (!userId) {
      throw new Error("Unauthorized: User not found");
    }

    // Check if item exists
    const existingItem = await db.query.wishlistItems.findFirst({
      where: and(
        eq(wishlistItems.userId, userId),
        eq(wishlistItems.productId, data.productId),
      ),
    });

    if (existingItem) {
      // Remove from wishlist
      await db
        .delete(wishlistItems)
        .where(
          and(
            eq(wishlistItems.userId, userId),
            eq(wishlistItems.productId, data.productId),
          ),
        );

      return { added: false };
    } else {
      // Add to wishlist
      await db.insert(wishlistItems).values({
        id: crypto.randomUUID(),
        userId,
        productId: data.productId,
      });

      return { added: true };
    }
  });

// ============================================================================
// Check Wishlist Status
// ============================================================================

export const checkWishlistStatus = createServerFn({ method: "POST" })
  .middleware([optionalAuthMiddleware])
  .inputValidator(toggleWishlistSchema)
  .handler(async ({ context, data }) => {
    const userId = context.session?.user?.id;

    if (!userId) {
      return { isInWishlist: false };
    }

    const item = await db.query.wishlistItems.findFirst({
      where: and(
        eq(wishlistItems.userId, userId),
        eq(wishlistItems.productId, data.productId),
      ),
    });

    return { isInWishlist: !!item };
  });
