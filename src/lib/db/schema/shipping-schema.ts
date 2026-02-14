/**
 * Shipping Schema
 *
 * Database schema for shipping methods in the multi-vendor marketplace.
 * Shipping methods are scoped to individual shops.
 */

import { relations } from "drizzle-orm";
import {
  boolean,
  decimal,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { shops } from "./shop-schema";

/**
 * Shipping Methods Table
 * Stores shipping options/methods for shops.
 */
export const shippingMethods = pgTable("shipping_methods", {
  id: text("id").primaryKey(),
  shopId: text("shop_id")
    .notNull()
    .references(() => shops.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull().default("0"),
  duration: text("duration").notNull(), // e.g., "3-5 business days"
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

/**
 * Shipping Methods Relations
 */
export const shippingMethodsRelations = relations(
  shippingMethods,
  ({ one }) => ({
    shop: one(shops, {
      fields: [shippingMethods.shopId],
      references: [shops.id],
    }),
  }),
);

// Type exports
export type ShippingMethod = typeof shippingMethods.$inferSelect;
export type NewShippingMethod = typeof shippingMethods.$inferInsert;
