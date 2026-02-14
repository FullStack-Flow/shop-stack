/**
 * Customer Addresses Schema
 *
 * Database schema for customer shipping and billing addresses.
 * Addresses are linked to user accounts for reuse during checkout.
 */

import { relations } from "drizzle-orm";
import { boolean, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

/**
 * Address Type Enum Values
 */
export const addressTypeEnum = ["billing", "shipping"] as const;
export type AddressType = (typeof addressTypeEnum)[number];

/**
 * Customer Addresses Table
 * Stores billing and shipping addresses for customers.
 */
export const customerAddresses = pgTable("customer_addresses", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  type: text("type").notNull().default("shipping"), // 'billing' | 'shipping'
  title: text("title").notNull(), // e.g., "Home", "Office"
  firstName: text("first_name"),
  lastName: text("last_name"),
  phone: text("phone"),
  street: text("street").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  zip: text("zip").notNull(),
  country: text("country").notNull(),
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

/**
 * Customer Addresses Relations
 */
export const customerAddressesRelations = relations(
  customerAddresses,
  ({ one }) => ({
    user: one(user, {
      fields: [customerAddresses.userId],
      references: [user.id],
    }),
  }),
);

// Type exports
export type CustomerAddress = typeof customerAddresses.$inferSelect;
export type NewCustomerAddress = typeof customerAddresses.$inferInsert;
