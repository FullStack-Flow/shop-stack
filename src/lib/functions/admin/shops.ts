import { createServerFn } from "@tanstack/react-start";
import { and, asc, count, desc, eq, ilike, or, type SQL } from "drizzle-orm";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema/auth-schema";
import { shops, vendors } from "@/lib/db/schema/shop-schema";
import {
  getProductCountsForShops,
  type NormalizedShop,
  normalizeShop,
} from "@/lib/helper/shop-helper";
import { adminMiddleware } from "@/lib/middleware/admin";
import {
  type AdminShopsQuery,
  adminShopsQuerySchema,
} from "@/lib/validators/admin/shop-query";

export interface AdminShopListResponse {
  data: NormalizedShop[];
  total: number;
  limit: number;
  offset: number;
}

export type { NormalizedShop };

export const getAdminShops = createServerFn({ method: "GET" })
  .middleware([adminMiddleware])
  .inputValidator(adminShopsQuerySchema)
  .handler(async ({ data }): Promise<AdminShopListResponse> => {
    const {
      limit = 10,
      offset = 0,
      search,
      vendorId,
      status,
      sortBy = "createdAt",
      sortDirection = "desc",
    } = data as AdminShopsQuery;

    // Build filter conditions
    const conditions: SQL[] = [];

    if (vendorId) {
      conditions.push(eq(shops.vendorId, vendorId));
    }

    if (status) {
      conditions.push(eq(shops.status, status));
    }

    if (search) {
      conditions.push(
        or(
          ilike(shops.name, `%${search}%`),
          ilike(shops.slug, `%${search}%`),
          ilike(shops.email, `%${search}%`),
        )!,
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Build order clause
    const orderFn = sortDirection === "desc" ? desc : asc;
    const orderByClause = (() => {
      switch (sortBy) {
        case "name":
          return orderFn(shops.name);
        case "totalProducts":
          return orderFn(shops.totalProducts);
        case "totalOrders":
          return orderFn(shops.totalOrders);
        default:
          return orderFn(shops.createdAt);
      }
    })();

    // Execute parallel queries for count and list
    const [countResult, shopList] = await Promise.all([
      db.select({ count: count() }).from(shops).where(whereClause),
      db
        .select({
          shop: shops,
          vendor: vendors,
          owner: user,
        })
        .from(shops)
        .leftJoin(vendors, eq(shops.vendorId, vendors.id))
        .leftJoin(user, eq(vendors.userId, user.id))
        .where(whereClause)
        .orderBy(orderByClause)
        .limit(limit)
        .offset(offset),
    ]);

    const total = countResult[0]?.count ?? 0;

    if (shopList.length === 0) {
      return {
        data: [],
        total,
        limit,
        offset,
      };
    }

    // Fetch actual product counts for each shop using shared helper
    const shopIds = shopList.map((s) => s.shop.id);
    const productCountMap = await getProductCountsForShops(shopIds);

    // Normalize shops using shared helper
    const normalizedShops: NormalizedShop[] = shopList.map(
      ({ shop, vendor, owner }) =>
        normalizeShop(
          shop,
          vendor,
          owner,
          productCountMap.get(shop.id) ?? shop.totalProducts ?? 0,
        ),
    );

    return {
      data: normalizedShops,
      total,
      limit,
      offset,
    };
  });
