/**
 * Vendor Notification Server Functions
 *
 * Server functions for managing vendor/shop notifications.
 * Handles fetching, marking as read, and creating notifications.
 */

import { createServerFn } from "@tanstack/react-start";
import { and, desc, eq, gte, sql } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { db } from "@/lib/db";
import { notifications } from "@/lib/db/schema/notification-schema";
import { orders } from "@/lib/db/schema/order-schema";
import { getShopBySlug } from "@/lib/helper/get-shop-by-slug";
import { requireShopAccess } from "@/lib/helper/vendor";
import { authMiddleware } from "@/lib/middleware/auth";
import {
  createNotificationSchema,
  getNotificationsSchema,
  markAllAsReadSchema,
  markNotificationAsReadSchema,
} from "@/lib/validators/shared/notifications";
import type { NotificationResponse } from "@/types/notifications";

// ============================================================================
// Get Vendor Notifications
// ============================================================================
/**
 * Get notifications for a vendor/shop.
 *
 * @param shopSlug - The slug of the shop to fetch notifications for.
 * @param limit - Number of notifications to return (default: 20).
 * @param offset - Pagination offset (default: 0).
 * @param unreadOnly - Filter for unread notifications only (default: false).
 *
 * @returns A list of notifications for the specified shop.
 */
export const getVendorNotifications = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .inputValidator(getNotificationsSchema)
  .handler(async ({ context, data }) => {
    const userId = context.session?.user?.id;

    if (!userId) {
      throw new Error("Unauthorized");
    }

    const { shopSlug, limit, offset, unreadOnly } = data;

    // Get shop by slug first
    const shopData = await getShopBySlug(shopSlug);

    // Verify shop access
    await requireShopAccess(userId, shopData.id);

    if (offset === 0 && !unreadOnly) {
      const backfillStart = new Date();
      backfillStart.setDate(backfillStart.getDate() - 2);
      backfillStart.setHours(0, 0, 0, 0);

      const [ordersCountResult, notifCountResult] = await Promise.all([
        db
          .select({ count: sql<number>`count(*)::int` })
          .from(orders)
          .where(
            and(
              eq(orders.shopId, shopData.id),
              gte(orders.createdAt, backfillStart),
            ),
          ),
        db
          .select({ count: sql<number>`count(*)::int` })
          .from(notifications)
          .where(
            and(
              eq(notifications.shopId, shopData.id),
              eq(notifications.type, "new_order"),
              gte(notifications.createdAt, backfillStart),
            ),
          ),
      ]);

      const ordersCount = ordersCountResult[0]?.count ?? 0;
      const notifCount = notifCountResult[0]?.count ?? 0;

      if (ordersCount > notifCount) {
        const recentOrders = await db.query.orders.findMany({
          where: and(
            eq(orders.shopId, shopData.id),
            gte(orders.createdAt, backfillStart),
          ),
          with: { items: true },
          orderBy: [desc(orders.createdAt)],
          limit: 100,
        });

        for (const order of recentOrders) {
          const customerName = order.shippingAddress
            ? `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`
            : "Customer";

          await createOrderNotification({
            shopId: shopData.id,
            orderNumber: order.orderNumber,
            orderId: order.id,
            customerName,
            totalAmount: parseFloat(order.totalAmount),
            itemCount: order.items.length,
          });
        }
      }
    }

    // Build conditions
    const conditions = [eq(notifications.shopId, shopData.id)];
    if (unreadOnly) {
      conditions.push(eq(notifications.isRead, false));
    }

    // Get notifications
    const notificationsList = await db.query.notifications.findMany({
      where: and(...conditions),
      orderBy: [desc(notifications.createdAt)],
      limit,
      offset,
    });

    // Get unread count
    const unreadCountResult = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(notifications)
      .where(
        and(
          eq(notifications.shopId, shopData.id),
          eq(notifications.isRead, false),
        ),
      );

    const unreadCount = unreadCountResult[0]?.count ?? 0;

    return {
      notifications: notificationsList.map(
        (n): NotificationResponse => ({
          id: n.id,
          type: n.type,
          title: n.title,
          message: n.message,
          data: n.data,
          isRead: n.isRead,
          readAt: n.readAt?.toISOString() ?? null,
          createdAt: n.createdAt.toISOString(),
        }),
      ),
      unreadCount,
    };
  });

// ============================================================================
// Mark Notification as Read
// ============================================================================

export const markNotificationAsRead = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator(markNotificationAsReadSchema)
  .handler(async ({ context, data }) => {
    const userId = context.session?.user?.id;

    if (!userId) {
      throw new Error("Unauthorized");
    }

    const { shopSlug, notificationId } = data;

    // Get shop by slug first
    const shopData = await getShopBySlug(shopSlug);

    // Verify shop access
    await requireShopAccess(userId, shopData.id);

    // Mark as read
    await db
      .update(notifications)
      .set({
        isRead: true,
        readAt: new Date(),
      })
      .where(
        and(
          eq(notifications.id, notificationId),
          eq(notifications.shopId, shopData.id),
        ),
      );

    return { success: true };
  });

// ============================================================================
// Mark All Notifications as Read
// ============================================================================

export const markAllNotificationsAsRead = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator(markAllAsReadSchema)
  .handler(async ({ context, data }) => {
    const userId = context.session?.user?.id;

    if (!userId) {
      throw new Error("Unauthorized");
    }

    const { shopSlug } = data;

    // Get shop by slug first
    const shopData = await getShopBySlug(shopSlug);

    // Verify shop access
    await requireShopAccess(userId, shopData.id);

    // Mark all as read
    await db
      .update(notifications)
      .set({
        isRead: true,
        readAt: new Date(),
      })
      .where(
        and(
          eq(notifications.shopId, shopData.id),
          eq(notifications.isRead, false),
        ),
      );

    return { success: true };
  });

// ============================================================================
// Create Notification (Internal use - for webhooks/order creation)
// ============================================================================

export const createNotification = createServerFn({ method: "POST" })
  .inputValidator(createNotificationSchema)
  .handler(async ({ data }) => {
    const { shopId, type, title, message, data: notificationData } = data;

    const id = uuidv4();

    await db.insert(notifications).values({
      id,
      shopId,
      type,
      title,
      message,
      data: notificationData,
      isRead: false,
    });

    return { id, success: true };
  });

// ============================================================================
// Helper: Create Order Notification (Direct DB insert for internal use)
// ============================================================================

export async function createOrderNotification(params: {
  shopId: string;
  orderNumber: string;
  orderId: string;
  customerName: string;
  totalAmount: number;
  itemCount: number;
}) {
  const [existing] = await db
    .select({ id: notifications.id })
    .from(notifications)
    .where(
      and(
        eq(notifications.shopId, params.shopId),
        eq(notifications.type, "new_order"),
        sql`(${notifications.data} ->> 'orderId') = ${params.orderId}`,
      ),
    )
    .limit(1);

  if (existing?.id) {
    return { id: existing.id };
  }

  const id = uuidv4();

  await db.insert(notifications).values({
    id,
    shopId: params.shopId,
    type: "new_order",
    title: "New Order Received! 🎉",
    message: `${params.customerName} placed an order for ${params.itemCount} item(s) - $${params.totalAmount.toFixed(2)}`,
    data: {
      orderId: params.orderId,
      orderNumber: params.orderNumber,
      amount: params.totalAmount,
      link: `/shop/orders/${params.orderId}`,
    },
    isRead: false,
  });

  return { id };
}
