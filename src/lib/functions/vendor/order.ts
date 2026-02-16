/**
 * Order Server Functions (Vendor)
 *
 * Server functions for vendor order management.
 * Allows vendors to view and manage their shop orders.
 * Supports admin access to any shop's orders.
 */

import { createServerFn } from "@tanstack/react-start";
import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema/order-schema";
import {
  getShopIdsForOrderQuery,
  verifyShopAccess,
} from "@/lib/helper/order-helpers";
import { authMiddleware } from "@/lib/middleware/auth";
import {
  getOrderByIdSchema,
  getOrdersSchema,
  updateOrderStatusSchema,
} from "@/lib/validators/order";

export const getVendorOrders = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .inputValidator(getOrdersSchema)
  .handler(async ({ context, data }) => {
    const userId = context.session?.user?.id;
    const { limit, offset, status, shopSlug } = data;

    if (!userId) {
      throw new Error("Unauthorized");
    }

    // Get shop IDs based on user access
    const shopIds = await getShopIdsForOrderQuery(userId, shopSlug);

    if (shopIds.length === 0) {
      return { orders: [], total: 0 };
    }

    // Build conditions
    const conditions = [];
    conditions.push(inArray(orders.shopId, shopIds));

    if (status) {
      conditions.push(eq(orders.status, status));
    }

    // Get orders
    const vendorOrders = await db.query.orders.findMany({
      where: and(...conditions),
      with: {
        items: true,
        shop: {
          columns: { id: true, name: true },
        },
        user: {
          columns: { id: true, name: true, email: true },
        },
      },
      orderBy: [desc(orders.createdAt)],
      limit,
      offset,
    });

    // Get total count
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(orders)
      .where(and(...conditions));

    return {
      orders: vendorOrders.map((order) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        paymentStatus: order.paymentStatus,
        fulfillmentStatus: order.fulfillmentStatus,
        subtotal: parseFloat(order.subtotal),
        taxAmount: parseFloat(order.taxAmount),
        shippingAmount: parseFloat(order.shippingAmount),
        discountAmount: parseFloat(order.discountAmount),
        totalAmount: parseFloat(order.totalAmount),
        shippingMethod: order.shippingMethod,
        shippingAddress: order.shippingAddress,
        shopId: order.shopId,
        shopName: order.shop?.name || "Unknown Store",
        customer: order.user
          ? {
              id: order.user.id,
              name: order.user.name,
              email: order.user.email,
            }
          : {
              email: order.guestEmail,
            },
        itemCount: order.items.length,
        createdAt: order.createdAt.toISOString(),
      })),
      total: Number(count),
    };
  });

// ============================================================================
// Get Vendor Order Details
// ============================================================================

export const getVendorOrderDetails = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .inputValidator(getOrderByIdSchema)
  .handler(async ({ context, data }) => {
    const userId = context.session?.user?.id;
    const { orderId } = data;

    if (!userId) {
      throw new Error("Unauthorized");
    }

    const order = await db.query.orders.findFirst({
      where: eq(orders.id, orderId),
      with: {
        items: true,
        payments: true,
        shop: {
          columns: { id: true, name: true },
        },
        user: {
          columns: { id: true, name: true, email: true },
        },
      },
    });

    if (!order) {
      throw new Error("Order not found");
    }

    // Verify shop access (admin or vendor who owns the shop)
    const hasAccess = await verifyShopAccess(userId, order.shopId);
    if (!hasAccess) {
      throw new Error("Unauthorized");
    }

    return {
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        paymentStatus: order.paymentStatus,
        fulfillmentStatus: order.fulfillmentStatus,
        subtotal: parseFloat(order.subtotal),
        taxAmount: parseFloat(order.taxAmount),
        shippingAmount: parseFloat(order.shippingAmount),
        discountAmount: parseFloat(order.discountAmount),
        totalAmount: parseFloat(order.totalAmount),
        shippingMethod: order.shippingMethod,
        shippingAddress: order.shippingAddress,
        billingAddress: order.billingAddress,
        customerNotes: order.customerNotes,
        internalNotes: order.internalNotes,
        couponCode: order.couponCode,
        shopId: order.shopId,
        shopName: order.shop?.name || "Unknown Store",
        customer: order.user
          ? {
              id: order.user.id,
              name: order.user.name,
              email: order.user.email,
            }
          : {
              email: order.guestEmail,
            },
        items: order.items.map((item) => ({
          id: item.id,
          productId: item.productId,
          productName: item.productName,
          productSku: item.productSku,
          productImage: item.productImage,
          variantOptions: item.variantOptions,
          unitPrice: parseFloat(item.unitPrice),
          quantity: item.quantity,
          totalPrice: parseFloat(item.totalPrice),
        })),
        payments: order.payments.map((payment) => ({
          id: payment.id,
          method: payment.paymentMethod,
          provider: payment.provider,
          amount: parseFloat(payment.amount),
          status: payment.status,
          createdAt: payment.createdAt.toISOString(),
        })),
        createdAt: order.createdAt.toISOString(),
        updatedAt: order.updatedAt.toISOString(),
      },
    };
  });

// ============================================================================
// Update Order Status (Vendor)
// ============================================================================

export const updateVendorOrderStatus = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator(updateOrderStatusSchema)
  .handler(async ({ context, data }) => {
    const userId = context.session?.user?.id;
    const { orderId, status, internalNotes } = data;

    if (!userId) {
      throw new Error("Unauthorized");
    }

    // Get order
    const order = await db.query.orders.findFirst({
      where: eq(orders.id, orderId),
    });

    if (!order) {
      throw new Error("Order not found");
    }

    // Verify shop access (admin or vendor who owns the shop)
    const hasAccess = await verifyShopAccess(userId, order.shopId);
    if (!hasAccess) {
      throw new Error("Unauthorized");
    }

    // Determine fulfillment status based on order status
    let fulfillmentStatus = order.fulfillmentStatus;
    if (status === "shipped") {
      fulfillmentStatus = "partial";
    } else if (status === "delivered") {
      fulfillmentStatus = "fulfilled";
    }

    // Update order
    await db
      .update(orders)
      .set({
        status,
        fulfillmentStatus,
        internalNotes: internalNotes
          ? `${order.internalNotes || ""}\n${new Date().toISOString()}: ${internalNotes}`
          : order.internalNotes,
      })
      .where(eq(orders.id, orderId));

    return {
      success: true,
      message: `Order status updated to ${status}`,
    };
  });

// ============================================================================
// Get Vendor Order Stats
// ============================================================================

const getVendorOrderStatsSchema = z.object({
  shopSlug: z.string().optional(),
});

export const getVendorOrderStats = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .inputValidator(getVendorOrderStatsSchema)
  .handler(async ({ context, data }) => {
    const userId = context.session?.user?.id;
    const { shopSlug } = data;

    if (!userId) {
      throw new Error("Unauthorized");
    }

    // Get shop IDs based on user access
    const shopIds = await getShopIdsForOrderQuery(userId, shopSlug);

    if (shopIds.length === 0) {
      return {
        totalOrders: 0,
        pendingOrders: 0,
        processingOrders: 0,
        shippedOrders: 0,
        deliveredOrders: 0,
        cancelledOrders: 0,
        totalRevenue: 0,
      };
    }

    // Get order counts by status
    const orderStats = await db
      .select({
        status: orders.status,
        count: sql<number>`count(*)`,
        revenue: sql<number>`sum(${orders.totalAmount})`,
      })
      .from(orders)
      .where(inArray(orders.shopId, shopIds))
      .groupBy(orders.status);

    const stats = {
      totalOrders: 0,
      pendingOrders: 0,
      processingOrders: 0,
      shippedOrders: 0,
      deliveredOrders: 0,
      cancelledOrders: 0,
      totalRevenue: 0,
    };

    for (const row of orderStats) {
      const count = Number(row.count);
      const revenue = Number(row.revenue) || 0;

      stats.totalOrders += count;

      switch (row.status) {
        case "pending":
        case "confirmed":
          stats.pendingOrders += count;
          break;
        case "processing":
          stats.processingOrders += count;
          break;
        case "shipped":
          stats.shippedOrders += count;
          break;
        case "delivered":
          stats.deliveredOrders += count;
          stats.totalRevenue += revenue;
          break;
        case "cancelled":
        case "refunded":
          stats.cancelledOrders += count;
          break;
      }
    }

    return stats;
  });
