/**
 * Attributes Schema
 *
 * Database schema for product attributes in the multi-vendor marketplace.
 * Attributes are scoped to individual shops for defining product variations.
 * Supports multiple types: select, color, image, label.
 */

import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { shops } from "./shop-schema";

/**
 * Attribute Type Enum
 */
export const attributeTypeEnum = pgEnum("attribute_type", [
  "select",
  "color",
  "image",
  "label",
]);

/**
 * Attributes Table
 * Stores product attributes for shops.
 * Each attribute can have multiple values.
 */
export const attributes = pgTable("attributes", {
  id: text("id").primaryKey(),
  shopId: text("shop_id")
    .notNull()
    .references(() => shops.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  type: attributeTypeEnum("type").notNull().default("select"),
  sortOrder: integer("sort_order").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

/**
 * Attribute Values Table
 * Stores values for each attribute.
 */
export const attributeValues = pgTable("attribute_values", {
  id: text("id").primaryKey(),
  attributeId: text("attribute_id")
    .notNull()
    .references(() => attributes.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  value: text("value").notNull(), // Color hex, image URL, or display value
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

/**
 * Attributes Relations
 */
export const attributesRelations = relations(attributes, ({ one, many }) => ({
  shop: one(shops, {
    fields: [attributes.shopId],
    references: [shops.id],
  }),
  values: many(attributeValues),
}));

/**
 * Attribute Values Relations
 */
export const attributeValuesRelations = relations(
  attributeValues,
  ({ one }) => ({
    attribute: one(attributes, {
      fields: [attributeValues.attributeId],
      references: [attributes.id],
    }),
  }),
);

// Type exports
export type Attribute = typeof attributes.$inferSelect;
export type NewAttribute = typeof attributes.$inferInsert;
export type AttributeValue = typeof attributeValues.$inferSelect;
export type NewAttributeValue = typeof attributeValues.$inferInsert;
