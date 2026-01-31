import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { shops } from "./shop-schema";

export const categories = pgTable("categories", {
  id: text("id").primaryKey(),
  shopId: text("shop_id")
    .notNull()
    .references(() => shops.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  description: text("description"),
  image: text("image"),
  icon: text("icon"),
  parentId: text("parent_id"), // Self-referencing for hierarchical categories
  level: integer("level").default(0),
  sortOrder: integer("sort_order").default(0),
  isActive: boolean("is_active").default(true),
  featured: boolean("featured").default(false),
  productCount: integer("product_count").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  shop: one(shops, {
    fields: [categories.shopId],
    references: [shops.id],
  }),
  parent: one(categories, {
    fields: [categories.parentId],
    references: [categories.id],
    relationName: "categoryHierarchy",
  }),
  children: many(categories, {
    relationName: "categoryHierarchy",
  }),
}));

// Type exports
export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
