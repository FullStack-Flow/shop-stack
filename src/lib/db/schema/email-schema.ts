import { relations } from 'drizzle-orm';
import {
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';
import { orders } from './order-schema';

export const emailDeliveryTypeEnum = pgEnum('email_delivery_type', [
  'order_confirmation',
]);

export const emailDeliveryStatusEnum = pgEnum('email_delivery_status', [
  'processing',
  'sent',
  'failed',
  'skipped',
]);

export const emailDeliveries = pgTable('email_deliveries', {
  id: text('id').primaryKey(),
  dedupeKey: text('dedupe_key').notNull().unique(),
  type: emailDeliveryTypeEnum('type').notNull(),
  toEmail: text('to_email').notNull(),
  orderId: text('order_id').references(() => orders.id, {
    onDelete: 'cascade',
  }),
  status: emailDeliveryStatusEnum('status').notNull().default('processing'),
  attempts: integer('attempts').notNull().default(0),
  providerMessageId: text('provider_message_id'),
  lastError: text('last_error'),
  lastAttemptAt: timestamp('last_attempt_at'),
  sentAt: timestamp('sent_at'),
  metadata: jsonb('metadata').$type<Record<string, unknown>>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const emailDeliveriesRelations = relations(
  emailDeliveries,
  ({ one }) => ({
    order: one(orders, {
      fields: [emailDeliveries.orderId],
      references: [orders.id],
    }),
  })
);

export type EmailDelivery = typeof emailDeliveries.$inferSelect;
export type NewEmailDelivery = typeof emailDeliveries.$inferInsert;
