/**
 * Vendors and Shops Schema
 *
 * Database schema for vendor profiles and their shops in the multi-vendor marketplace.
 * Each user can have only one vendor profile (userId is unique).
 * Vendors can create multiple shops under their profile.
 */

import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

/**
 * Vendors Table
 * Stores vendor business profile information.
 * One-to-one relationship with users (userId is unique).
 */
export const vendors = pgTable("vendors", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: "cascade" }),
  businessName: text("business_name"),
  commissionRate: numeric("commission_rate", {
    precision: 5,
    scale: 2,
  }).default("10.00"), // Platform fee percentage
  status: text("status").default("pending_approval"), // 'pending_approval', 'active', 'suspended', 'rejected'
  contactEmail: text("contact_email"),
  contactPhone: text("contact_phone"),
  address: text("address"),
  approvedAt: timestamp("approved_at"),
  approvedBy: text("approved_by").references(() => user.id),
  stripeConnectedAccountId: text("stripe_connected_account_id"),
  stripeOnboardingComplete: boolean("stripe_onboarding_complete").default(
    false,
  ),
  stripeChargesEnabled: boolean("stripe_charges_enabled").default(false),
  stripePayoutsEnabled: boolean("stripe_payouts_enabled").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

/**
 * Shops Table
 * Stores individual shop/store information for vendors.
 * One vendor can have multiple shops.
 */
export const shops = pgTable("shops", {
  id: text("id").primaryKey(),
  vendorId: text("vendor_id")
    .notNull()
    .references(() => vendors.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  logo: text("logo"),
  banner: text("banner"),
  category: text("category"),
  address: text("address"),
  phone: text("phone"),
  email: text("email"),
  enableNotifications: boolean("enable_notifications").default(false),
  monthlyRevenue: text("monthlyRevenue"),
  status: text("status").default("pending"), // 'pending', 'active', 'suspended'
  rating: numeric("rating", { precision: 2, scale: 1 }).default("0.0"),
  totalProducts: integer("total_products").default(0),
  totalOrders: integer("total_orders").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

/**
 * Relations
 */
export const vendorsRelations = relations(vendors, ({ one, many }) => ({
  user: one(user, {
    fields: [vendors.userId],
    references: [user.id],
  }),
  shops: many(shops),
}));

export const shopsRelations = relations(shops, ({ one }) => ({
  vendor: one(vendors, {
    fields: [shops.vendorId],
    references: [vendors.id],
  }),
}));

// Type exports
export type Vendor = typeof vendors.$inferSelect;
export type NewVendor = typeof vendors.$inferInsert;
export type Shop = typeof shops.$inferSelect;
export type NewShop = typeof shops.$inferInsert;
