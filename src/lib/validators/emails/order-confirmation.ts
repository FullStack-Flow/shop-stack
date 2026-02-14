import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { db } from "@/lib/db";
import { emailDeliveries } from "@/lib/db/schema/email-schema";
import { orders } from "@/lib/db/schema/order-schema";
import { sendEmail } from "@/lib/email";
import OrderConfirmationEmail from "@/lib/emails/order-confirmation-email";

type SendEmailFn = typeof sendEmail;

export type SendOrderConfirmationResult =
  | { status: "sent"; messageId: string | null }
  | { status: "skipped"; reason: string }
  | { status: "already_sent" }
  | { status: "failed"; error: string };

export function getEstimatedDeliveryTimeframe(
  shippingMethod: string | null | undefined,
): string {
  if (shippingMethod === "express") return "2–3 business days";
  return "5–7 business days";
}

async function sleep(ms: number): Promise<void> {
  await new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}

function getRetryDelayMs(attemptNumber: number): number {
  if (attemptNumber <= 1) return 0;
  const baseDelayMs = 250;
  const maxDelayMs = 2000;
  const exponent = attemptNumber - 2;
  return Math.min(maxDelayMs, baseDelayMs * 2 ** exponent);
}

function getAppUrl(): string {
  return (
    process.env.APP_URL ??
    process.env.VITE_APP_URL ??
    process.env.VITE_BETTER_AUTH_URL ??
    "http://localhost:3000"
  );
}

function toErrorString(err: unknown): string {
  if (err instanceof Error) return err.message;
  try {
    return JSON.stringify(err);
  } catch {
    return String(err);
  }
}

export async function sendOrderConfirmationEmailForOrderId(
  orderId: string,
  deps?: {
    sendEmailFn?: SendEmailFn;
    now?: () => Date;
    maxAttempts?: number;
    sleepFn?: (ms: number) => Promise<void>;
    getRetryDelayMsFn?: (attemptNumber: number) => number;
  },
): Promise<SendOrderConfirmationResult> {
  const sendEmailFn = deps?.sendEmailFn ?? sendEmail;
  const now = deps?.now ?? (() => new Date());
  const maxAttempts = deps?.maxAttempts ?? 3;
  const sleepFn = deps?.sleepFn ?? sleep;
  const getRetryDelayMsFn = deps?.getRetryDelayMsFn ?? getRetryDelayMs;

  const order = await db.query.orders.findFirst({
    where: eq(orders.id, orderId),
    with: {
      items: true,
      user: {
        columns: {
          id: true,
          name: true,
          email: true,
          orderEmailsEnabled: true,
        },
      },
      shop: {
        columns: {
          id: true,
          name: true,
          slug: true,
          email: true,
          phone: true,
        },
        with: {
          vendor: {
            columns: {
              id: true,
              contactEmail: true,
              contactPhone: true,
            },
            with: {
              user: {
                columns: {
                  email: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!order) {
    return { status: "failed", error: "Order not found" };
  }

  const customerEmail =
    order.user?.email ??
    order.guestEmail ??
    order.shippingAddress?.email ??
    null;

  if (!customerEmail) {
    return { status: "failed", error: "Customer email not found" };
  }

  const dedupeKey = `order_confirmation:${order.id}:${customerEmail}`;

  const existingDelivery = await db.query.emailDeliveries.findFirst({
    where: eq(emailDeliveries.dedupeKey, dedupeKey),
  });

  if (existingDelivery?.status === "sent") {
    return { status: "already_sent" };
  }

  if (
    existingDelivery?.status === "failed" &&
    existingDelivery.attempts >= maxAttempts
  ) {
    return { status: "failed", error: "Max delivery attempts reached" };
  }

  const deliveryId = existingDelivery?.id ?? uuidv4();

  if (!existingDelivery) {
    await db.insert(emailDeliveries).values({
      id: deliveryId,
      dedupeKey,
      type: "order_confirmation",
      toEmail: customerEmail,
      orderId: order.id,
      status: "processing",
      attempts: 0,
      lastAttemptAt: null,
      metadata: { shopId: order.shopId },
    });
  }

  if (order.userId && order.user?.orderEmailsEnabled === false) {
    const attemptAt = now();
    await db
      .update(emailDeliveries)
      .set({
        status: "skipped",
        lastError: null,
        providerMessageId: null,
        sentAt: null,
        updatedAt: attemptAt,
      })
      .where(eq(emailDeliveries.dedupeKey, dedupeKey));

    console.info("[email] skipped order confirmation (opted out)", {
      orderId: order.id,
      toEmail: customerEmail,
    });

    return { status: "skipped", reason: "Customer opted out" };
  }

  const customerName =
    order.shippingAddress?.firstName || order.user?.name || "Customer";

  const emailItems = order.items.map((item) => ({
    name: item.productName,
    quantity: item.quantity,
    price: parseFloat(item.unitPrice),
    image: item.productImage,
  }));

  const shippingAddress = order.shippingAddress
    ? {
        street: order.shippingAddress.street,
        city: order.shippingAddress.city,
        state: order.shippingAddress.state,
        zip: order.shippingAddress.zip,
        country: order.shippingAddress.country,
      }
    : { street: "", city: "", state: "", zip: "", country: "" };

  const supportEmail =
    order.shop?.email ??
    order.shop?.vendor?.contactEmail ??
    order.shop?.vendor?.user?.email ??
    process.env.SUPPORT_EMAIL ??
    "support@shopstack.com";

  const supportPhone =
    order.shop?.phone ??
    order.shop?.vendor?.contactPhone ??
    process.env.SUPPORT_PHONE ??
    null;

  const trackingUrl = `${getAppUrl()}/track-order?orderId=${encodeURIComponent(order.id)}`;
  const estimatedDeliveryTimeframe = getEstimatedDeliveryTimeframe(
    order.shippingMethod,
  );

  const subject = `Order Confirmed - ${order.orderNumber}`;

  const body = OrderConfirmationEmail({
    orderNumber: order.orderNumber,
    customerName,
    orderDate: order.createdAt.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    items: emailItems,
    subtotal: parseFloat(order.subtotal),
    tax: parseFloat(order.taxAmount),
    shipping: parseFloat(order.shippingAmount),
    total: parseFloat(order.totalAmount),
    shippingAddress,
    shopName: order.shop?.name || "Shop",
    orderLink: trackingUrl,
    estimatedDeliveryTimeframe,
    supportEmail,
    supportPhone: supportPhone ?? undefined,
    trackingUrl,
  });

  let attemptsSoFar = existingDelivery?.attempts ?? 0;

  while (attemptsSoFar < maxAttempts) {
    const attemptNumber = attemptsSoFar + 1;
    const delayMs = getRetryDelayMsFn(attemptNumber);
    if (delayMs > 0) {
      await sleepFn(delayMs);
    }

    const attemptAt = now();
    attemptsSoFar = attemptNumber;

    await db
      .update(emailDeliveries)
      .set({
        status: "processing",
        attempts: attemptsSoFar,
        lastAttemptAt: attemptAt,
        lastError: null,
        updatedAt: attemptAt,
      })
      .where(eq(emailDeliveries.id, deliveryId));

    try {
      const result = await sendEmailFn({
        to: customerEmail,
        subject,
        body,
      });

      await db
        .update(emailDeliveries)
        .set({
          status: "sent",
          providerMessageId: result.messageId ?? null,
          lastError: null,
          sentAt: attemptAt,
          updatedAt: attemptAt,
        })
        .where(eq(emailDeliveries.id, deliveryId));

      console.info("[email] sent order confirmation", {
        orderId: order.id,
        toEmail: customerEmail,
        messageId: result.messageId ?? null,
        attempts: attemptsSoFar,
      });

      return { status: "sent", messageId: result.messageId ?? null };
    } catch (err) {
      const errorString = toErrorString(err);

      await db
        .update(emailDeliveries)
        .set({
          status: "failed",
          providerMessageId: null,
          lastError: errorString,
          updatedAt: attemptAt,
        })
        .where(eq(emailDeliveries.id, deliveryId));

      console.error("[email] failed order confirmation", {
        orderId: order.id,
        toEmail: customerEmail,
        error: errorString,
        attempt: attemptNumber,
        maxAttempts,
      });

      if (attemptNumber >= maxAttempts) {
        return { status: "failed", error: errorString };
      }
    }
  }

  return { status: "failed", error: "Max delivery attempts reached" };
}
