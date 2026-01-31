/**
 * Coupons Schema
 *
 * Database schema for coupons in the multi-vendor marketplace.
 * Supports percentage, fixed amount, and free shipping discount types.
 * Coupons are scoped to individual shops with usage tracking.
 *
 * Features:
 * - Junction tables for product/category restrictions
 * - Per-user usage tracking for limit enforcement
 * - Flexible applicability (all products, specific products, specific categories)
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
import { user } from "./auth-schema";
import { categories } from "./category-schema";
import { products } from "./products-schema";
import { shops } from "./shop-schema";

/**
 * Coupon Type Enum
 * - 'percentage': Discount as a percentage of cart total
 * - 'fixed': Fixed amount discount
 * - 'free_shipping': Free shipping discount
 */
export const couponTypeEnum = pgEnum("coupon_type", [
  "percentage",
  "fixed",
  "free_shipping",
]);

/**
 * Coupon Status Enum
 * - 'active': Coupon is active and can be used
 * - 'inactive': Coupon is disabled by vendor
 * - 'expired': Coupon validity period has ended
 * - 'scheduled': Coupon is scheduled to become active in the future
 */
export const couponStatusEnum = pgEnum("coupon_status", [
  "active",
  "inactive",
  "expired",
  "scheduled",
]);

/**
 * Coupon Applicability Enum
 * - 'all': Applies to all products in the shop
 * - 'specific_products': Applies only to selected products
 * - 'specific_categories': Applies only to products in selected categories
 */
export const couponApplicabilityEnum = pgEnum("coupon_applicability", [
  "all",
  "specific_products",
  "specific_categories",
]);

/**
 * Coupons Table
 * Stores coupon/discount codes for shops with usage tracking.
 */
export const coupons = pgTable("coupons", {
  id: text("id").primaryKey(),
  shopId: text("shop_id")
    .notNull()
    .references(() => shops.id, { onDelete: "cascade" }),
  code: text("code").notNull(), // Unique coupon code (unique per shop)
  description: text("description"),
  image: text("image"), // Optional coupon image/banner
  type: couponTypeEnum("type").notNull().default("percentage"),
  discountAmount: numeric("discount_amount", { precision: 10, scale: 2 })
    .notNull()
    .default("0"), // Discount value (percentage or fixed amount)
  minimumCartAmount: numeric("minimum_cart_amount", { precision: 10, scale: 2 })
    .notNull()
    .default("0"), // Minimum order value required
  maximumDiscountAmount: numeric("maximum_discount_amount", {
    precision: 10,
    scale: 2,
  }), // Max discount for percentage coupons (optional)
  activeFrom: timestamp("active_from").notNull(), // Start date of validity
  activeTo: timestamp("active_to").notNull(), // End date of validity
  usageLimit: integer("usage_limit"), // Total uses allowed (null = unlimited)
  usageLimitPerUser: integer("usage_limit_per_user").default(1), // Uses per customer
  usageCount: integer("usage_count").notNull().default(0), // Current usage count
  isActive: boolean("is_active").default(true), // Manual enable/disable
  status: couponStatusEnum("status").notNull().default("active"), // Computed status
  applicableTo: couponApplicabilityEnum("applicable_to")
    .notNull()
    .default("all"), // What products this coupon applies to
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

/**
 * Coupon Products Junction Table
 * Links coupons to specific products when applicableTo = 'specific_products'
 */
export const couponProducts = pgTable(
  "coupon_products",
  {
    couponId: text("coupon_id")
      .notNull()
      .references(() => coupons.id, { onDelete: "cascade" }),
    productId: text("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.couponId, table.productId] }),
  }),
);

/**
 * Coupon Categories Junction Table
 * Links coupons to specific categories when applicableTo = 'specific_categories'
 */
export const couponCategories = pgTable(
  "coupon_categories",
  {
    couponId: text("coupon_id")
      .notNull()
      .references(() => coupons.id, { onDelete: "cascade" }),
    categoryId: text("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "cascade" }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.couponId, table.categoryId] }),
  }),
);

/**
 * Coupon Usage Table
 * Tracks individual coupon usage by users for per-user limit enforcement
 */
export const couponUsage = pgTable("coupon_usage", {
  id: text("id").primaryKey(),
  couponId: text("coupon_id")
    .notNull()
    .references(() => coupons.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  orderId: text("order_id"), // Reference to order when that feature is added
  discountApplied: numeric("discount_applied", { precision: 10, scale: 2 })
    .notNull()
    .default("0"), // Amount discounted on this usage
  usedAt: timestamp("used_at").defaultNow().notNull(),
});

/**
 * Coupons Relations
 */
export const couponsRelations = relations(coupons, ({ one, many }) => ({
  shop: one(shops, {
    fields: [coupons.shopId],
    references: [shops.id],
  }),
  products: many(couponProducts),
  categories: many(couponCategories),
  usage: many(couponUsage),
}));

/**
 * Coupon Products Relations
 */
export const couponProductsRelations = relations(couponProducts, ({ one }) => ({
  coupon: one(coupons, {
    fields: [couponProducts.couponId],
    references: [coupons.id],
  }),
  product: one(products, {
    fields: [couponProducts.productId],
    references: [products.id],
  }),
}));

/**
 * Coupon Categories Relations
 */
export const couponCategoriesRelations = relations(
  couponCategories,
  ({ one }) => ({
    coupon: one(coupons, {
      fields: [couponCategories.couponId],
      references: [coupons.id],
    }),
    category: one(categories, {
      fields: [couponCategories.categoryId],
      references: [categories.id],
    }),
  }),
);

/**
 * Coupon Usage Relations
 */
export const couponUsageRelations = relations(couponUsage, ({ one }) => ({
  coupon: one(coupons, {
    fields: [couponUsage.couponId],
    references: [coupons.id],
  }),
  user: one(user, {
    fields: [couponUsage.userId],
    references: [user.id],
  }),
}));

// Type exports
export type Coupon = typeof coupons.$inferSelect;
export type NewCoupon = typeof coupons.$inferInsert;
export type CouponProduct = typeof couponProducts.$inferSelect;
export type CouponCategory = typeof couponCategories.$inferSelect;
export type CouponUsage = typeof couponUsage.$inferSelect;
