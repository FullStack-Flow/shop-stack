import z from "zod";

export const getNotificationsSchema = z.object({
  shopSlug: z.string(),
  limit: z.number().optional().default(20),
  offset: z.number().optional().default(0),
  unreadOnly: z.boolean().optional().default(false),
});

export const markNotificationAsReadSchema = z.object({
  shopSlug: z.string(),
  notificationId: z.string(),
});

export const markAllAsReadSchema = z.object({
  shopSlug: z.string(),
});

export const createNotificationSchema = z.object({
  shopId: z.string(),
  type: z.enum([
    "new_order",
    "order_status_update",
    "new_review",
    "low_stock",
    "payout",
    "system",
  ]),
  title: z.string(),
  message: z.string(),
  data: z
    .object({
      orderId: z.string().optional(),
      orderNumber: z.string().optional(),
      productId: z.string().optional(),
      reviewId: z.string().optional(),
      amount: z.number().optional(),
      link: z.string().optional(),
    })
    .optional(),
});
