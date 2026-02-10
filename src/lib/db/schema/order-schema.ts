/**
 * Orders Schema
 *
 * Database schema for orders in the multi-vendor marketplace.
 * Supports order tracking, payment status, and fulfillment for each shop.
 *
 * Multi-vendor approach:
 * - Each order belongs to ONE shop (if cart has items from multiple shops, create multiple orders)
 * - Payments can be per-order or grouped by customer
 */

import { relations } from "drizzle-orm";
import {
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { user } from "./auth-schema";
import { products } from "./products-schema";
import { shops } from "./shop-schema";

// ============================================================================
// Enums
// ============================================================================

export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "pending",
  "paid",
  "failed",
  "refunded",
  "partial_refund",
]);

export const fulfillmentStatusEnum = pgEnum("fulfillment_status", [
  "unfulfilled",
  "partial",
  "fulfilled",
]);

export const paymentMethodEnum = pgEnum("payment_method", [
  "card",
  "bank_transfer",
  "cash_on_delivery",
]);

export const paymentProviderEnum = pgEnum("payment_provider", [
  "stripe",
  "manual",
]);

// ============================================================================
// Orders Table
// ============================================================================

export const orders = pgTable("orders", {
  id: text("id").primaryKey(),
  orderNumber: text("order_number").notNull().unique(), // Human-readable order number

  // Who placed the order
  userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
  guestEmail: text("guest_email"), // For guest checkout

  // Which shop receives the order
  shopId: text("shop_id")
    .notNull()
    .references(() => shops.id, { onDelete: "cascade" }),

  // Order Status
  status: orderStatusEnum("status").notNull().default("pending"),
  paymentStatus: paymentStatusEnum("payment_status")
    .notNull()
    .default("pending"),
  fulfillmentStatus: fulfillmentStatusEnum("fulfillment_status")
    .notNull()
    .default("unfulfilled"),

  // Financial
  currency: text("currency").notNull().default("USD"),
  subtotal: numeric("subtotal", { precision: 10, scale: 2 }).notNull(),
  taxAmount: numeric("tax_amount", { precision: 10, scale: 2 })
    .notNull()
    .default("0"),
  shippingAmount: numeric("shipping_amount", { precision: 10, scale: 2 })
    .notNull()
    .default("0"),
  discountAmount: numeric("discount_amount", { precision: 10, scale: 2 })
    .notNull()
    .default("0"),
  totalAmount: numeric("total_amount", { precision: 10, scale: 2 }).notNull(),

  // Shipping
  shippingMethod: text("shipping_method"),
  shippingAddress: jsonb("shipping_address").$type<{
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  }>(),
  billingAddress: jsonb("billing_address").$type<{
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  }>(),

  // Notes
  customerNotes: text("customer_notes"),
  internalNotes: text("internal_notes"),

  // Coupon applied
  couponCode: text("coupon_code"),
  couponId: text("coupon_id"),

  // Metadata
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),

  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// ============================================================================
// Order Items Table
// ============================================================================

export const orderItems = pgTable("order_items", {
  id: text("id").primaryKey(),
  orderId: text("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  productId: text("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "set null" }),

  // Snapshot of product at time of order
  productName: text("product_name").notNull(),
  productSku: text("product_sku"),
  productImage: text("product_image"),
  variantOptions: jsonb("variant_options").$type<Record<string, string>>(),

  // Pricing
  unitPrice: numeric("unit_price", { precision: 10, scale: 2 }).notNull(),
  quantity: integer("quantity").notNull(),
  totalPrice: numeric("total_price", { precision: 10, scale: 2 }).notNull(),
  discountAmount: numeric("discount_amount", { precision: 10, scale: 2 })
    .notNull()
    .default("0"),

  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============================================================================
// Payments Table
// ============================================================================

export const payments = pgTable("payments", {
  id: text("id").primaryKey(),
  orderId: text("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),

  // Payment details
  paymentMethod: paymentMethodEnum("payment_method").notNull(),
  provider: paymentProviderEnum("provider").notNull(),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("USD"),

  // Status
  status: text("status").notNull().default("pending"), // pending, processing, succeeded, failed, cancelled

  // Provider data
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  stripeClientSecret: text("stripe_client_secret"),
  transactionId: text("transaction_id"),
  // Stripe Connect transfer tracking
  stripeTransferId: text("stripe_transfer_id"),
  applicationFeeAmount: numeric("application_fee_amount", {
    precision: 10,
    scale: 2,
  }),
  connectedAccountId: text("connected_account_id"),

  // Metadata
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),

  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// ============================================================================
// Relations
// ============================================================================

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(user, {
    fields: [orders.userId],
    references: [user.id],
  }),
  shop: one(shops, {
    fields: [orders.shopId],
    references: [shops.id],
  }),
  items: many(orderItems),
  payments: many(payments),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  order: one(orders, {
    fields: [payments.orderId],
    references: [orders.id],
  }),
}));

// ============================================================================
// Type Exports
// ============================================================================

export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
export type OrderItem = typeof orderItems.$inferSelect;
export type NewOrderItem = typeof orderItems.$inferInsert;
export type Payment = typeof payments.$inferSelect;
export type NewPayment = typeof payments.$inferInsert;
