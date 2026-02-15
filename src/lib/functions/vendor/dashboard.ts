/**
 * Shop Dashboard Server Functions
 *
 * Aggregated analytics endpoint for the vendor shop dashboard.
 * Fetches all dashboard data in a single call to minimize round-trips.
 */

import { createServerFn } from "@tanstack/react-start";
import { and, count, desc, eq, gte, inArray, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema/auth-schema";
import { orderItems, orders } from "@/lib/db/schema/order-schema";
import { productImages, products } from "@/lib/db/schema/products-schema";
import { getShopIdsForOrderQuery } from "@/lib/helper/order-helpers";
import { requireShopAccess } from "@/lib/helper/vendor";
import { authMiddleware } from "@/lib/middleware/auth";
import type {
  DashboardMonthlySales,
  DashboardRecentOrder,
  DashboardTopProduct,
  ShopDashboardData,
} from "@/types/shop-dashboard";

// ============================================================================
// Validators
// ============================================================================

const getShopDashboardSchema = z.object({
  shopId: z.string(),
  shopSlug: z.string(),
});

// ============================================================================
// Types
// ============================================================================

// ============================================================================
// Get Shop Dashboard Data
// ============================================================================

export const getShopDashboardData = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .inputValidator(getShopDashboardSchema)
  .handler(async ({ context, data }): Promise<ShopDashboardData> => {
    const userId = context.session?.user?.id;
    if (!userId) {
      throw new Error("Authentication required");
    }

    const { shopId, shopSlug } = data;

    // Verify shop access
    await requireShopAccess(userId, shopId);

    // Get shop IDs for order queries
    const shopIds = await getShopIdsForOrderQuery(userId, shopSlug);

    if (shopIds.length === 0) {
      return {
        stats: {
          monthlyRevenue: 0,
          previousMonthRevenue: 0,
          totalProducts: 0,
          newProductsThisMonth: 0,
          totalOrders: 0,
          previousMonthOrders: 0,
          conversionRate: 0,
          previousConversionRate: 0,
        },
        recentOrders: [],
        topProducts: [],
        monthlySales: [],
      };
    }

    // Date boundaries
    const now = new Date();
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfPreviousMonth = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      1,
    );
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    // Execute all queries in parallel for optimal performance
    const [
      currentMonthRevenueResult,
      previousMonthRevenueResult,
      totalProductsResult,
      newProductsResult,
      currentMonthOrdersResult,
      previousMonthOrdersResult,
      recentOrdersResult,
      topProductsResult,
      monthlySalesResult,
    ] = await Promise.all([
      // 1. Current month revenue (from delivered orders)
      db
        .select({
          revenue: sql<string>`COALESCE(SUM(${orders.totalAmount}), 0)`,
        })
        .from(orders)
        .where(
          and(
            inArray(orders.shopId, shopIds),
            gte(orders.createdAt, startOfCurrentMonth),
            eq(orders.status, "delivered"),
          ),
        ),

      // 2. Previous month revenue
      db
        .select({
          revenue: sql<string>`COALESCE(SUM(${orders.totalAmount}), 0)`,
        })
        .from(orders)
        .where(
          and(
            inArray(orders.shopId, shopIds),
            gte(orders.createdAt, startOfPreviousMonth),
            sql`${orders.createdAt} < ${startOfCurrentMonth}`,
            eq(orders.status, "delivered"),
          ),
        ),

      // 3. Total products count
      db
        .select({ count: count() })
        .from(products)
        .where(eq(products.shopId, shopId)),

      // 4. New products this month
      db
        .select({ count: count() })
        .from(products)
        .where(
          and(
            eq(products.shopId, shopId),
            gte(products.createdAt, startOfCurrentMonth),
          ),
        ),

      // 5. Current month orders count
      db
        .select({ count: count() })
        .from(orders)
        .where(
          and(
            inArray(orders.shopId, shopIds),
            gte(orders.createdAt, startOfCurrentMonth),
          ),
        ),

      // 6. Previous month orders count
      db
        .select({ count: count() })
        .from(orders)
        .where(
          and(
            inArray(orders.shopId, shopIds),
            gte(orders.createdAt, startOfPreviousMonth),
            sql`${orders.createdAt} < ${startOfCurrentMonth}`,
          ),
        ),

      // 7. Recent orders (last 5)
      db
        .select({
          id: orders.id,
          orderNumber: orders.orderNumber,
          totalAmount: orders.totalAmount,
          status: orders.status,
          createdAt: orders.createdAt,
          customerName: user.name,
          customerEmail: user.email,
          guestEmail: orders.guestEmail,
        })
        .from(orders)
        .leftJoin(user, eq(orders.userId, user.id))
        .where(inArray(orders.shopId, shopIds))
        .orderBy(desc(orders.createdAt))
        .limit(5),

      // 8. Top selling products (by quantity sold)
      db
        .select({
          id: products.id,
          name: products.name,
          totalSold: sql<number>`COALESCE(SUM(${orderItems.quantity}), 0)`,
          revenue: sql<string>`COALESCE(SUM(${orderItems.totalPrice}), 0)`,
        })
        .from(orderItems)
        .innerJoin(orders, eq(orderItems.orderId, orders.id))
        .innerJoin(products, eq(orderItems.productId, products.id))
        .where(inArray(orders.shopId, shopIds))
        .groupBy(products.id, products.name)
        .orderBy(sql`SUM(${orderItems.quantity}) DESC`)
        .limit(5),

      // 9. Monthly sales (last 6 months)
      db
        .select({
          month: sql<string>`TO_CHAR(${orders.createdAt}, 'YYYY-MM')`,
          revenue: sql<string>`COALESCE(SUM(${orders.totalAmount}), 0)`,
          orders: count(),
        })
        .from(orders)
        .where(
          and(
            inArray(orders.shopId, shopIds),
            gte(orders.createdAt, sixMonthsAgo),
          ),
        )
        .groupBy(sql`TO_CHAR(${orders.createdAt}, 'YYYY-MM')`)
        .orderBy(sql`TO_CHAR(${orders.createdAt}, 'YYYY-MM') ASC`),
    ]);

    // Process stats
    const monthlyRevenue = parseFloat(
      currentMonthRevenueResult[0]?.revenue || "0",
    );
    const previousMonthRevenue = parseFloat(
      previousMonthRevenueResult[0]?.revenue || "0",
    );
    const totalProducts = totalProductsResult[0]?.count || 0;
    const newProductsThisMonth = newProductsResult[0]?.count || 0;
    const totalOrders = currentMonthOrdersResult[0]?.count || 0;
    const previousMonthOrders = previousMonthOrdersResult[0]?.count || 0;

    // Calculate conversion rate (orders / products as a simple metric)
    // In a real app, this would be based on views/visits
    const conversionRate =
      totalProducts > 0
        ? Math.round((totalOrders / totalProducts) * 100 * 10) / 10
        : 0;
    const previousConversionRate =
      totalProducts > 0
        ? Math.round((previousMonthOrders / totalProducts) * 100 * 10) / 10
        : 0;

    // Process recent orders
    const recentOrders: DashboardRecentOrder[] = recentOrdersResult.map(
      (order) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        customerName: order.customerName || "Guest",
        customerEmail: order.guestEmail || order.customerEmail || "N/A",
        totalAmount: parseFloat(order.totalAmount),
        status: order.status,
        createdAt: order.createdAt.toISOString(),
      }),
    );

    // Process top products (fetch images separately to avoid complex joins)
    const topProductIds = topProductsResult.map((p) => p.id);
    const productImagesMap = new Map<string, string | null>();

    if (topProductIds.length > 0) {
      const images = await db
        .select({
          productId: productImages.productId,
          url: productImages.url,
        })
        .from(productImages)
        .where(
          and(
            inArray(productImages.productId, topProductIds),
            eq(productImages.isPrimary, true),
          ),
        );

      for (const img of images) {
        productImagesMap.set(img.productId, img.url);
      }
    }

    const topProducts: DashboardTopProduct[] = topProductsResult.map(
      (product) => ({
        id: product.id,
        name: product.name,
        image: productImagesMap.get(product.id) || null,
        totalSold: Number(product.totalSold),
        revenue: parseFloat(product.revenue),
      }),
    );

    // Process monthly sales — fill in missing months
    const monthlyMap = new Map<string, { revenue: number; orders: number }>();
    for (const row of monthlySalesResult) {
      monthlyMap.set(row.month, {
        revenue: parseFloat(row.revenue),
        orders: row.orders,
      });
    }

    const monthlySales: DashboardMonthlySales[] = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      const data = monthlyMap.get(key) || { revenue: 0, orders: 0 };
      monthlySales.push({
        month: date.toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        }),
        ...data,
      });
    }

    return {
      stats: {
        monthlyRevenue,
        previousMonthRevenue,
        totalProducts,
        newProductsThisMonth,
        totalOrders,
        previousMonthOrders,
        conversionRate,
        previousConversionRate,
      },
      recentOrders,
      topProducts,
      monthlySales,
    };
  });
