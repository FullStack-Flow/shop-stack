import { and, eq } from "drizzle-orm";
import { db } from "../db";
import { user } from "../db/schema/auth-schema";
import { shops, vendors } from "../db/schema/shop-schema";

export const getVendorForUser = async (userId: string) => {
  const vendor = await db.query.vendors.findFirst({
    where: eq(vendors.userId, userId),
  });
  return vendor;
};

export const isUserAdmin = async (userId: string): Promise<boolean> => {
  const [userData] = await db
    .select({ role: user.role })
    .from(user)
    .where(eq(user.id, userId));
  return userData?.role === "admin";
};

export interface ShopAccessResult {
  hasAccess: boolean;
  isAdmin: boolean;
  shop: typeof shops.$inferSelect | null;
  vendor: typeof vendors.$inferSelect | null;
}

export const verifyShopOwnership = async (shopId: string, vendorId: string) => {
  const shop = await db.query.shops.findFirst({
    where: and(eq(shops.id, shopId), eq(shops.vendorId, vendorId)),
  });
  return shop;
};

export const verifyShopAccess = async (
  userId: string,
  shopId: string,
): Promise<ShopAccessResult> => {
  // Check if user is admin first
  const isAdmin = await isUserAdmin(userId);

  if (isAdmin) {
    // Admin can access any shop
    const shop = await db.query.shops.findFirst({
      where: eq(shops.id, shopId),
    });

    return {
      hasAccess: !!shop,
      isAdmin: true,
      shop: shop || null,
      vendor: null,
    };
  }

  // For vendors, check ownership
  const vendor = await getVendorForUser(userId);

  if (!vendor) {
    return {
      hasAccess: false,
      isAdmin: false,
      shop: null,
      vendor: null,
    };
  }

  // Verify shop belongs to this vendor
  const shop = await verifyShopOwnership(shopId, vendor.id);

  return {
    hasAccess: !!shop,
    isAdmin: false,
    shop: shop || null,
    vendor,
  };
};

export const requireShopAccess = async (
  userId: string,
  shopId: string,
): Promise<ShopAccessResult> => {
  const access = await verifyShopAccess(userId, shopId);

  if (!access.hasAccess) {
    if (!access.vendor && !access.isAdmin) {
      throw new Error("Vendor profile not found.");
    }
    throw new Error("Shop not found or you do not have access to it.");
  }

  return access;
};
