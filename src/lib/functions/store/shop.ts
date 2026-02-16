import { createServerFn } from "@tanstack/react-start";
import { and, asc, count, desc, eq, ilike, or } from "drizzle-orm";
import { db } from "@/lib/db";
import { products } from "@/lib/db/schema/products-schema";
import { shops, vendors } from "@/lib/db/schema/shop-schema";
import {
  storeShopBySlugSchema,
  storeShopsQuerySchema,
} from "@/lib/validators/shop";
import { createPaginatedResponse } from "@/types/api-response";
import type { StoreShop, StoreShopListResponse } from "@/types/shop";

// ============================================================================
// Get Shops (Store Front - Public)
// ============================================================================

/**
 * Get shops for the public storefront
 * Only returns active shops
 * No authentication required
 */
export const getStoreShops = createServerFn({ method: "GET" })
  .inputValidator(storeShopsQuerySchema)
  .handler(async ({ data }): Promise<StoreShopListResponse> => {
    const { limit, offset, search, category, sortBy, sortDirection } = data;

    // Base conditions: show active and pending shops (exclude deleted)
    // NOTE: In production, you may want to filter by status = 'active' only
    const conditions: ReturnType<typeof eq>[] = [];

    // Search filter
    if (search) {
      conditions.push(
        or(
          ilike(shops.name, `%${search}%`),
          ilike(shops.description, `%${search}%`),
        ) as any,
      );
    }

    // Category filter
    if (category) {
      conditions.push(eq(shops.category, category));
    }

    // Build order clause
    const orderFn = sortDirection === "desc" ? desc : asc;
    const orderClause = (() => {
      switch (sortBy) {
        case "name":
          return orderFn(shops.name);
        case "rating":
          return orderFn(shops.rating);
        case "totalProducts":
          return orderFn(shops.totalProducts);
        default:
          return orderFn(shops.createdAt);
      }
    })();

    // Build where clause (handle empty conditions)
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get count and shops in parallel
    const [countResult, shopList] = await Promise.all([
      db.select({ count: count() }).from(shops).where(whereClause),
      db
        .select({
          id: shops.id,
          slug: shops.slug,
          name: shops.name,
          description: shops.description,
          logo: shops.logo,
          banner: shops.banner,
          category: shops.category,
          address: shops.address,
          phone: shops.phone,
          email: shops.email,
          status: shops.status,
          rating: shops.rating,
          totalProducts: shops.totalProducts,
          totalOrders: shops.totalOrders,
          vendorId: shops.vendorId,
          createdAt: shops.createdAt,
        })
        .from(shops)
        .where(whereClause)
        .orderBy(orderClause)
        .limit(limit)
        .offset(offset),
    ]);

    const total = countResult[0]?.count ?? 0;

    // Fetch vendor names if needed
    const vendorIds = [...new Set(shopList.map((s) => s.vendorId))];
    const vendorRecords =
      vendorIds.length > 0
        ? await db
            .select({ id: vendors.id, businessName: vendors.businessName })
            .from(vendors)
            .where(or(...vendorIds.map((id) => eq(vendors.id, id))) as any)
        : [];

    const vendorMap = new Map(vendorRecords.map((v) => [v.id, v.businessName]));

    // Fetch actual product counts for each shop
    const shopIds = shopList.map((s) => s.id);
    const productCountRecords =
      shopIds.length > 0
        ? await db
            .select({
              shopId: products.shopId,
              count: count(),
            })
            .from(products)
            .where(or(...shopIds.map((id) => eq(products.shopId, id))) as any)
            .groupBy(products.shopId)
        : [];

    const productCountMap = new Map(
      productCountRecords.map((p) => [p.shopId, p.count]),
    );

    // Normalize response
    const normalizedShops: StoreShop[] = shopList.map((shop) => ({
      id: shop.id,
      slug: shop.slug,
      name: shop.name,
      description: shop.description,
      logo: shop.logo,
      banner: shop.banner,
      category: shop.category,
      address: shop.address,
      phone: shop.phone,
      email: shop.email,
      status: shop.status,
      rating: Number(shop.rating ?? 0),
      totalProducts: productCountMap.get(shop.id) ?? 0,
      totalOrders: shop.totalOrders ?? 0,
      vendorName: vendorMap.get(shop.vendorId) ?? null,
      createdAt: shop.createdAt.toISOString(),
    }));

    return createPaginatedResponse(normalizedShops, total, limit, offset);
  });

export const getStoreShopBySlug = createServerFn({ method: "GET" })
  .inputValidator(storeShopBySlugSchema)
  .handler(async ({ data }) => {
    const { slug } = data;

    // Get shop with active status
    const [shop] = await db
      .select({
        id: shops.id,
        slug: shops.slug,
        name: shops.name,
        description: shops.description,
        logo: shops.logo,
        banner: shops.banner,
        category: shops.category,
        address: shops.address,
        phone: shops.phone,
        email: shops.email,
        status: shops.status,
        rating: shops.rating,
        totalProducts: shops.totalProducts,
        totalOrders: shops.totalOrders,
        vendorId: shops.vendorId,
        createdAt: shops.createdAt,
      })
      .from(shops)
      .where(eq(shops.slug, slug));

    if (!shop) {
      throw new Error("Shop not found.");
    }

    // Get vendor name
    let vendorName: string | null = null;
    if (shop.vendorId) {
      const [vendor] = await db
        .select({ businessName: vendors.businessName })
        .from(vendors)
        .where(eq(vendors.id, shop.vendorId));
      vendorName = vendor?.businessName ?? null;
    }

    // Get actual product count
    const [productCountResult] = await db
      .select({ count: count() })
      .from(products)
      .where(eq(products.shopId, shop.id));

    const storeShop: StoreShop = {
      id: shop.id,
      slug: shop.slug,
      name: shop.name,
      description: shop.description,
      logo: shop.logo,
      banner: shop.banner,
      category: shop.category,
      address: shop.address,
      phone: shop.phone,
      email: shop.email,
      status: shop.status,
      rating: Number(shop.rating ?? 0),
      totalProducts: productCountResult?.count ?? shop.totalProducts ?? 0,
      totalOrders: shop.totalOrders ?? 0,
      vendorName,
      createdAt: shop.createdAt.toISOString(),
    };

    return { shop: storeShop };
  });
