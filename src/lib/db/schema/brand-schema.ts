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
 * Brands Table
 * Stores product brands for shops.
 * Brands are scoped to individual shops.
 */
export const brands = pgTable("brands", {
  id: text("id").primaryKey(),
  shopId: text("shop_id")
    .notNull()
    .references(() => shops.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  description: text("description"),
  logo: text("logo"),
  website: text("website"),
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
 * Brands Relations
 */
export const brandsRelations = relations(brands, ({ one }) => ({
  shop: one(shops, {
    fields: [brands.shopId],
    references: [shops.id],
  }),
}));

// Type exports
export type Brand = typeof brands.$inferSelect;
export type NewBrand = typeof brands.$inferInsert;
