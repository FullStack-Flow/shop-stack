/**
 * Order Validators
 *
 * Zod schemas for order operations.
 */

import { z } from "zod";

// ============================================================================
// Address Schema
// ============================================================================

export const addressSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.email("Valid email is required"),
  phone: z.string().min(1, "Phone is required"),
  street: z.string().min(1, "Street address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zip: z.string().min(1, "ZIP code is required"),
  country: z.string().min(1, "Country is required"),
});

export type AddressInput = z.infer<typeof addressSchema>;

// ============================================================================
// Checkout Item Schema
// ============================================================================

export const checkoutItemSchema = z.object({
  productId: z.string().min(1),
  productName: z.string().min(1),
  productSku: z.string().optional(),
  productImage: z.string().optional(),
  variantOptions: z.record(z.string(), z.string()).optional(),
  unitPrice: z.number().min(0),
  quantity: z.number().int().min(1),
  shopId: z.string().min(1),
  shopName: z.string().min(1),
});

export type CheckoutItemInput = z.infer<typeof checkoutItemSchema>;

// ============================================================================
// Create Checkout Session (Stripe)
// ============================================================================

export const createCheckoutSessionSchema = z.object({
  sessionId: z.string().optional(), // For guest carts
  shippingAddress: addressSchema,
  billingAddress: addressSchema.optional(),
  useSameBillingAddress: z.boolean().default(true),
  shippingMethod: z.string().min(1, "Shipping method is required"),
  customerNotes: z.string().optional(),
  couponCodes: z
    .array(
      z.object({
        shopId: z.string(),
        code: z.string(),
        discountAmount: z.number(),
      }),
    )
    .optional(),
});

export type CreateCheckoutSessionInput = z.infer<
  typeof createCheckoutSessionSchema
>;

// ============================================================================
// Confirm Payment Schema
// ============================================================================

export const confirmPaymentSchema = z.object({
  paymentIntentId: z.string().min(1, "Payment intent ID is required"),
  orderIds: z.array(z.string()).min(1, "At least one order ID is required"),
});

export type ConfirmPaymentInput = z.infer<typeof confirmPaymentSchema>;

// ============================================================================
// Get Orders Schema
// ============================================================================

export const getOrdersSchema = z.object({
  limit: z.coerce.number().min(1).max(50).optional().default(10),
  offset: z.coerce.number().min(0).optional().default(0),
  status: z
    .enum([
      "pending",
      "confirmed",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
      "refunded",
    ])
    .optional(),
  shopId: z.string().optional(), // For vendor dashboard
  shopSlug: z.string().optional(), // For admin access to specific shop
});

export type GetOrdersInput = z.infer<typeof getOrdersSchema>;

// ============================================================================
// Get Order by ID
// ============================================================================

export const getOrderByIdSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
});

export type GetOrderByIdInput = z.infer<typeof getOrderByIdSchema>;

export const getOrdersByIdsSchema = z.object({
  orderIds: z.array(z.string()).min(1, "At least one order ID is required"),
  paymentIntentId: z.string().optional(), // For verifying guest access
});

export type GetOrdersByIdsInput = z.infer<typeof getOrdersByIdsSchema>;

// ============================================================================
// Update Order Status (Admin/Vendor)
// ============================================================================

export const updateOrderStatusSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
  status: z.enum([
    "pending",
    "confirmed",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
    "refunded",
  ]),
  internalNotes: z.string().optional(),
});

export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;

// ============================================================================
// Cancel Order
// ============================================================================

export const cancelOrderSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
  reason: z.string().optional(),
});

export type CancelOrderInput = z.infer<typeof cancelOrderSchema>;
