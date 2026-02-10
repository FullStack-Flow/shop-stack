/**
 * Vendor Connect Server Functions
 *
 * Server functions for vendor Stripe Connect operations.
 * Handles onboarding, status checking, and dashboard access.
 */

import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { shops, vendors } from "@/lib/db/schema/shop-schema";
import { authMiddleware } from "@/lib/middleware/auth";
import {
  createAccountLink,
  createConnectedAccount,
  createLoginLink,
  getAccountStatus as getStripeAccountStatus,
} from "@/lib/stripe/connect";
import type { StripeConnectStatus } from "@/types/orders";

// ============================================================================
// Validators
// ============================================================================

const startOnboardingSchema = z.object({
  shopSlug: z.string(),
  returnPath: z.string().optional(),
});

const getStatusSchema = z.object({
  shopSlug: z.string(),
});

// ============================================================================
// Start Stripe Onboarding
// ============================================================================

/**
 * Start or continue Stripe Connect onboarding
 * Returns a URL to redirect the vendor to Stripe's hosted onboarding
 */
export const startStripeOnboarding = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator(startOnboardingSchema)
  .handler(async ({ context, data }): Promise<{ url: string }> => {
    const userId = context.session?.user?.id;
    const { shopSlug, returnPath } = data;

    if (!userId) {
      throw new Error("Unauthorized");
    }

    // Get vendor for current user
    const vendor = await db.query.vendors.findFirst({
      where: eq(vendors.userId, userId),
    });

    if (!vendor) {
      throw new Error("Vendor profile not found");
    }

    // Verify the user owns this shop
    const shop = await db.query.shops.findFirst({
      where: eq(shops.slug, shopSlug),
    });

    if (!shop || shop.vendorId !== vendor.id) {
      throw new Error("Shop not found or unauthorized");
    }

    let accountId = vendor.stripeConnectedAccountId;

    // Create connected account if not exists
    if (!accountId) {
      const account = await createConnectedAccount(
        vendor.contactEmail || context.session.user.email,
        vendor.businessName || shop.name,
        { vendorId: vendor.id, shopSlug },
      );

      if (!account) {
        throw new Error("Failed to create Stripe account");
      }

      accountId = account.id;

      // Save the account ID
      await db
        .update(vendors)
        .set({ stripeConnectedAccountId: accountId })
        .where(eq(vendors.id, vendor.id));
    }

    // Generate account link for onboarding
    const baseUrl = process.env.VITE_APP_URL || "http://localhost:3000";
    const path = returnPath || "settings";
    // Use & if path already contains query params, otherwise use ?
    const separator = path.includes("?") ? "&" : "?";
    const returnUrl = `${baseUrl}/shop/${shopSlug}/${path}${separator}stripe_onboarding=success`;
    const refreshUrl = `${baseUrl}/shop/${shopSlug}/${path}${separator}stripe_onboarding=refresh`;

    const onboardingUrl = await createAccountLink(
      accountId,
      refreshUrl,
      returnUrl,
    );

    return { url: onboardingUrl };
  });

// ============================================================================
// Get Stripe Account Status
// ============================================================================

/**
 * Get the current Stripe Connect status for a vendor
 */
export const getVendorStripeStatus = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .inputValidator(getStatusSchema)
  .handler(async ({ context, data }): Promise<StripeConnectStatus> => {
    const userId = context.session?.user?.id;
    // shopSlug is validated but we fetch by userId for security
    void data.shopSlug;

    if (!userId) {
      throw new Error("Unauthorized");
    }

    // Get vendor for current user
    const vendor = await db.query.vendors.findFirst({
      where: eq(vendors.userId, userId),
    });

    if (!vendor) {
      throw new Error("Vendor profile not found");
    }

    // If no connected account, return not connected status
    if (!vendor.stripeConnectedAccountId) {
      return {
        isConnected: false,
        onboardingComplete: false,
        chargesEnabled: false,
        payoutsEnabled: false,
        accountId: null,
        requiresAction: false,
      };
    }

    // Get live status from Stripe
    const status = await getStripeAccountStatus(
      vendor.stripeConnectedAccountId,
    );

    if (!status) {
      return {
        isConnected: true,
        onboardingComplete: vendor.stripeOnboardingComplete ?? false,
        chargesEnabled: vendor.stripeChargesEnabled ?? false,
        payoutsEnabled: vendor.stripePayoutsEnabled ?? false,
        accountId: vendor.stripeConnectedAccountId,
        requiresAction: false,
      };
    }

    // Check if there are pending requirements
    const requiresAction =
      !status.detailsSubmitted ||
      (status.requirements?.currently_due?.length ?? 0) > 0;

    return {
      isConnected: true,
      onboardingComplete: status.detailsSubmitted,
      chargesEnabled: status.chargesEnabled,
      payoutsEnabled: status.payoutsEnabled,
      accountId: vendor.stripeConnectedAccountId,
      requiresAction,
    };
  });

// ============================================================================
// Get Stripe Dashboard Link
// ============================================================================

/**
 * Get a login link for the Stripe Express Dashboard
 */
export const getStripeDashboardLink = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<{ url: string }> => {
    const userId = context.session?.user?.id;

    if (!userId) {
      throw new Error("Unauthorized");
    }

    // Get vendor for current user
    const vendor = await db.query.vendors.findFirst({
      where: eq(vendors.userId, userId),
    });

    if (!vendor) {
      throw new Error("Vendor profile not found");
    }

    if (!vendor.stripeConnectedAccountId) {
      throw new Error("No Stripe account connected");
    }

    if (!vendor.stripeOnboardingComplete) {
      throw new Error("Please complete Stripe onboarding first");
    }

    const url = await createLoginLink(vendor.stripeConnectedAccountId);

    return { url };
  });

// ============================================================================
// Disconnect Stripe Account
// ============================================================================

/**
 * Disconnect and delete the vendor's Stripe Connect account
 */
export const disconnectStripeAccount = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<{ success: boolean }> => {
    const userId = context.session?.user?.id;

    if (!userId) {
      throw new Error("Unauthorized");
    }

    // Get vendor for current user
    const vendor = await db.query.vendors.findFirst({
      where: eq(vendors.userId, userId),
    });

    if (!vendor) {
      throw new Error("Vendor profile not found");
    }

    if (!vendor.stripeConnectedAccountId) {
      throw new Error("No Stripe account connected");
    }

    // Delete the Stripe account
    const { deleteConnectedAccount } = await import("@/lib/stripe/connect");
    await deleteConnectedAccount(vendor.stripeConnectedAccountId);

    // Clear Stripe data from database
    await db
      .update(vendors)
      .set({
        stripeConnectedAccountId: null,
        stripeOnboardingComplete: false,
        stripeChargesEnabled: false,
        stripePayoutsEnabled: false,
      })
      .where(eq(vendors.id, vendor.id));

    return { success: true };
  });
