/**
 * Notifications Schema
 *
 * Database schema for vendor/shop notifications.
 * Stores order notifications, reviews, low stock alerts, etc.
 */

import { relations } from "drizzle-orm";
import {
  boolean,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { shops } from "./shop-schema";

// ============================================================================
// Enums
// ============================================================================

export const notificationTypeEnum = pgEnum("notification_type", [
  "new_order",
  "order_status_update",
  "new_review",
  "low_stock",
  "payout",
  "system",
]);

// ============================================================================
// Notifications Table
// ============================================================================

export const notifications = pgTable("notifications", {
  id: text("id").primaryKey(),

  // Shop-specific notification
  shopId: text("shop_id")
    .notNull()
    .references(() => shops.id, { onDelete: "cascade" }),

  // Notification type
  type: notificationTypeEnum("type").notNull(),

  // Content
  title: text("title").notNull(),
  message: text("message").notNull(),

  // Additional data (order ID, product ID, etc.)
  data: jsonb("data").$type<{
    orderId?: string;
    orderNumber?: string;
    productId?: string;
    reviewId?: string;
    amount?: number;
    link?: string;
  }>(),

  // Read status
  isRead: boolean("is_read").default(false).notNull(),
  readAt: timestamp("read_at"),

  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============================================================================
// Relations
// ============================================================================

export const notificationsRelations = relations(notifications, ({ one }) => ({
  shop: one(shops, {
    fields: [notifications.shopId],
    references: [shops.id],
  }),
}));

// ============================================================================
// Type Exports
// ============================================================================

export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;
