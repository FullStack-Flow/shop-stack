import { eq, sql } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import type { CartItemResponse, CartResponse } from "@/types/cart";
import { db } from "../db";
import { cartItems, cartSessions } from "../db/schema/cart-schema";
import { productImages, products } from "../db/schema/products-schema";

export async function fetchCartWithDetails(
  cartSessionId: string,
): Promise<CartResponse> {
  // Fetch cart items with product details
  const items = await db
    .select({
      id: cartItems.id,
      productId: cartItems.productId,
      quantity: cartItems.quantity,
      variantOptions: cartItems.variantOptions,
      productName: products.name,
      productSlug: products.slug,
      sellingPrice: products.sellingPrice,
      regularPrice: products.regularPrice,
      stock: products.stock,
      shopId: products.shopId,
    })
    .from(cartItems)
    .innerJoin(products, eq(cartItems.productId, products.id))
    .where(eq(cartItems.cartSessionId, cartSessionId));

  // Fetch product images separately
  const productIds = items.map((item) => item.productId);
  const images =
    productIds.length > 0
      ? await db
          .select({
            productId: productImages.productId,
            url: productImages.url,
            isPrimary: productImages.isPrimary,
            sortOrder: productImages.sortOrder,
          })
          .from(productImages)
          .where(sql`${productImages.productId} IN ${productIds}`)
      : [];

  // Create a map of product ID to primary image
  const imageMap = new Map<string, string>();
  for (const img of images) {
    if (!imageMap.has(img.productId) || img.isPrimary) {
      imageMap.set(img.productId, img.url);
    }
  }

  // Get the cart session to return the guest sessionId if needed
  const session = await db.query.cartSessions.findFirst({
    where: eq(cartSessions.id, cartSessionId),
  });

  // Fetch shop names
  const shopIds = [...new Set(items.map((item) => item.shopId))];
  const shopsData =
    shopIds.length > 0
      ? await db.query.shops.findMany({
          where: sql`id IN ${shopIds}`,
          columns: { id: true, name: true },
        })
      : [];
  const shopMap = new Map(shopsData.map((shop) => [shop.id, shop.name]));

  // Map to response format
  const cartItems_mapped: CartItemResponse[] = items.map((item) => ({
    id: item.id,
    productId: item.productId,
    name: item.productName,
    slug: item.productSlug,
    price: parseFloat(item.sellingPrice),
    regularPrice: item.regularPrice ? parseFloat(item.regularPrice) : null,
    image: imageMap.get(item.productId) || null,
    quantity: item.quantity,
    maxQuantity: item.stock || 99,
    variantOptions: item.variantOptions
      ? JSON.parse(item.variantOptions)
      : null,
    shopId: item.shopId,
    shopName: shopMap.get(item.shopId) || "Unknown Store",
  }));

  const totalItems = cartItems_mapped.reduce(
    (sum, item) => sum + item.quantity,
    0,
  );
  const subtotal = cartItems_mapped.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  return {
    items: cartItems_mapped,
    totalItems,
    subtotal,
    sessionId: session?.sessionId || null,
  };
}

export async function getOrCreateCartSession(
  userId: string | null | undefined,
  guestSessionId: string | undefined,
): Promise<{ sessionId: string; isNew: boolean }> {
  // For authenticated users
  if (userId) {
    const existingSession = await db.query.cartSessions.findFirst({
      where: eq(cartSessions.userId, userId),
    });

    if (existingSession) {
      return { sessionId: existingSession.id, isNew: false };
    }

    // Create new session for user
    const newSessionId = uuidv4();
    await db.insert(cartSessions).values({
      id: newSessionId,
      userId: userId,
    });

    return { sessionId: newSessionId, isNew: true };
  }

  // For guest users
  if (guestSessionId) {
    const existingSession = await db.query.cartSessions.findFirst({
      where: eq(cartSessions.sessionId, guestSessionId),
    });

    if (existingSession) {
      return { sessionId: existingSession.id, isNew: false };
    }
  }

  // Create new guest session
  const newSessionId = uuidv4();
  const newGuestSessionId = guestSessionId || uuidv4();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30); // 30 days expiry

  await db.insert(cartSessions).values({
    id: newSessionId,
    sessionId: newGuestSessionId,
    expiresAt,
  });

  return { sessionId: newSessionId, isNew: true };
}

// ============================================================================
// Local Storage Key for Guest Session
// ============================================================================

const GUEST_SESSION_KEY = "cart-guest-session-id";

// ============================================================================
// Helper: Get/Set Guest Session ID
// ============================================================================

export function getGuestSessionId(): string | undefined {
  if (typeof window === "undefined") return undefined;
  return localStorage.getItem(GUEST_SESSION_KEY) || undefined;
}

export function setGuestSessionId(sessionId: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(GUEST_SESSION_KEY, sessionId);
}

export function clearGuestSessionId(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(GUEST_SESSION_KEY);
}
