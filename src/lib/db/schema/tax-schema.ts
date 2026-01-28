/**
 * Tax Rates Schema
 *
 * Database schema for tax rates in the multi-vendor marketplace.
 * Tax rates are scoped to individual shops with regional support.
 */

import { relations } from "drizzle-orm";
import { boolean, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { shops } from "./shop-schema";

/**
 * Tax Rates Table
 * Stores tax rates for shops with support for regional variations.
 * Tax rates can be targeted by country, state, and ZIP code.
 */
export const taxRates = pgTable("tax_rates", {
  id: text("id").primaryKey(),
  shopId: text("shop_id")
    .notNull()
    .references(() => shops.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  rate: text("rate").notNull(), // Tax percentage as string (e.g., '20.00' for 20%)
  country: text("country").notNull(), // ISO country code (e.g., 'US', 'UK', 'CA')
  state: text("state"), // State/Province code (optional)
  zip: text("zip"), // ZIP/Postal code pattern (optional)
  priority: text("priority").default("1"), // For compound tax calculations
  isActive: boolean("is_active").default(true),
  isCompound: boolean("is_compound").default(false), // Whether tax compounds on other taxes
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

/**
 * Tax Rates Relations
 */
export const taxRatesRelations = relations(taxRates, ({ one }) => ({
  shop: one(shops, {
    fields: [taxRates.shopId],
    references: [shops.id],
  }),
}));

// Type exports
export type TaxRate = typeof taxRates.$inferSelect;
export type NewTaxRate = typeof taxRates.$inferInsert;
