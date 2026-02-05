/**
 * Cart Schema
 *
 * Database schema for shopping cart functionality.
 * Supports both authenticated users and guest sessions.
 */

import { relations } from "drizzle-orm";
import { integer, pgTable, text, timestamp, unique } from "drizzle-orm/pg-core";
import { user } from "./auth-schema";
import { products } from "./products-schema";

// ============================================================================
// Cart Sessions Table
// ============================================================================

/**
 * Cart Sessions Table
 * Manages cart sessions for both registered users and guests.
 */
export const cartSessions = pgTable("cart_sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => user.id, { onDelete: "cascade" }),
  sessionId: text("session_id"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

// ============================================================================
// Cart Items Table
// ============================================================================

/**
 * Cart Items Table
 * Individual items within a cart session.
 */
export const cartItems = pgTable(
  "cart_items",
  {
    id: text("id").primaryKey(),
    cartSessionId: text("cart_session_id")
      .notNull()
      .references(() => cartSessions.id, { onDelete: "cascade" }),
    productId: text("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    quantity: integer("quantity").notNull().default(1),
    variantOptions: text("variant_options"),
    addedAt: timestamp("added_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    unique("cart_item_unique").on(
      table.cartSessionId,
      table.productId,
      table.variantOptions,
    ),
  ],
);

// ============================================================================
// Relations
// ============================================================================

/**
 * Cart Sessions Relations
 */
export const cartSessionsRelations = relations(
  cartSessions,
  ({ one, many }) => ({
    user: one(user, {
      fields: [cartSessions.userId],
      references: [user.id],
    }),
    items: many(cartItems),
  }),
);

/**
 * Cart Items Relations
 */
export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  cartSession: one(cartSessions, {
    fields: [cartItems.cartSessionId],
    references: [cartSessions.id],
  }),
  product: one(products, {
    fields: [cartItems.productId],
    references: [products.id],
  }),
}));

// ============================================================================
// Type Exports
// ============================================================================

export type CartSession = typeof cartSessions.$inferSelect;
export type NewCartSession = typeof cartSessions.$inferInsert;
export type CartItem = typeof cartItems.$inferSelect;
export type NewCartItem = typeof cartItems.$inferInsert;
