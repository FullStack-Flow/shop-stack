import type Stripe from "stripe";
import { stripe } from "./index";

export async function createConnectedAccount(
  email: string,
  businessName?: string,
  metadata?: Record<string, string>,
): Promise<Stripe.Account | null> {
  if (!stripe) {
    throw new Error("Stripe is not configured");
  }

  const isTestMode = process.env.STRIPE_SECRET_KEY?.startsWith("sk_test_");

  const accountData: Stripe.AccountCreateParams = {
    type: "express",
    email,
    business_profile: businessName ? { name: businessName } : undefined,
    metadata,
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
  };

  // In test mode, pre-fill account with test data to skip verification
  if (isTestMode) {
    accountData.business_type = "individual";
    accountData.individual = {
      email,
      first_name: "Test",
      last_name: "Vendor",
      dob: {
        day: 1,
        month: 1,
        year: 1990,
      },
      address: {
        line1: "123 Test Street",
        city: "San Francisco",
        state: "CA",
        postal_code: "94111",
        country: "US",
      },
      ssn_last_4: "0000", // Test SSN
      phone: "+16505551234",
    };
  }

  const account = await stripe.accounts.create(accountData);

  return account;
}

export async function createAccountLink(
  connectedAccountId: string,
  refreshUrl: string,
  returnUrl: string,
): Promise<string> {
  if (!stripe) {
    throw new Error("Stripe is not configured");
  }

  const accountLink = await stripe.accountLinks.create({
    account: connectedAccountId,
    refresh_url: refreshUrl,
    return_url: returnUrl,
    type: "account_onboarding",
  });

  return accountLink.url;
}

export async function getAccountStatus(connectedAccountId: string): Promise<{
  detailsSubmitted: boolean;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  requirements: Stripe.Account.Requirements | null;
} | null> {
  if (!stripe) {
    throw new Error("Stripe is not configured");
  }

  const account = await stripe.accounts.retrieve(connectedAccountId);

  return {
    detailsSubmitted: account.details_submitted ?? false,
    chargesEnabled: account.charges_enabled ?? false,
    payoutsEnabled: account.payouts_enabled ?? false,
    requirements: account.requirements ?? null,
  };
}

export async function createLoginLink(
  connectedAccountId: string,
): Promise<string> {
  if (!stripe) {
    throw new Error("Stripe is not configured");
  }

  const loginLink = await stripe.accounts.createLoginLink(connectedAccountId);

  return loginLink.url;
}

export async function deleteConnectedAccount(
  connectedAccountId: string,
): Promise<void> {
  if (!stripe) {
    throw new Error("Stripe is not configured");
  }

  await stripe.accounts.del(connectedAccountId);
}

export async function createDestinationCharge(
  amount: number,
  currency: string,
  connectedAccountId: string,
  applicationFeeAmount: number,
  metadata?: Record<string, string>,
): Promise<{ clientSecret: string; paymentIntentId: string }> {
  if (!stripe) {
    throw new Error("Stripe is not configured");
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount),
    currency: currency.toLowerCase(),
    automatic_payment_methods: {
      enabled: true,
    },
    transfer_data: {
      destination: connectedAccountId,
    },
    application_fee_amount: Math.round(applicationFeeAmount),
    metadata,
  });

  return {
    clientSecret: paymentIntent.client_secret!,
    paymentIntentId: paymentIntent.id,
  };
}

/**
 * Verify a webhook signature and construct the event
 */
export function constructWebhookEvent(
  payload: string,
  signature: string,
  webhookSecret: string,
): Stripe.Event {
  if (!stripe) {
    throw new Error("Stripe is not configured");
  }

  return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
}
