import { count, inArray } from "drizzle-orm";
import { db } from "../db";
import type { user } from "../db/schema/auth-schema";
import { products } from "../db/schema/products-schema";
import type { shops, vendors } from "../db/schema/shop-schema";

export interface NormalizedShop {
  id: string;
  vendorId: string;
  name: string;
  slug: string;
  description: string | null;
  logo: string | null;
  banner: string | null;
  category: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  status: string | null;
  rating: string | null;
  monthlyRevenue: string | null;
  commissionRate: string;
  stripeConnectedAccountId: string | null;
  stripeOnboardingComplete: boolean;
  stripeChargesEnabled: boolean;
  stripePayoutsEnabled: boolean;
  totalProducts: number;
  totalOrders: number;
  customerCount: number;
  createdAt: string;
  updatedAt: string;
  // Vendor/owner info
  vendorBusinessName: string | null;
  vendorStatus: string | null;
  ownerName: string | null;
  ownerEmail: string | null;
  ownerImage: string | null;
}

export function normalizeShop(
  shop: typeof shops.$inferSelect,
  vendor: typeof vendors.$inferSelect | null,
  owner: typeof user.$inferSelect | null,
  productCount: number,
): NormalizedShop {
  return {
    id: shop.id,
    vendorId: shop.vendorId,
    name: shop.name,
    slug: shop.slug,
    description: shop.description,
    logo: shop.logo,
    banner: shop.banner,
    category: shop.category,
    address: shop.address,
    phone: shop.phone,
    email: shop.email,
    status: shop.status,
    rating: shop.rating,
    monthlyRevenue: shop.monthlyRevenue,
    commissionRate: vendor?.commissionRate ?? "10.00",
    stripeConnectedAccountId: vendor?.stripeConnectedAccountId ?? null,
    stripeOnboardingComplete: vendor?.stripeOnboardingComplete ?? false,
    stripeChargesEnabled: vendor?.stripeChargesEnabled ?? false,
    stripePayoutsEnabled: vendor?.stripePayoutsEnabled ?? false,
    totalProducts: productCount ?? shop.totalProducts ?? 0,
    totalOrders: shop.totalOrders ?? 0,
    customerCount: 0,
    createdAt: shop.createdAt.toISOString(),
    updatedAt: shop.updatedAt.toISOString(),
    // Vendor/owner info
    vendorBusinessName: vendor?.businessName ?? null,
    vendorStatus: vendor?.status ?? null,
    ownerName: owner?.name ?? null,
    ownerEmail: owner?.email ?? null,
    ownerImage: owner?.image ?? null,
  };
}

export async function getProductCountsForShops(
  shopIds: string[],
): Promise<Map<string, number>> {
  if (shopIds.length === 0) {
    return new Map();
  }

  const productCounts = await db
    .select({
      shopId: products.shopId,
      count: count(),
    })
    .from(products)
    .where(inArray(products.shopId, shopIds))
    .groupBy(products.shopId);

  return new Map(productCounts.map((pc) => [pc.shopId, pc.count]));
}
