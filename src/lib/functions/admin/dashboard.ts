/**
 * Admin Dashboard Server Functions
 *
 * Server functions for the admin dashboard analytics.
 * Provides comprehensive platform-wide metrics and insights.
 */

import { createServerFn } from "@tanstack/react-start";
import { and, count, desc, eq, gte, lt, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema/auth-schema";
import { orderItems, orders, payments } from "@/lib/db/schema/order-schema";
import { products } from "@/lib/db/schema/products-schema";
import { productReviews } from "@/lib/db/schema/review-schema";
import { shops, vendors } from "@/lib/db/schema/shop-schema";
import { adminMiddleware } from "@/lib/middleware/admin";
import {
  getDaysAgo,
  getStartOfDay,
  getStartOfLastMonth,
  getStartOfMonth,
  getStartOfWeek,
} from "@/lib/utils/dashboard";
import type {
  DashboardStats,
  LowStockProduct,
  OrderDistribution,
  PendingReview,
  RecentOrder,
  RevenueChartData,
  TopProduct,
  TopShop,
} from "@/types/admin-dashboard";

// ============================================================================
// Get Dashboard Stats
// ============================================================================

export const getDashboardStats = createServerFn({ method: "GET" })
  .middleware([adminMiddleware])
  .handler(async (): Promise<DashboardStats> => {
    const now = new Date();
    const startOfToday = getStartOfDay(now);
    const startOfWeek = getStartOfWeek(now);
    const startOfMonth = getStartOfMonth(now);
    const startOfLastMonth = getStartOfLastMonth(now);

    // Execute all queries in parallel for performance
    const [
      userCountResult,
      vendorCountResult,
      shopCountResult,
      productCountResult,
      orderCountResult,
      reviewCountResult,
      revenueResults,
      ordersByStatus,
      lastMonthStats,
      platformFeesResult,
      activeShopsResult,
      connectedVendorsResult,
      todayOrdersResult,
      newUsersTodayResult,
    ] = await Promise.all([
      // Total counts
      db.select({ count: count() }).from(user),
      db.select({ count: count() }).from(vendors),
      db.select({ count: count() }).from(shops),
      db
        .select({ count: count() })
        .from(products)
        .where(eq(products.isActive, true)),
      db.select({ count: count() }).from(orders),
      db.select({ count: count() }).from(productReviews),

      // Revenue metrics
      db
        .select({
          totalRevenue: sql<string>`COALESCE(SUM(CASE WHEN ${orders.paymentStatus} = 'paid' THEN ${orders.totalAmount} ELSE 0 END), 0)`,
          todayRevenue: sql<string>`COALESCE(SUM(CASE WHEN ${orders.paymentStatus} = 'paid' AND ${orders.createdAt} >= ${startOfToday} THEN ${orders.totalAmount} ELSE 0 END), 0)`,
          weekRevenue: sql<string>`COALESCE(SUM(CASE WHEN ${orders.paymentStatus} = 'paid' AND ${orders.createdAt} >= ${startOfWeek} THEN ${orders.totalAmount} ELSE 0 END), 0)`,
          monthRevenue: sql<string>`COALESCE(SUM(CASE WHEN ${orders.paymentStatus} = 'paid' AND ${orders.createdAt} >= ${startOfMonth} THEN ${orders.totalAmount} ELSE 0 END), 0)`,
        })
        .from(orders),

      // Orders by status
      db
        .select({
          status: orders.status,
          count: count(),
        })
        .from(orders)
        .groupBy(orders.status),

      // Last month stats for comparison
      db
        .select({
          revenue: sql<string>`COALESCE(SUM(CASE WHEN ${orders.paymentStatus} = 'paid' THEN ${orders.totalAmount} ELSE 0 END), 0)`,
          orderCount: count(),
        })
        .from(orders)
        .where(
          and(
            gte(orders.createdAt, startOfLastMonth),
            lt(orders.createdAt, startOfMonth),
          ),
        ),

      // Platform fees (from payments with application fees)
      db
        .select({
          total: sql<string>`COALESCE(SUM(${payments.applicationFeeAmount}), 0)`,
        })
        .from(payments)
        .where(eq(payments.status, "succeeded")),

      // Active shops
      db
        .select({ count: count() })
        .from(shops)
        .where(eq(shops.status, "active")),

      // Connected vendors (Stripe)
      db
        .select({ count: count() })
        .from(vendors)
        .where(eq(vendors.stripeChargesEnabled, true)),

      // Today's orders
      db
        .select({ count: count() })
        .from(orders)
        .where(gte(orders.createdAt, startOfToday)),

      // New users today
      db
        .select({ count: count() })
        .from(user)
        .where(gte(user.createdAt, startOfToday)),
    ]);

    // Process order status counts
    const statusCounts = {
      pending: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
    };

    for (const row of ordersByStatus) {
      if (row.status === "pending" || row.status === "confirmed") {
        statusCounts.pending += row.count;
      } else if (row.status === "processing") {
        statusCounts.processing = row.count;
      } else if (row.status === "shipped") {
        statusCounts.shipped = row.count;
      } else if (row.status === "delivered") {
        statusCounts.delivered = row.count;
      } else if (row.status === "cancelled" || row.status === "refunded") {
        statusCounts.cancelled += row.count;
      }
    }

    // Calculate growth percentages
    const currentMonthRevenue = parseFloat(
      revenueResults[0]?.monthRevenue || "0",
    );
    const lastMonthRevenue = parseFloat(lastMonthStats[0]?.revenue || "0");
    const revenueGrowth =
      lastMonthRevenue > 0
        ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
        : 0;

    const currentMonthOrders = orderCountResult[0]?.count || 0;
    const lastMonthOrders = lastMonthStats[0]?.orderCount || 0;
    const ordersGrowth =
      lastMonthOrders > 0
        ? ((currentMonthOrders - lastMonthOrders) / lastMonthOrders) * 100
        : 0;

    // Approximate users growth (simplified)
    const usersGrowth = 0; // Would need historical data

    return {
      totalUsers: userCountResult[0]?.count || 0,
      totalVendors: vendorCountResult[0]?.count || 0,
      totalShops: shopCountResult[0]?.count || 0,
      totalProducts: productCountResult[0]?.count || 0,
      totalOrders: orderCountResult[0]?.count || 0,
      totalReviews: reviewCountResult[0]?.count || 0,

      totalRevenue: parseFloat(revenueResults[0]?.totalRevenue || "0"),
      todayRevenue: parseFloat(revenueResults[0]?.todayRevenue || "0"),
      weekRevenue: parseFloat(revenueResults[0]?.weekRevenue || "0"),
      monthRevenue: parseFloat(revenueResults[0]?.monthRevenue || "0"),

      pendingOrders: statusCounts.pending,
      processingOrders: statusCounts.processing,
      shippedOrders: statusCounts.shipped,
      deliveredOrders: statusCounts.delivered,
      cancelledOrders: statusCounts.cancelled,

      revenueGrowth,
      ordersGrowth,
      usersGrowth,

      activeShops: activeShopsResult[0]?.count || 0,
      connectedVendors: connectedVendorsResult[0]?.count || 0,
      platformFees: parseFloat(platformFeesResult[0]?.total || "0"),

      todayOrders: todayOrdersResult[0]?.count || 0,
      newUsersToday: newUsersTodayResult[0]?.count || 0,
    };
  });

// ============================================================================
// Get Revenue Chart Data (Last 30 Days)
// ============================================================================

const chartDataSchema = z.object({
  days: z.number().min(7).max(90).optional().default(30),
});

export const getRevenueChartData = createServerFn({ method: "GET" })
  .middleware([adminMiddleware])
  .inputValidator(chartDataSchema)
  .handler(async ({ data }): Promise<RevenueChartData[]> => {
    const { days } = data;
    const startDate = getDaysAgo(days);

    const result = await db
      .select({
        date: sql<string>`DATE(${orders.createdAt})`,
        revenue: sql<string>`COALESCE(SUM(CASE WHEN ${orders.paymentStatus} = 'paid' THEN ${orders.totalAmount} ELSE 0 END), 0)`,
        orders: count(),
      })
      .from(orders)
      .where(gte(orders.createdAt, startDate))
      .groupBy(sql`DATE(${orders.createdAt})`)
      .orderBy(sql`DATE(${orders.createdAt})`);

    // Fill in missing dates with zero values
    const chartData: RevenueChartData[] = [];
    const dateMap = new Map(
      result.map((r) => [
        r.date,
        { revenue: parseFloat(r.revenue), orders: r.orders },
      ]),
    );

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      const dayData = dateMap.get(dateStr);

      chartData.push({
        date: dateStr,
        revenue: dayData?.revenue || 0,
        orders: dayData?.orders || 0,
      });
    }

    return chartData;
  });

// ============================================================================
// Get Order Status Distribution
// ============================================================================

export const getOrderDistribution = createServerFn({ method: "GET" })
  .middleware([adminMiddleware])
  .handler(async (): Promise<OrderDistribution[]> => {
    const result = await db
      .select({
        status: orders.status,
        count: count(),
      })
      .from(orders)
      .groupBy(orders.status);

    const total = result.reduce((sum, r) => sum + r.count, 0);

    return result.map((r) => ({
      status: r.status,
      count: r.count,
      percentage: total > 0 ? (r.count / total) * 100 : 0,
    }));
  });

// ============================================================================
// Get Top Shops by Revenue
// ============================================================================

export const getTopShops = createServerFn({ method: "GET" })
  .middleware([adminMiddleware])
  .handler(async (): Promise<TopShop[]> => {
    const result = await db
      .select({
        shopId: shops.id,
        shopName: shops.name,
        shopSlug: shops.slug,
        shopLogo: shops.logo,
        revenue: sql<string>`COALESCE(SUM(CASE WHEN ${orders.paymentStatus} = 'paid' THEN ${orders.totalAmount} ELSE 0 END), 0)`,
        orderCount: count(orders.id),
      })
      .from(shops)
      .leftJoin(orders, eq(orders.shopId, shops.id))
      .groupBy(shops.id, shops.name, shops.slug, shops.logo)
      .orderBy(
        desc(
          sql`SUM(CASE WHEN ${orders.paymentStatus} = 'paid' THEN ${orders.totalAmount} ELSE 0 END)`,
        ),
      )
      .limit(5);

    // Get product counts for each shop
    const shopIds = result.map((r) => r.shopId);
    const productCounts = await db
      .select({
        shopId: products.shopId,
        count: count(),
      })
      .from(products)
      .where(
        and(
          eq(products.isActive, true),
          shopIds.length > 0
            ? sql`${products.shopId} IN (${sql.join(
                shopIds.map((id) => sql`${id}`),
                sql`, `,
              )})`
            : sql`1=0`,
        ),
      )
      .groupBy(products.shopId);

    const productCountMap = new Map(
      productCounts.map((p) => [p.shopId, p.count]),
    );

    return result.map((r) => ({
      id: r.shopId,
      name: r.shopName,
      slug: r.shopSlug,
      logo: r.shopLogo,
      revenue: parseFloat(r.revenue),
      orderCount: r.orderCount,
      productCount: productCountMap.get(r.shopId) || 0,
    }));
  });

// ============================================================================
// Get Top Selling Products
// ============================================================================

export const getTopProducts = createServerFn({ method: "GET" })
  .middleware([adminMiddleware])
  .handler(async (): Promise<TopProduct[]> => {
    const result = await db
      .select({
        productId: orderItems.productId,
        productName: orderItems.productName,
        productImage: orderItems.productImage,
        shopName: shops.name,
        totalSold: sql<number>`CAST(SUM(${orderItems.quantity}) AS INTEGER)`,
        revenue: sql<string>`COALESCE(SUM(${orderItems.totalPrice}), 0)`,
      })
      .from(orderItems)
      .innerJoin(orders, eq(orders.id, orderItems.orderId))
      .innerJoin(shops, eq(shops.id, orders.shopId))
      .where(eq(orders.paymentStatus, "paid"))
      .groupBy(
        orderItems.productId,
        orderItems.productName,
        orderItems.productImage,
        shops.name,
      )
      .orderBy(desc(sql`SUM(${orderItems.quantity})`))
      .limit(10);

    return result.map((r) => ({
      id: r.productId,
      name: r.productName,
      shopName: r.shopName,
      totalSold: r.totalSold,
      revenue: parseFloat(r.revenue),
      image: r.productImage,
    }));
  });

// ============================================================================
// Get Low Stock Products
// ============================================================================

export const getLowStockProducts = createServerFn({ method: "GET" })
  .middleware([adminMiddleware])
  .handler(async (): Promise<LowStockProduct[]> => {
    const result = await db
      .select({
        productId: products.id,
        productName: products.name,
        productSku: products.sku,
        stock: products.stock,
        threshold: products.lowStockThreshold,
        shopName: shops.name,
        shopSlug: shops.slug,
      })
      .from(products)
      .innerJoin(shops, eq(shops.id, products.shopId))
      .where(
        and(
          eq(products.isActive, true),
          eq(products.trackInventory, true),
          sql`${products.stock} <= ${products.lowStockThreshold}`,
        ),
      )
      .orderBy(products.stock)
      .limit(10);

    return result.map((r) => ({
      id: r.productId,
      name: r.productName,
      sku: r.productSku,
      stock: r.stock || 0,
      threshold: r.threshold || 5,
      shopName: r.shopName,
      shopSlug: r.shopSlug,
    }));
  });

// ============================================================================
// Get Recent Orders
// ============================================================================

export const getRecentOrders = createServerFn({ method: "GET" })
  .middleware([adminMiddleware])
  .handler(async (): Promise<RecentOrder[]> => {
    const result = await db.query.orders.findMany({
      with: {
        shop: {
          columns: { name: true },
        },
        user: {
          columns: { name: true, email: true },
        },
      },
      orderBy: [desc(orders.createdAt)],
      limit: 10,
    });

    return result.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      customerName: order.user?.name || null,
      customerEmail: order.user?.email || order.guestEmail || "Unknown",
      shopName: order.shop?.name || "Unknown",
      status: order.status,
      paymentStatus: order.paymentStatus,
      totalAmount: parseFloat(order.totalAmount),
      createdAt: order.createdAt.toISOString(),
    }));
  });

// ============================================================================
// Get Pending Reviews
// ============================================================================

export const getPendingReviews = createServerFn({ method: "GET" })
  .middleware([adminMiddleware])
  .handler(async (): Promise<PendingReview[]> => {
    const result = await db.query.productReviews.findMany({
      where: eq(productReviews.status, "pending"),
      with: {
        product: {
          columns: { name: true },
        },
        user: {
          columns: { name: true },
        },
      },
      orderBy: [desc(productReviews.createdAt)],
      limit: 10,
    });

    return result.map((review) => ({
      id: review.id,
      productName: review.product?.name || "Unknown Product",
      customerName: review.user?.name || "Unknown",
      rating: review.rating,
      title: review.title,
      createdAt: review.createdAt.toISOString(),
    }));
  });

// ============================================================================
// Get Customer Growth Data (Last 30 Days)
// ============================================================================

export const getCustomerGrowthData = createServerFn({ method: "GET" })
  .middleware([adminMiddleware])
  .inputValidator(chartDataSchema)
  .handler(async ({ data }) => {
    const { days } = data;
    const startDate = getDaysAgo(days);

    const result = await db
      .select({
        date: sql<string>`DATE(${user.createdAt})`,
        count: count(),
      })
      .from(user)
      .where(gte(user.createdAt, startDate))
      .groupBy(sql`DATE(${user.createdAt})`)
      .orderBy(sql`DATE(${user.createdAt})`);

    // Fill in missing dates
    const chartData: {
      date: string;
      newUsers: number;
      cumulativeUsers: number;
    }[] = [];
    const dateMap = new Map(result.map((r) => [r.date, r.count]));

    let cumulative = 0;
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      const newUsers = dateMap.get(dateStr) || 0;
      cumulative += newUsers;

      chartData.push({
        date: dateStr,
        newUsers,
        cumulativeUsers: cumulative,
      });
    }

    return chartData;
  });

// ============================================================================
// Get Platform Health Status
// ============================================================================

export const getPlatformHealth = createServerFn({ method: "GET" })
  .middleware([adminMiddleware])
  .handler(async () => {
    const [vendorStats, shopStats] = await Promise.all([
      db
        .select({
          total: count(),
          stripeConnected: sql<number>`SUM(CASE WHEN ${vendors.stripeChargesEnabled} = true THEN 1 ELSE 0 END)`,
          pendingOnboarding: sql<number>`SUM(CASE WHEN ${vendors.stripeOnboardingComplete} = false THEN 1 ELSE 0 END)`,
          active: sql<number>`SUM(CASE WHEN ${vendors.status} = 'active' THEN 1 ELSE 0 END)`,
          pendingApproval: sql<number>`SUM(CASE WHEN ${vendors.status} = 'pending_approval' THEN 1 ELSE 0 END)`,
        })
        .from(vendors),

      db
        .select({
          total: count(),
          active: sql<number>`SUM(CASE WHEN ${shops.status} = 'active' THEN 1 ELSE 0 END)`,
          pending: sql<number>`SUM(CASE WHEN ${shops.status} = 'pending' THEN 1 ELSE 0 END)`,
          suspended: sql<number>`SUM(CASE WHEN ${shops.status} = 'suspended' THEN 1 ELSE 0 END)`,
        })
        .from(shops),
    ]);

    return {
      vendors: {
        total: vendorStats[0]?.total || 0,
        stripeConnected: Number(vendorStats[0]?.stripeConnected) || 0,
        pendingOnboarding: Number(vendorStats[0]?.pendingOnboarding) || 0,
        active: Number(vendorStats[0]?.active) || 0,
        pendingApproval: Number(vendorStats[0]?.pendingApproval) || 0,
      },
      shops: {
        total: shopStats[0]?.total || 0,
        active: Number(shopStats[0]?.active) || 0,
        pending: Number(shopStats[0]?.pending) || 0,
        suspended: Number(shopStats[0]?.suspended) || 0,
      },
    };
  });
