/**
 * Products Schema
 *
 * Database schema for products in the multi-vendor marketplace.
 * Products are scoped to individual shops with relations to categories, brands, tags, and attributes.
 */

import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  numeric,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { attributes } from "./attribute-schema";
import { brands } from "./brand-schema";
import { categories } from "./category-schema";
import { shippingMethods } from "./shipping-schema";
import { shops } from "./shop-schema";
import { tags } from "./tags-schema";
import { taxRates } from "./tax-schema";

// ============================================================================
// Enums
// ============================================================================
export const productStatusEnum = pgEnum("product_status", [
  "draft",
  "active",
  "archived",
]);

export const productTypeEnum = pgEnum("product_type", ["simple", "variable"]);

// ============================================================================
// Products Table
// ============================================================================

export const products = pgTable("products", {
  id: text("id").primaryKey(),
  shopId: text("shop_id")
    .notNull()
    .references(() => shops.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  sku: text("sku"),
  description: text("description"),
  shortDescription: text("short_description"),

  // Pricing
  sellingPrice: numeric("selling_price", { precision: 10, scale: 2 }).notNull(),
  regularPrice: numeric("regular_price", { precision: 10, scale: 2 }),
  costPrice: numeric("cost_price", { precision: 10, scale: 2 }),

  // Inventory
  stock: integer("stock").default(0),
  lowStockThreshold: integer("low_stock_threshold").default(5),
  trackInventory: boolean("track_inventory").default(true),

  // Relations (foreign keys)
  categoryId: text("category_id").references(() => categories.id, {
    onDelete: "set null",
  }),
  brandId: text("brand_id").references(() => brands.id, {
    onDelete: "set null",
  }),
  taxId: text("tax_id").references(() => taxRates.id, {
    onDelete: "set null",
  }),

  // Status & Type
  status: productStatusEnum("status").notNull().default("draft"),
  productType: productTypeEnum("product_type").notNull().default("simple"),

  // Flags
  isFeatured: boolean("is_featured").default(false),
  isActive: boolean("is_active").default(true),

  // SEO
  metaTitle: text("meta_title"),
  metaDescription: text("meta_description"),

  // Variation Pricing: { [valueId]: { regularPrice?, sellingPrice?, image? } }
  variationPrices: text("variation_prices"),

  // Denormalized rating data for performance
  averageRating: numeric("average_rating", { precision: 3, scale: 2 }).default(
    "0",
  ),
  reviewCount: integer("review_count").default(0),

  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// ============================================================================
// Product Images Table
// ============================================================================
export const productImages = pgTable("product_images", {
  id: text("id").primaryKey(),
  productId: text("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  alt: text("alt"),
  sortOrder: integer("sort_order").default(0),
  isPrimary: boolean("is_primary").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============================================================================
// Product Tags Junction Table
// ============================================================================

/**
 * Product Tags Junction Table
 * Many-to-many relationship between products and tags.
 */
export const productTags = pgTable(
  "product_tags",
  {
    productId: text("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    tagId: text("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.productId, table.tagId] })],
);

// ============================================================================
// Product Attributes Junction Table
// ============================================================================

export const productAttributes = pgTable(
  "product_attributes",
  {
    productId: text("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    attributeId: text("attribute_id")
      .notNull()
      .references(() => attributes.id, { onDelete: "cascade" }),
    value: text("value"), // Selected value (e.g., "#FF0000" or "XL")
  },
  (t) => ({
    pk: primaryKey({ columns: [t.productId, t.attributeId] }),
  }),
);

export const productShippingMethods = pgTable(
  "product_shipping_methods",
  {
    productId: text("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    shippingMethodId: text("shipping_method_id")
      .notNull()
      .references(() => shippingMethods.id, { onDelete: "cascade" }),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.productId, t.shippingMethodId] }),
  }),
);

// ============================================================================
// Relations
// ============================================================================

export const productsRelations = relations(products, ({ one, many }) => ({
  shop: one(shops, {
    fields: [products.shopId],
    references: [shops.id],
  }),
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  brand: one(brands, {
    fields: [products.brandId],
    references: [brands.id],
  }),
  tax: one(taxRates, {
    fields: [products.taxId],
    references: [taxRates.id],
  }),
  images: many(productImages),
  productTags: many(productTags),
  productAttributes: many(productAttributes),
  shippingMethods: many(productShippingMethods),
}));

/**
 * Product Images Relations
 */
export const productImagesRelations = relations(productImages, ({ one }) => ({
  product: one(products, {
    fields: [productImages.productId],
    references: [products.id],
  }),
}));

/**
 * Product Tags Relations
 */
export const productTagsRelations = relations(productTags, ({ one }) => ({
  product: one(products, {
    fields: [productTags.productId],
    references: [products.id],
  }),
  tag: one(tags, {
    fields: [productTags.tagId],
    references: [tags.id],
  }),
}));

/**
 * Product Attributes Relations
 */
export const productAttributesRelations = relations(
  productAttributes,
  ({ one }) => ({
    product: one(products, {
      fields: [productAttributes.productId],
      references: [products.id],
    }),
    attribute: one(attributes, {
      fields: [productAttributes.attributeId],
      references: [attributes.id],
    }),
  }),
);

export const productShippingMethodsRelations = relations(
  productShippingMethods,
  ({ one }) => ({
    product: one(products, {
      fields: [productShippingMethods.productId],
      references: [products.id],
    }),
    shippingMethod: one(shippingMethods, {
      fields: [productShippingMethods.shippingMethodId],
      references: [shippingMethods.id],
    }),
  }),
);

// ============================================================================
// Type Exports
// ============================================================================

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type ProductImage = typeof productImages.$inferSelect;
export type NewProductImage = typeof productImages.$inferInsert;
export type ProductTag = typeof productTags.$inferSelect;
export type NewProductTag = typeof productTags.$inferInsert;
export type ProductAttribute = typeof productAttributes.$inferSelect;
export type NewProductAttribute = typeof productAttributes.$inferInsert;
export type ProductShippingMethod = typeof productShippingMethods.$inferSelect;
export type NewProductShippingMethod =
  typeof productShippingMethods.$inferInsert;
