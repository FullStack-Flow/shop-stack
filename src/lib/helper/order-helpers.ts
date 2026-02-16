import { and, eq } from "drizzle-orm";
import { db } from "../db";
import { shops } from "../db/schema/shop-schema";
import { getVendorForUser, isUserAdmin } from "./vendor";

export function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORD-${timestamp}${random}`;
}

export async function getShopIdsForOrderQuery(
  userId: string,
  shopSlug?: string,
): Promise<string[]> {
  const isAdmin = await isUserAdmin(userId);

  if (shopSlug) {
    // If shopSlug is provided, find that specific shop
    const shop = await db.query.shops.findFirst({
      where: eq(shops.slug, shopSlug),
    });

    if (!shop) {
      return [];
    }

    // If admin, allow access to any shop
    if (isAdmin) {
      return [shop.id];
    }

    // If vendor, verify they own this shop
    const vendor = await getVendorForUser(userId);
    if (vendor && shop.vendorId === vendor.id) {
      return [shop.id];
    }

    return [];
  }

  // No shopSlug provided - return all shops user has access to
  if (isAdmin) {
    // Admin with no shopSlug - this shouldn't happen in vendor routes
    // but return empty for safety (use admin routes for all orders)
    return [];
  }

  // Vendor - get their shops
  const vendor = await getVendorForUser(userId);
  if (!vendor) {
    return [];
  }

  const vendorShops = await db
    .select({ id: shops.id })
    .from(shops)
    .where(eq(shops.vendorId, vendor.id));

  return vendorShops.map((s) => s.id);
}

export async function verifyShopAccess(
  userId: string,
  shopId: string,
): Promise<boolean> {
  const isAdmin = await isUserAdmin(userId);
  if (isAdmin) {
    return true;
  }

  const vendor = await getVendorForUser(userId);
  if (!vendor) return false;

  const shop = await db.query.shops.findFirst({
    where: and(eq(shops.id, shopId), eq(shops.vendorId, vendor.id)),
  });

  return !!shop;
}
