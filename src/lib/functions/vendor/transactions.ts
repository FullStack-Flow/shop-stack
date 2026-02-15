/**
 * Vendor Transaction Server Functions
 *
 * Server functions for vendor transaction/payment management.
 * Provides shop-specific view of financial transactions.
 * Supports admin access to any shop's transactions.
 */

import { createServerFn } from "@tanstack/react-start";
import { and, count, desc, eq, gte, inArray, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema/auth-schema";
import { orders, payments } from "@/lib/db/schema/order-schema";
import { shops } from "@/lib/db/schema/shop-schema";
import { getVendorForUser, isUserAdmin } from "@/lib/helper/vendor";
import { authMiddleware } from "@/lib/middleware/auth";
import type {
  VendorTransactionResponse,
  VendorTransactionStats,
} from "@/types/transaction";

// ============================================================================
// Validators
// ============================================================================

const getVendorTransactionsSchema = z.object({
  limit: z.number().min(1).max(100).optional().default(50),
  offset: z.number().min(0).optional().default(0),
  status: z
    .enum(["pending", "processing", "succeeded", "failed", "refunded"])
    .optional(),
  shopSlug: z.string().optional(), // Shop slug for admin access
});

const getVendorTransactionStatsSchema = z.object({
  shopSlug: z.string().optional(), // Shop slug for admin access
});

// ============================================================================
// Helper: Get Shop IDs for Transaction Query
// ============================================================================

async function getShopIdsForTransactionQuery(
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
    // but return empty for safety (use admin routes for all transactions)
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

// ============================================================================
// Get Vendor Transactions
// ============================================================================

export const getVendorTransactions = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .inputValidator(getVendorTransactionsSchema)
  .handler(
    async ({
      context,
      data,
    }): Promise<{
      transactions: VendorTransactionResponse[];
      total: number;
    }> => {
      const userId = context.session?.user?.id;
      if (!userId) {
        throw new Error("Authentication required");
      }
      const { limit, offset, status, shopSlug } = data;

      // Get shop IDs based on user access
      const shopIds = await getShopIdsForTransactionQuery(userId, shopSlug);

      if (shopIds.length === 0) {
        return { transactions: [], total: 0 };
      }

      // Build conditions
      const conditions: ReturnType<typeof eq>[] = [];
      conditions.push(inArray(orders.shopId, shopIds));

      if (status) {
        conditions.push(eq(payments.status, status));
      }

      const whereClause = and(...conditions);

      // Execute queries in parallel
      const [results, [countResult]] = await Promise.all([
        db
          .select({
            payment: payments,
            order: orders,
            shop: shops,
            customer: user,
          })
          .from(payments)
          .innerJoin(orders, eq(payments.orderId, orders.id))
          .innerJoin(shops, eq(orders.shopId, shops.id))
          .leftJoin(user, eq(orders.userId, user.id))
          .where(whereClause)
          .orderBy(desc(payments.createdAt))
          .limit(limit)
          .offset(offset),
        db
          .select({ count: count() })
          .from(payments)
          .innerJoin(orders, eq(payments.orderId, orders.id))
          .where(whereClause),
      ]);

      const transactions: VendorTransactionResponse[] = results.map((row) => {
        const totalAmount = parseFloat(row.payment.amount);
        const platformFee = row.payment.applicationFeeAmount
          ? parseFloat(row.payment.applicationFeeAmount)
          : 0;
        const vendorAmount = totalAmount - platformFee;

        return {
          id: row.payment.id,
          paymentIntentId: row.payment.stripePaymentIntentId,
          orderId: row.order.id,
          orderNumber: row.order.orderNumber,
          totalAmount,
          vendorAmount,
          platformFee,
          currency: row.payment.currency,
          status: row.payment.status,
          paymentMethod: row.payment.paymentMethod,
          provider: row.payment.provider,
          customer: {
            name: row.customer?.name ?? null,
            email: row.order.guestEmail ?? row.customer?.email ?? "Unknown",
          },
          shop: {
            id: row.shop.id,
            name: row.shop.name,
          },
          createdAt: row.payment.createdAt.toISOString(),
        };
      });

      return {
        transactions,
        total: countResult.count,
      };
    },
  );

// ============================================================================
// Get Vendor Transaction Stats
// ============================================================================

export const getVendorTransactionStats = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .inputValidator(getVendorTransactionStatsSchema)
  .handler(async ({ context, data }): Promise<VendorTransactionStats> => {
    const userId = context.session?.user?.id;
    if (!userId) {
      throw new Error("Authentication required");
    }

    const { shopSlug } = data;

    // Get shop IDs based on user access
    const shopIds = await getShopIdsForTransactionQuery(userId, shopSlug);

    if (shopIds.length === 0) {
      return {
        totalEarnings: 0,
        pendingEarnings: 0,
        platformFeesPaid: 0,
        totalTransactions: 0,
        successfulTransactions: 0,
        pendingTransactions: 0,
        refundedTransactions: 0,
      };
    }

    // Get last 30 days for stats
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Use inArray for filtering by shops
    const shopFilter = inArray(orders.shopId, shopIds);

    const [
      earningsResult,
      platformFeesResult,
      pendingResult,
      transactionCountsResult,
    ] = await Promise.all([
      // Total earnings (successful payments minus platform fees)
      db
        .select({
          total: sql<string>`COALESCE(SUM(${payments.amount}), 0)`,
          fees: sql<string>`COALESCE(SUM(${payments.applicationFeeAmount}), 0)`,
        })
        .from(payments)
        .innerJoin(orders, eq(payments.orderId, orders.id))
        .where(
          and(
            shopFilter,
            eq(payments.status, "succeeded"),
            gte(payments.createdAt, thirtyDaysAgo),
          ),
        ),
      // Platform fees paid
      db
        .select({
          total: sql<string>`COALESCE(SUM(${payments.applicationFeeAmount}), 0)`,
        })
        .from(payments)
        .innerJoin(orders, eq(payments.orderId, orders.id))
        .where(
          and(
            shopFilter,
            eq(payments.status, "succeeded"),
            gte(payments.createdAt, thirtyDaysAgo),
          ),
        ),
      // Pending earnings
      db
        .select({
          total: sql<string>`COALESCE(SUM(${payments.amount}), 0)`,
          fees: sql<string>`COALESCE(SUM(${payments.applicationFeeAmount}), 0)`,
        })
        .from(payments)
        .innerJoin(orders, eq(payments.orderId, orders.id))
        .where(and(shopFilter, eq(payments.status, "pending"))),
      // Transaction counts by status
      db
        .select({
          status: payments.status,
          count: count(),
        })
        .from(payments)
        .innerJoin(orders, eq(payments.orderId, orders.id))
        .where(and(shopFilter, gte(payments.createdAt, thirtyDaysAgo)))
        .groupBy(payments.status),
    ]);

    const totalRevenue = parseFloat(earningsResult[0]?.total || "0");
    const totalFees = parseFloat(earningsResult[0]?.fees || "0");
    const totalEarnings = totalRevenue - totalFees;
    const platformFeesPaid = parseFloat(platformFeesResult[0]?.total || "0");

    const pendingRevenue = parseFloat(pendingResult[0]?.total || "0");
    const pendingFees = parseFloat(pendingResult[0]?.fees || "0");
    const pendingEarnings = pendingRevenue - pendingFees;

    // Process transaction counts
    let totalTransactions = 0;
    let successfulTransactions = 0;
    let pendingTransactions = 0;
    let refundedTransactions = 0;

    for (const row of transactionCountsResult) {
      totalTransactions += row.count;
      if (row.status === "succeeded") successfulTransactions = row.count;
      if (row.status === "pending") pendingTransactions = row.count;
      if (row.status === "refunded") refundedTransactions = row.count;
    }

    return {
      totalEarnings,
      pendingEarnings,
      platformFeesPaid,
      totalTransactions,
      successfulTransactions,
      pendingTransactions,
      refundedTransactions,
    };
  });
