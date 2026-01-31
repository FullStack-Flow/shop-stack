/**
 * Tags Schema
 *
 * Database schema for product tags in the multi-vendor marketplace.
 * Tags are scoped to individual shops for organizing products.
 */

import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { shops } from "./shop-schema";

/**
 * Tags Table
 * Stores product tags for shops.
 * Tags are scoped to individual shops for flexible product organization.
 */
export const tags = pgTable("tags", {
  id: text("id").primaryKey(),
  shopId: text("shop_id")
    .notNull()
    .references(() => shops.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  description: text("description"),
  sortOrder: integer("sort_order").default(0),
  isActive: boolean("is_active").default(true),
  productCount: integer("product_count").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

/**
 * Tags Relations
 */
export const tagsRelations = relations(tags, ({ one }) => ({
  shop: one(shops, {
    fields: [tags.shopId],
    references: [shops.id],
  }),
}));

// Type exports
export type Tag = typeof tags.$inferSelect;
export type NewTag = typeof tags.$inferInsert;
