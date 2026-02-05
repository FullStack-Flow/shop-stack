import { createServerFn } from "@tanstack/react-start";
import { and, eq, sql } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { db } from "@/lib/db";
import { cartItems, cartSessions } from "@/lib/db/schema/cart-schema";
import { products } from "@/lib/db/schema/products-schema";
import {
  fetchCartWithDetails,
  getOrCreateCartSession,
} from "@/lib/helper/cart-helpers";
import { optionalAuthMiddleware } from "@/lib/middleware/optional-auth";
import {
  addToCartSchema,
  clearCartSchema,
  getCartSchema,
  mergeCartsSchema,
  removeFromCartSchema,
  updateCartItemSchema,
} from "@/lib/validators/cart";
import type { CartResponse } from "@/types/cart";

export const getCart = createServerFn({ method: "GET" })
  .middleware([optionalAuthMiddleware])
  .inputValidator(getCartSchema)
  .handler(async ({ context, data }): Promise<CartResponse> => {
    const userId = context.session?.user?.id;
    const guestSessionId = data.sessionId || null;

    if (!userId && !guestSessionId) {
      return {
        items: [],
        totalItems: 0,
        subtotal: 0,
        sessionId: null,
      };
    }

    let sessionId: string | null = null;

    if (userId) {
      const session = await db.query.cartSessions.findFirst({
        where: eq(cartSessions.userId, userId),
      });
      sessionId = session?.id || null;
    } else if (guestSessionId) {
      const session = await db.query.cartSessions.findFirst({
        where: eq(cartSessions.sessionId, guestSessionId),
      });
      sessionId = session?.id || null;
    }

    if (!sessionId) {
      return {
        items: [],
        totalItems: 0,
        subtotal: 0,
        sessionId: guestSessionId || null,
      };
    }

    return fetchCartWithDetails(sessionId);
  });

export const addToCart = createServerFn({ method: "POST" })
  .middleware([optionalAuthMiddleware])
  .inputValidator(
    addToCartSchema.extend({
      sessionId: getCartSchema.shape.sessionId,
    }),
  )
  .handler(async ({ context, data }) => {
    const userId = context.session?.user?.id;
    const {
      productId,
      quantity,
      variantOptions,
      sessionId: guestSessionId,
    } = data;

    // Verify product exists and is active
    const product = await db.query.products.findFirst({
      where: and(eq(products.id, productId), eq(products.isActive, true)),
    });

    if (!product) {
      throw new Error("Product not found or is not available");
    }

    // Check stock
    if (product.stock !== null && product.stock < quantity) {
      throw new Error("Not enough stock available");
    }

    // Get or create cart session
    const { sessionId: cartSessionId } = await getOrCreateCartSession(
      userId,
      guestSessionId,
    );

    // Create unique variant key
    const variantKey = variantOptions ? JSON.stringify(variantOptions) : null;

    // Check if item already exists in cart
    const existingItem = await db.query.cartItems.findFirst({
      where: and(
        eq(cartItems.cartSessionId, cartSessionId),
        eq(cartItems.productId, productId),
        variantKey
          ? eq(cartItems.variantOptions, variantKey)
          : sql`${cartItems.variantOptions} IS NULL`,
      ),
    });

    if (existingItem) {
      // Update quantity
      const newQuantity = existingItem.quantity + quantity;

      // Check stock for new quantity
      if (product.stock !== null && product.stock < newQuantity) {
        throw new Error(
          "Not enough stock available for the requested quantity",
        );
      }

      await db
        .update(cartItems)
        .set({ quantity: newQuantity })
        .where(eq(cartItems.id, existingItem.id));
    } else {
      // Add new item
      await db.insert(cartItems).values({
        id: uuidv4(),
        cartSessionId,
        productId,
        quantity,
        variantOptions: variantKey,
      });
    }

    // Return updated cart
    const cart = await fetchCartWithDetails(cartSessionId);

    return {
      success: true,
      message: "Item added to cart",
      cart,
    };
  });

export const updateCartItem = createServerFn({ method: "POST" })
  .middleware([optionalAuthMiddleware])
  .inputValidator(
    updateCartItemSchema.extend({
      sessionId: getCartSchema.shape.sessionId,
    }),
  )
  .handler(async ({ context, data }) => {
    const userId = context.session?.user?.id;
    const { itemId, quantity, sessionId: guestSessionId } = data;

    // Find the cart item
    const item = await db.query.cartItems.findFirst({
      where: eq(cartItems.id, itemId),
      with: {
        cartSession: true,
      },
    });

    if (!item) {
      throw new Error("Cart item not found");
    }

    // Verify ownership
    if (userId) {
      if (item.cartSession.userId !== userId) {
        throw new Error("Unauthorized");
      }
    } else if (guestSessionId) {
      if (item.cartSession.sessionId !== guestSessionId) {
        throw new Error("Unauthorized");
      }
    } else {
      throw new Error("Unauthorized");
    }

    // Check stock
    const product = await db.query.products.findFirst({
      where: eq(products.id, item.productId),
    });

    if (
      product?.stock !== null &&
      product?.stock !== undefined &&
      product.stock < quantity
    ) {
      throw new Error("Not enough stock available");
    }

    // Update quantity
    await db
      .update(cartItems)
      .set({ quantity })
      .where(eq(cartItems.id, itemId));

    // Return updated cart
    const cart = await fetchCartWithDetails(item.cartSessionId);

    return {
      success: true,
      message: "Cart updated",
      cart,
    };
  });

export const removeFromCart = createServerFn({ method: "POST" })
  .middleware([optionalAuthMiddleware])
  .inputValidator(
    removeFromCartSchema.extend({
      sessionId: getCartSchema.shape.sessionId,
    }),
  )
  .handler(async ({ context, data }) => {
    const userId = context.session?.user?.id;
    const { itemId, sessionId: guestSessionId } = data;

    // Find the cart item
    const item = await db.query.cartItems.findFirst({
      where: eq(cartItems.id, itemId),
      with: {
        cartSession: true,
      },
    });

    if (!item) {
      throw new Error("Cart item not found");
    }

    // Verify ownership
    if (userId) {
      if (item.cartSession.userId !== userId) {
        throw new Error("Unauthorized");
      }
    } else if (guestSessionId) {
      if (item.cartSession.sessionId !== guestSessionId) {
        throw new Error("Unauthorized");
      }
    } else {
      throw new Error("Unauthorized");
    }

    // Remove item
    await db.delete(cartItems).where(eq(cartItems.id, itemId));

    // Return updated cart
    const cart = await fetchCartWithDetails(item.cartSessionId);

    return {
      success: true,
      message: "Item removed from cart",
      cart,
    };
  });

export const clearCart = createServerFn({ method: "POST" })
  .middleware([optionalAuthMiddleware])
  .inputValidator(clearCartSchema)
  .handler(async ({ context, data }) => {
    const userId = context.session?.user?.id;
    const guestSessionId = data.sessionId;

    // Find the session
    let session: typeof cartSessions.$inferSelect | undefined;

    if (userId) {
      session = await db.query.cartSessions.findFirst({
        where: eq(cartSessions.userId, userId),
      });
    } else if (guestSessionId) {
      session = await db.query.cartSessions.findFirst({
        where: eq(cartSessions.sessionId, guestSessionId),
      });
    }

    if (!session) {
      return {
        success: true,
        message: "Cart already empty",
        cart: {
          items: [],
          totalItems: 0,
          subtotal: 0,
          sessionId: guestSessionId || null,
        },
      };
    }

    // Delete all items in the cart
    await db.delete(cartItems).where(eq(cartItems.cartSessionId, session.id));

    return {
      success: true,
      message: "Cart cleared",
      cart: {
        items: [],
        totalItems: 0,
        subtotal: 0,
        sessionId: session.sessionId || null,
      },
    };
  });

export const mergeCarts = createServerFn({ method: "POST" })
  .middleware([optionalAuthMiddleware])
  .inputValidator(mergeCartsSchema)
  .handler(async ({ context, data }) => {
    const userId = context.session?.user?.id;

    if (!userId) {
      throw new Error("Must be logged in to merge carts");
    }

    const { guestSessionId } = data;

    // Find guest session
    const guestSession = await db.query.cartSessions.findFirst({
      where: eq(cartSessions.sessionId, guestSessionId),
    });

    if (!guestSession) {
      // No guest cart to merge
      const { sessionId: userSessionId } = await getOrCreateCartSession(
        userId,
        undefined,
      );
      return fetchCartWithDetails(userSessionId);
    }

    // Get or create user session
    const { sessionId: userSessionId } = await getOrCreateCartSession(
      userId,
      undefined,
    );

    // Get items from guest cart
    const guestItems = await db.query.cartItems.findMany({
      where: eq(cartItems.cartSessionId, guestSession.id),
    });

    // Merge items
    for (const guestItem of guestItems) {
      // Check if item already exists in user cart
      const existingItem = await db.query.cartItems.findFirst({
        where: and(
          eq(cartItems.cartSessionId, userSessionId),
          eq(cartItems.productId, guestItem.productId),
          guestItem.variantOptions
            ? eq(cartItems.variantOptions, guestItem.variantOptions)
            : sql`${cartItems.variantOptions} IS NULL`,
        ),
      });

      if (existingItem) {
        // Update quantity (sum both)
        await db
          .update(cartItems)
          .set({ quantity: existingItem.quantity + guestItem.quantity })
          .where(eq(cartItems.id, existingItem.id));
      } else {
        // Move item to user cart
        await db
          .update(cartItems)
          .set({ cartSessionId: userSessionId })
          .where(eq(cartItems.id, guestItem.id));
      }
    }

    // Delete guest session
    await db.delete(cartSessions).where(eq(cartSessions.id, guestSession.id));

    // Return merged cart
    return fetchCartWithDetails(userSessionId);
  });
