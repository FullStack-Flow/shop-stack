import Stripe from "stripe";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || "";

if (!stripeSecretKey) {
  console.warn(
    "STRIPE_SECRET_KEY is not set. Payment functionality will be disabled.",
  );
}

export const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey, {
      apiVersion: "2026-01-28.clover",
    })
  : null;

export function isStripeConfigured(): boolean {
  return stripe !== null;
}

export async function createPaymentIntent(
  amount: number,
  currency: string = "usd",
  metadata?: Record<string, string>,
): Promise<{ clientSecret: string; paymentIntentId: string } | null> {
  if (!stripe) {
    throw new Error("Stripe is not configured");
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount),
    currency: currency.toLowerCase(),
    automatic_payment_methods: {
      enabled: true,
    },
    metadata,
  });

  return {
    clientSecret: paymentIntent.client_secret!,
    paymentIntentId: paymentIntent.id,
  };
}

export async function getPaymentIntent(
  paymentIntentId: string,
): Promise<Stripe.PaymentIntent | null> {
  if (!stripe) {
    throw new Error("Stripe is not configured");
  }
  return stripe.paymentIntents.retrieve(paymentIntentId);
}

export async function cancelPaymentIntent(
  paymentIntentId: string,
): Promise<Stripe.PaymentIntent | null> {
  if (!stripe) {
    throw new Error("Stripe is not configured");
  }

  return stripe.paymentIntents.cancel(paymentIntentId);
}

export async function createRefund(
  paymentIntentId: string,
  amount?: number, // Optional partial refund amount in cents
): Promise<Stripe.Refund | null> {
  if (!stripe) {
    throw new Error("Stripe is not configured");
  }

  return stripe.refunds.create({
    payment_intent: paymentIntentId,
    amount: amount ? Math.round(amount) : undefined,
  });
}

export function dollarsToCents(amount: number): number {
  return Math.round(amount * 100);
}

export function centsToDollars(amount: number): number {
  return amount / 100;
}
