/**
 * Admin Transaction Server Functions
 *
 * Server functions for admin transaction/payment management.
 * Provides platform-wide view of all financial transactions.
 */

import { createServerFn } from "@tanstack/react-start";
import { and, count, desc, eq, gte, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema/auth-schema";
import { orders, payments } from "@/lib/db/schema/order-schema";
import { shops, vendors } from "@/lib/db/schema/shop-schema";
import { adminMiddleware } from "@/lib/middleware/admin";
import type {
  AdminTransactionResponse,
  AdminTransactionStats,
} from "@/types/transaction";

// ============================================================================
// Validators
// ============================================================================

const getAdminTransactionsSchema = z.object({
  limit: z.number().min(1).max(100).optional().default(50),
  offset: z.number().min(0).optional().default(0),
  status: z
    .enum(["pending", "processing", "succeeded", "failed", "refunded"])
    .optional(),
  shopId: z.string().optional(),
  vendorId: z.string().optional(),
});

// ============================================================================
// Get Admin Transactions
// ============================================================================

export const getAdminTransactions = createServerFn({ method: "GET" })
  .middleware([adminMiddleware])
  .inputValidator(getAdminTransactionsSchema)
  .handler(
    async ({
      data,
    }): Promise<{
      transactions: AdminTransactionResponse[];
      total: number;
    }> => {
      const { limit, offset, status, shopId, vendorId } = data;

      // Build conditions
      const conditions = [];
      if (status) {
        conditions.push(eq(payments.status, status));
      }
      if (shopId) {
        conditions.push(eq(orders.shopId, shopId));
      }

      // Build query
      const query = db
        .select({
          payment: payments,
          order: orders,
          shop: shops,
          vendor: vendors,
          customer: user,
        })
        .from(payments)
        .innerJoin(orders, eq(payments.orderId, orders.id))
        .innerJoin(shops, eq(orders.shopId, shops.id))
        .innerJoin(vendors, eq(shops.vendorId, vendors.id))
        .leftJoin(user, eq(orders.userId, user.id))
        .orderBy(desc(payments.createdAt));

      // Apply vendor filter if provided
      if (vendorId) {
        conditions.push(eq(vendors.id, vendorId));
      }

      const whereClause =
        conditions.length > 0 ? and(...conditions) : undefined;

      // Execute queries in parallel
      const [results, [countResult]] = await Promise.all([
        whereClause
          ? query.where(whereClause).limit(limit).offset(offset)
          : query.limit(limit).offset(offset),
        db
          .select({ count: count() })
          .from(payments)
          .innerJoin(orders, eq(payments.orderId, orders.id))
          .innerJoin(shops, eq(orders.shopId, shops.id))
          .innerJoin(vendors, eq(shops.vendorId, vendors.id))
          .where(whereClause),
      ]);

      const transactions: AdminTransactionResponse[] = results.map((row) => {
        const amount = parseFloat(row.payment.amount);
        const applicationFee = row.payment.applicationFeeAmount
          ? parseFloat(row.payment.applicationFeeAmount)
          : null;
        const vendorAmount =
          applicationFee !== null ? amount - applicationFee : null;

        return {
          id: row.payment.id,
          paymentIntentId: row.payment.stripePaymentIntentId,
          orderId: row.order.id,
          orderNumber: row.order.orderNumber,
          amount,
          currency: row.payment.currency,
          status: row.payment.status,
          paymentMethod: row.payment.paymentMethod,
          provider: row.payment.provider,
          connectedAccountId: row.payment.connectedAccountId,
          applicationFeeAmount: applicationFee,
          vendorAmount,
          customer: {
            id: row.customer?.id ?? null,
            name: row.customer?.name ?? null,
            email: row.order.guestEmail ?? row.customer?.email ?? "Unknown",
          },
          shop: {
            id: row.shop.id,
            name: row.shop.name,
            slug: row.shop.slug,
          },
          vendor: {
            id: row.vendor.id,
            businessName: row.vendor.businessName,
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
// Get Admin Transaction Stats
// ============================================================================

export const getAdminTransactionStats = createServerFn({ method: "GET" })
  .middleware([adminMiddleware])
  .handler(async (): Promise<AdminTransactionStats> => {
    // Get last 30 days for stats
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      revenueResult,
      platformFeesResult,
      transactionCountsResult,
      pendingResult,
    ] = await Promise.all([
      // Total revenue (successful payments)
      db
        .select({
          total: sql<string>`COALESCE(SUM(${payments.amount}), 0)`,
        })
        .from(payments)
        .where(
          and(
            eq(payments.status, "succeeded"),
            gte(payments.createdAt, thirtyDaysAgo),
          ),
        ),
      // Platform fees
      db
        .select({
          total: sql<string>`COALESCE(SUM(${payments.applicationFeeAmount}), 0)`,
        })
        .from(payments)
        .where(
          and(
            eq(payments.status, "succeeded"),
            gte(payments.createdAt, thirtyDaysAgo),
          ),
        ),
      // Transaction counts by status
      db
        .select({
          status: payments.status,
          count: count(),
        })
        .from(payments)
        .where(gte(payments.createdAt, thirtyDaysAgo))
        .groupBy(payments.status),
      // Pending payments amount
      db
        .select({
          total: sql<string>`COALESCE(SUM(${payments.amount}), 0)`,
        })
        .from(payments)
        .where(eq(payments.status, "pending")),
    ]);

    const totalRevenue = parseFloat(revenueResult[0]?.total || "0");
    const platformFees = parseFloat(platformFeesResult[0]?.total || "0");
    const vendorPayouts = totalRevenue - platformFees;
    const pendingPayments = parseFloat(pendingResult[0]?.total || "0");

    // Process transaction counts
    let totalTransactions = 0;
    let successfulTransactions = 0;
    let failedTransactions = 0;
    let refundedTransactions = 0;

    for (const row of transactionCountsResult) {
      totalTransactions += row.count;
      if (row.status === "succeeded") successfulTransactions = row.count;
      if (row.status === "failed") failedTransactions = row.count;
      if (row.status === "refunded") refundedTransactions = row.count;
    }

    return {
      totalRevenue,
      platformFees,
      vendorPayouts,
      pendingPayments,
      totalTransactions,
      successfulTransactions,
      failedTransactions,
      refundedTransactions,
    };
  });
