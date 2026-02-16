import { createServerFn } from "@tanstack/react-start";
import {
  and,
  asc,
  count,
  desc,
  eq,
  ilike,
  or,
  sql,
  type SQL,
} from "drizzle-orm";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema/auth-schema";
import { orders } from "@/lib/db/schema/order-schema";
import { products } from "@/lib/db/schema/products-schema";
import { shops, vendors } from "@/lib/db/schema/shop-schema";
import {
  getProductCountsForShops,
  type NormalizedShop,
  normalizeShop,
} from "@/lib/helper/shop-helper";
import { adminMiddleware } from "@/lib/middleware/admin";
import { isStripeConfigured } from "@/lib/stripe";
import { getAccountStatus } from "@/lib/stripe/connect";
import {
  type AdminShopsQuery,
  adminShopsQuerySchema,
  deleteShopByIdSchema,
  getShopByIdSchema,
  updateShopStatusSchema,
  updateVendorCommissionSchema,
} from "@/lib/validators/admin/shop-query";
import type { AdminShopListResponse } from "@/types/shop";

const getProductCountForShop = async (shopId: string) => {
  const [result] = await db
    .select({ count: count() })
    .from(products)
    .where(eq(products.shopId, shopId));

  return result?.count ?? 0;
};

const requireShopExists = async (shopId: string) => {
  const [shop] = await db
    .select({ id: shops.id })
    .from(shops)
    .where(eq(shops.id, shopId))
    .limit(1);

  if (!shop) {
    throw new Error("Shop not found.");
  }

  return shop;
};

const requireVendorExists = async (vendorId: string) => {
  const [vendor] = await db
    .select({ id: vendors.id })
    .from(vendors)
    .where(eq(vendors.id, vendorId))
    .limit(1);

  if (!vendor) {
    throw new Error("Vendor not found.");
  }

  return vendor;
};

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

// ============================================================================
// Get Shop by ID (Admin)
// ============================================================================

/**
 * Get a single shop by ID (admin can view any shop)
 */
export const getAdminShopById = createServerFn({ method: "GET" })
  .middleware([adminMiddleware])
  .inputValidator(getShopByIdSchema)
  .handler(async ({ data }) => {
    const { id } = data;

    const result = await db
      .select({
        shop: shops,
        vendor: vendors,
        owner: user,
      })
      .from(shops)
      .leftJoin(vendors, eq(shops.vendorId, vendors.id))
      .leftJoin(user, eq(vendors.userId, user.id))
      .where(eq(shops.id, id))
      .limit(1);

    if (result.length === 0) {
      throw new Error("Shop not found.");
    }

    const { shop, vendor, owner } = result[0];

    const productCount = await getProductCountForShop(shop.id);
    const [orderStats] = await db
      .select({
        totalOrders: sql<number>`count(${orders.id})`,
        paidRevenue: sql<string>`coalesce(sum(case when ${orders.paymentStatus} = 'paid' then ${orders.totalAmount} else 0 end), 0)`,
        customerCount: sql<number>`count(distinct case when ${orders.paymentStatus} = 'paid' then coalesce(${orders.userId}, ${orders.guestEmail}) end)`,
      })
      .from(orders)
      .where(eq(orders.shopId, shop.id));

    let resolvedVendor = vendor;
    if (vendor?.stripeConnectedAccountId && isStripeConfigured()) {
      try {
        const status = await getAccountStatus(vendor.stripeConnectedAccountId);
        if (status) {
          await db
            .update(vendors)
            .set({
              stripeOnboardingComplete: status.detailsSubmitted,
              stripeChargesEnabled: status.chargesEnabled,
              stripePayoutsEnabled: status.payoutsEnabled,
            })
            .where(eq(vendors.id, vendor.id));
          resolvedVendor = {
            ...vendor,
            stripeOnboardingComplete: status.detailsSubmitted,
            stripeChargesEnabled: status.chargesEnabled,
            stripePayoutsEnabled: status.payoutsEnabled,
          };
        }
      } catch {
        resolvedVendor = vendor;
      }
    }

    const normalizedShop = normalizeShop(
      shop,
      resolvedVendor,
      owner,
      productCount,
    );
    const totalOrders = Number(orderStats?.totalOrders ?? 0);
    const customerCount = Number(orderStats?.customerCount ?? 0);
    const monthlyRevenue = orderStats?.paidRevenue ?? "0";

    return {
      shop: {
        ...normalizedShop,
        totalOrders,
        customerCount,
        monthlyRevenue,
      },
    };
  });

// ============================================================================
// Update Shop Status (Admin)
// ============================================================================

/**
 * Update shop status (activate, suspend, etc.)
 */
export const updateAdminShopStatus = createServerFn({ method: "POST" })
  .middleware([adminMiddleware])
  .inputValidator(updateShopStatusSchema)
  .handler(async ({ data }) => {
    const { id, status } = data;

    // Check if shop exists using shared helper
    await requireShopExists(id);

    // Update status
    await db.update(shops).set({ status }).where(eq(shops.id, id));

    return {
      success: true,
      message: `Shop status updated to ${status}`,
    };
  });

// ============================================================================
// Delete Shop (Admin)
// ============================================================================

/**
 * Delete a shop (admin action)
 */
export const deleteAdminShop = createServerFn({ method: "POST" })
  .middleware([adminMiddleware])
  .inputValidator(deleteShopByIdSchema)
  .handler(async ({ data }) => {
    const { id } = data;

    // Check if shop exists using shared helper
    await requireShopExists(id);

    // Delete shop (cascade will handle related records)
    await db.delete(shops).where(eq(shops.id, id));

    return {
      success: true,
      message: "Shop deleted successfully",
    };
  });

// ============================================================================
// Update Vendor Commission (Admin)
// ============================================================================

/**
 * Update vendor commission rate (admin action)
 */
export const updateVendorCommission = createServerFn({ method: "POST" })
  .middleware([adminMiddleware])
  .inputValidator(updateVendorCommissionSchema)
  .handler(async ({ data }) => {
    const { vendorId, commissionRate } = data;

    // Check if vendor exists using shared helper
    await requireVendorExists(vendorId);

    // Update commission rate
    await db
      .update(vendors)
      .set({ commissionRate })
      .where(eq(vendors.id, vendorId));

    return {
      success: true,
      message: `Commission rate updated to ${commissionRate}%`,
      commissionRate,
    };
  });
