/**
 * Order Server Functions (Admin)
 *
 * Server functions for admin order management.
 * Allows admins to view and manage all orders across the platform.
 */

import { createServerFn } from "@tanstack/react-start";
import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { orders, payments } from "@/lib/db/schema/order-schema";
import { products } from "@/lib/db/schema/products-schema";
import { shops } from "@/lib/db/schema/shop-schema";
import { adminMiddleware } from "@/lib/middleware/admin";
import { createRefund } from "@/lib/stripe";

import {
  cancelOrderSchema,
  getOrderByIdSchema,
  getOrdersSchema,
  updateOrderStatusSchema,
} from "@/lib/validators/order";

// ============================================================================
// Get All Orders (Admin)
// ============================================================================

export const getAdminOrders = createServerFn({ method: "GET" })
  .middleware([adminMiddleware])
  .inputValidator(getOrdersSchema)
  .handler(async ({ data }) => {
    const { limit, offset, status, shopId } = data;

    const conditions = [];

    if (shopId) {
      conditions.push(eq(orders.shopId, shopId));
    }

    if (status) {
      conditions.push(eq(orders.status, status));
    }

    const adminOrders = await db.query.orders.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
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
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    return {
      orders: adminOrders.map((order) => ({
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
// Get Admin Order Details
// ============================================================================

export const getAdminOrderDetails = createServerFn({ method: "GET" })
  .middleware([adminMiddleware])
  .inputValidator(getOrderByIdSchema)
  .handler(async ({ data }) => {
    const { orderId } = data;

    const order = await db.query.orders.findFirst({
      where: eq(orders.id, orderId),
      with: {
        items: true,
        payments: true,
        shop: {
          columns: { id: true, name: true },
          with: {
            vendor: {
              columns: { id: true, businessName: true },
            },
          },
        },
        user: {
          columns: { id: true, name: true, email: true },
        },
      },
    });

    if (!order) {
      throw new Error("Order not found");
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
        shop: {
          id: order.shopId,
          name: order.shop?.name || "Unknown Store",
          vendor: order.shop?.vendor
            ? {
                id: order.shop.vendor.id,
                businessName: order.shop.vendor.businessName,
              }
            : null,
        },
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
          stripePaymentIntentId: payment.stripePaymentIntentId,
          transactionId: payment.transactionId,
          createdAt: payment.createdAt.toISOString(),
        })),
        createdAt: order.createdAt.toISOString(),
        updatedAt: order.updatedAt.toISOString(),
      },
    };
  });

// ============================================================================
// Update Order Status (Admin)
// ============================================================================

export const updateAdminOrderStatus = createServerFn({ method: "POST" })
  .middleware([adminMiddleware])
  .inputValidator(updateOrderStatusSchema)
  .handler(async ({ data }) => {
    const { orderId, status, internalNotes } = data;

    const order = await db.query.orders.findFirst({
      where: eq(orders.id, orderId),
    });

    if (!order) {
      throw new Error("Order not found");
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
          ? `${order.internalNotes || ""}\n[ADMIN] ${new Date().toISOString()}: ${internalNotes}`
          : order.internalNotes,
      })
      .where(eq(orders.id, orderId));

    return {
      success: true,
      message: `Order status updated to ${status}`,
    };
  });

// ============================================================================
// Cancel/Refund Order (Admin)
// ============================================================================

export const adminCancelOrder = createServerFn({ method: "POST" })
  .middleware([adminMiddleware])
  .inputValidator(cancelOrderSchema)
  .handler(async ({ data }) => {
    const { orderId, reason } = data;

    const order = await db.query.orders.findFirst({
      where: eq(orders.id, orderId),
      with: {
        payments: true,
        items: true,
      },
    });

    if (!order) {
      throw new Error("Order not found");
    }

    // Process refund if payment was made
    if (order.paymentStatus === "paid") {
      const payment = order.payments.find(
        (p) => p.status === "succeeded" && p.stripePaymentIntentId,
      );

      if (payment?.stripePaymentIntentId) {
        try {
          await createRefund(payment.stripePaymentIntentId);

          // Update payment status
          await db
            .update(payments)
            .set({ status: "refunded" })
            .where(eq(payments.id, payment.id));
        } catch (error) {
          console.error("Refund error:", error);
          throw new Error("Failed to process refund");
        }
      }
    }

    // Update order status
    await db
      .update(orders)
      .set({
        status: order.paymentStatus === "paid" ? "refunded" : "cancelled",
        paymentStatus:
          order.paymentStatus === "paid" ? "refunded" : order.paymentStatus,
        internalNotes: `[ADMIN] Cancelled: ${reason || "No reason provided"}`,
      })
      .where(eq(orders.id, orderId));

    // Restore stock
    for (const item of order.items) {
      const product = await db.query.products.findFirst({
        where: eq(products.id, item.productId),
      });

      if (product && product.stock !== null) {
        await db
          .update(products)
          .set({ stock: product.stock + item.quantity })
          .where(eq(products.id, item.productId));
      }
    }

    return {
      success: true,
      message:
        order.paymentStatus === "paid"
          ? "Order refunded and cancelled successfully"
          : "Order cancelled successfully",
    };
  });

// ============================================================================
// Get Platform Order Stats (Admin)
// ============================================================================

export const getAdminOrderStats = createServerFn({ method: "GET" })
  .middleware([adminMiddleware])
  .handler(async () => {
    // Get order counts by status
    const orderStats = await db
      .select({
        status: orders.status,
        paymentStatus: orders.paymentStatus,
        count: sql<number>`count(*)`,
        revenue: sql<number>`sum(${orders.totalAmount})`,
      })
      .from(orders)
      .groupBy(orders.status, orders.paymentStatus);

    // Get today's orders
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [todayStats] = await db
      .select({
        count: sql<number>`count(*)`,
        revenue: sql<number>`sum(${orders.totalAmount})`,
      })
      .from(orders)
      .where(sql`${orders.createdAt} >= ${today}`);

    const stats = {
      totalOrders: 0,
      pendingOrders: 0,
      processingOrders: 0,
      shippedOrders: 0,
      deliveredOrders: 0,
      cancelledOrders: 0,
      totalRevenue: 0,
      paidRevenue: 0,
      todayOrders: Number(todayStats?.count) || 0,
      todayRevenue: Number(todayStats?.revenue) || 0,
    };

    for (const row of orderStats) {
      const count = Number(row.count);
      const revenue = Number(row.revenue) || 0;

      stats.totalOrders += count;

      if (row.paymentStatus === "paid") {
        stats.paidRevenue += revenue;
      }

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

    // Get shop count
    const [{ shopCount }] = await db
      .select({ shopCount: sql<number>`count(*)` })
      .from(shops);

    return {
      ...stats,
      shopCount: Number(shopCount),
    };
  });
