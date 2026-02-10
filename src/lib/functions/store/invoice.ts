import { createServerFn } from '@tanstack/react-start';
import { eq } from 'drizzle-orm';
import type Stripe from 'stripe';
import { z } from 'zod';
import { db } from '@/lib/db';
import { orders, payments } from '@/lib/db/schema/order-schema';
import { optionalAuthMiddleware } from '@/lib/middleware/optional-auth';
import { stripe } from '@/lib/stripe';

const getInvoiceUrlSchema = z.object({
  orderId: z.string(),
  paymentIntentId: z.string().optional(),
});

/**
 * Get the invoice/receipt URL for an order
 */
export const getInvoiceUrl = createServerFn({ method: 'POST' })
  .middleware([optionalAuthMiddleware])
  .inputValidator(getInvoiceUrlSchema)
  .handler(async ({ context, data }) => {
    const { orderId, paymentIntentId } = data;
    const userId = context.session?.user?.id;
    const userRole = (context.session?.user as any)?.role;

    // Fetch payment record for the order
    const payment = await db.query.payments.findFirst({
      where: eq(payments.orderId, orderId),
    });

    if (!payment || !payment.stripePaymentIntentId) {
      throw new Error('No payment found for this order');
    }

    // Fetch order to check ownership
    const order = await db.query.orders.findFirst({
      where: eq(orders.id, orderId),
    });

    if (!order) {
      throw new Error('Order not found');
    }

    if (userId) {
      const isOwner =
        order.userId === userId ||
        (order.guestEmail && order.guestEmail === context.session?.user?.email);
      const isAdmin = userRole === 'admin';

      if (!isOwner && !isAdmin) {
        throw new Error('You do not have permission to view this invoice');
      }
    } else {
      if (!paymentIntentId) {
        throw new Error('Unauthorized');
      }
      if (order.userId) {
        throw new Error('Unauthorized');
      }
      if (payment.stripePaymentIntentId !== paymentIntentId) {
        throw new Error('Unauthorized');
      }
    }

    // Check if Stripe is configured
    if (!stripe) {
      throw new Error('Stripe is not configured');
    }

    // Retrieve PaymentIntent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(
      payment.stripePaymentIntentId,
      {
        expand: ['latest_charge'],
      }
    );

    if (!paymentIntent) {
      throw new Error('Payment intent not found in Stripe');
    }

    const charge = paymentIntent.latest_charge as Stripe.Charge;

    // Check for receipt URL
    if (charge?.receipt_url) {
      return { url: charge.receipt_url };
    }

    // Fallback: Check for invoice URL if it exists
    const pi = paymentIntent as any;
    if (pi.invoice) {
      const invoiceId =
        typeof pi.invoice === 'string' ? pi.invoice : pi.invoice.id;

      const invoice = await stripe.invoices.retrieve(invoiceId);
      if (invoice.hosted_invoice_url) {
        return { url: invoice.hosted_invoice_url };
      }
    }

    throw new Error('No invoice or receipt available for this order');
  });
