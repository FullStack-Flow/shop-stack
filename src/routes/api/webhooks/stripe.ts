import { createFileRoute } from "@tanstack/react-router";
import { eq, inArray } from "drizzle-orm";
import type Stripe from "stripe";
import { db } from "@/lib/db";
import { orders, payments } from "@/lib/db/schema/order-schema";
import { vendors } from "@/lib/db/schema/shop-schema";
import { sendEmail } from "@/lib/email";
import VendorNewOrderEmail from "@/lib/emails/vendor-new-order-email";
import { createOrderNotification } from "@/lib/functions/vendor";
import { constructWebhookEvent } from "@/lib/stripe/connect";
import { sendOrderConfirmationEmailForOrderId } from "@/lib/validators/emails/order-confirmation";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export const Route = createFileRoute("/api/webhooks/stripe")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        if (!webhookSecret) {
          console.error("STRIPE_WEBHOOK_SECRET is not set");
          return new Response(
            JSON.stringify({ error: "Webhook secret not configured" }),
            { status: 500, headers: { "Content-Type": "application/json" } },
          );
        }

        const signature = request.headers.get("stripe-signature");
        if (!signature) {
          return new Response(
            JSON.stringify({ error: "No signature provided" }),
            { status: 400, headers: { "Content-Type": "application/json" } },
          );
        }

        const body = await request.text();

        let event: Stripe.Event;
        try {
          event = constructWebhookEvent(body, signature, webhookSecret);
        } catch (err) {
          console.error("Webhook signature verification failed:", err);
          return new Response(JSON.stringify({ error: "Invalid signature" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }

        try {
          switch (event.type) {
            case "account.updated": {
              const account = event.data.object as {
                id: string;
                details_submitted: boolean;
                charges_enabled: boolean;
                payouts_enabled: boolean;
              };

              await db
                .update(vendors)
                .set({
                  stripeOnboardingComplete: account.details_submitted,
                  stripeChargesEnabled: account.charges_enabled,
                  stripePayoutsEnabled: account.payouts_enabled,
                })
                .where(eq(vendors.stripeConnectedAccountId, account.id));

              console.log(
                `Updated vendor status for Stripe account: ${account.id}`,
              );
              break;
            }

            case "payment_intent.succeeded": {
              const paymentIntent = event.data.object as {
                id: string;
                metadata: {
                  orderIds?: string;
                  userId?: string;
                  email?: string;
                };
              };

              console.log(`Payment succeeded: ${paymentIntent.id}`);

              const orderIdsStr = paymentIntent.metadata?.orderIds;
              let orderIdList = orderIdsStr
                ? orderIdsStr.split(",")
                : [];

              if (orderIdList.length === 0) {
                const paymentMatches = await db
                  .select({ orderId: payments.orderId })
                  .from(payments)
                  .where(eq(payments.stripePaymentIntentId, paymentIntent.id));
                orderIdList = paymentMatches.map((row) => row.orderId);
              }

              if (orderIdList.length === 0) {
                console.log("No orders linked to payment intent");
                break;
              }

              await db
                .update(orders)
                .set({ status: "confirmed", paymentStatus: "paid" })
                .where(inArray(orders.id, orderIdList));

              await db
                .update(payments)
                .set({ status: "succeeded", transactionId: paymentIntent.id })
                .where(inArray(payments.orderId, orderIdList));

              const ordersList = await db.query.orders.findMany({
                where: inArray(orders.id, orderIdList),
                with: {
                  items: true,
                  shop: {
                    with: {
                      vendor: {
                        with: {
                          user: true,
                        },
                      },
                    },
                  },
                },
              });

              if (ordersList.length === 0) {
                console.log("No orders found for payment intent");
                break;
              }

              for (const order of ordersList) {
                try {
                  const customerEmail =
                    order.shippingAddress?.email || order.guestEmail;
                  const customerName = order.shippingAddress
                    ? `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`
                    : "Customer";

                  const emailItems = order.items.map((item) => ({
                    name: item.productName,
                    quantity: item.quantity,
                    price: parseFloat(item.unitPrice),
                    image: item.productImage,
                  }));

                  const shippingAddress = order.shippingAddress || {
                    street: "",
                    city: "",
                    state: "",
                    zip: "",
                    country: "",
                  };

                  const customerEmailResult =
                    await sendOrderConfirmationEmailForOrderId(order.id);
                  console.log("Order confirmation email result:", {
                    orderNumber: order.orderNumber,
                    orderId: order.id,
                    customerEmail,
                    result: customerEmailResult,
                  });

                  const vendorEmail =
                    order.shop?.vendor?.contactEmail ||
                    order.shop?.vendor?.user?.email;
                  if (vendorEmail && order.shop?.enableNotifications !== false) {
                    try {
                      await sendEmail({
                        to: vendorEmail,
                        subject: `🎉 New Order ${order.orderNumber} - $${parseFloat(order.totalAmount).toFixed(2)}`,
                        body: VendorNewOrderEmail({
                          orderNumber: order.orderNumber,
                          customerName,
                          customerEmail: customerEmail || "N/A",
                          orderDate: order.createdAt.toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            },
                          ),
                          items: emailItems,
                          subtotal: parseFloat(order.subtotal),
                          tax: parseFloat(order.taxAmount),
                          shipping: parseFloat(order.shippingAmount),
                          total: parseFloat(order.totalAmount),
                          shippingAddress,
                          shopName: order.shop?.name || "Your Shop",
                          dashboardLink: `${process.env.VITE_APP_URL || "http://localhost:3000"}/shop/${order.shop?.slug}/orders/${order.id}`,
                        }),
                      });
                      console.log(
                        `Sent vendor notification email for order ${order.orderNumber} to ${vendorEmail}`,
                      );
                    } catch (emailError) {
                      console.error(
                        `Failed to send vendor email for order ${order.orderNumber}:`,
                        emailError,
                      );
                    }
                  }

                  if (order.shopId) {
                    try {
                      await createOrderNotification({
                        shopId: order.shopId,
                        orderNumber: order.orderNumber,
                        orderId: order.id,
                        customerName,
                        totalAmount: parseFloat(order.totalAmount),
                        itemCount: order.items.length,
                      });
                      console.log(
                        `Created in-platform notification for order ${order.orderNumber}`,
                      );
                    } catch (notifError) {
                      console.error(
                        `Failed to create notification for order ${order.orderNumber}:`,
                        notifError,
                      );
                    }
                  }
                } catch (orderError) {
                  console.error(
                    `Error processing order ${order.orderNumber}:`,
                    orderError,
                  );
                }
              }
              break;
            }

            default:
              console.log(`Unhandled event type: ${event.type}`);
          }
        } catch (handlerError) {
          console.error("Webhook handler error:", handlerError);
          return new Response(
            JSON.stringify({ error: "Webhook handler error" }),
            { status: 500, headers: { "Content-Type": "application/json" } },
          );
        }

        return new Response(JSON.stringify({ received: true }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});
