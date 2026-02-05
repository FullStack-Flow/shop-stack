/**
 * Store Front Coupon Server Functions
 *
 * Public server functions for the storefront/customer-facing pages.
 * Handles coupon validation and retrieval for checkout.
 * Only returns active and valid coupons.
 */

import { createServerFn } from "@tanstack/react-start";
import { and, count, eq, gte, ilike, lte } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { coupons, couponUsage } from "@/lib/db/schema/coupon-schema";
import {
  executeCouponQuery,
  fetchCouponWithRelations,
  getActiveCouponsForShop,
} from "@/lib/helper/coupon-query-helpers";
import {
  getCouponByCodeSchema,
  type StoreCouponsQuery,
  storeCouponsQuerySchema,
  validateCouponSchema,
} from "@/lib/validators/shared/coupon-query";
import {
  createPaginatedResponse,
  emptyPaginatedResponse,
} from "@/types/api-response";
import type {
  CouponListResponse,
  NormalizedCoupon,
  ValidateCouponResponse,
} from "@/types/coupons";

// ============================================================================
// Get Active Coupons (Store Front - Public)
// ============================================================================

/**
 * Get currently active coupons for a shop
 * No authentication required
 */
export const getStoreCoupons = createServerFn({ method: "GET" })
  .inputValidator(storeCouponsQuerySchema)
  .handler(async ({ data }): Promise<CouponListResponse> => {
    const { limit, offset, search, shopId, shopSlug } =
      data as StoreCouponsQuery;

    // Resolve shop ID if only slug is provided
    let resolvedShopId = shopId;
    if (shopSlug && !shopId) {
      const { shops } = await import("@/lib/db/schema/shop-schema");
      const [shop] = await db
        .select({ id: shops.id })
        .from(shops)
        .where(eq(shops.slug, shopSlug));

      if (shop) {
        resolvedShopId = shop.id;
      } else {
        return emptyPaginatedResponse<NormalizedCoupon>(limit!, offset!);
      }
    }

    if (!resolvedShopId) {
      return emptyPaginatedResponse<NormalizedCoupon>(limit!, offset!);
    }

    const now = new Date();

    // Base conditions: only active coupons within valid date range
    const baseConditions = [
      eq(coupons.shopId, resolvedShopId),
      eq(coupons.isActive, true),
      lte(coupons.activeFrom, now),
      gte(coupons.activeTo, now),
    ];

    // Execute query using shared helper
    const result = await executeCouponQuery({
      baseConditions,
      search,
      limit,
      offset,
      sortBy: "createdAt",
      sortDirection: "desc",
      includeShopInfo: true,
      includeLinkedItems: false, // Don't need linked items for listing
    });

    return createPaginatedResponse(
      result.data,
      result.total,
      result.limit,
      result.offset,
    );
  });

// ============================================================================
// Get Coupon by Code (Store Front - Public)
// ============================================================================

/**
 * Get a coupon by its code for display purposes
 */
export const getStoreCouponByCode = createServerFn({ method: "GET" })
  .inputValidator(getCouponByCodeSchema)
  .handler(async ({ data }) => {
    const { code, shopId, shopSlug } = data;

    // Resolve shop ID if only slug is provided
    let resolvedShopId = shopId;
    if (shopSlug && !shopId) {
      const { shops } = await import("@/lib/db/schema/shop-schema");
      const [shop] = await db
        .select({ id: shops.id })
        .from(shops)
        .where(eq(shops.slug, shopSlug));

      if (shop) {
        resolvedShopId = shop.id;
      } else {
        throw new Error("Shop not found.");
      }
    }

    if (!resolvedShopId) {
      throw new Error("Shop ID is required.");
    }

    // Get coupon by code (case-insensitive)
    const [coupon] = await db
      .select()
      .from(coupons)
      .where(
        and(eq(coupons.shopId, resolvedShopId), ilike(coupons.code, code)),
      );

    if (!coupon) {
      throw new Error("Coupon not found.");
    }

    const normalizedCoupon = await fetchCouponWithRelations(coupon, {
      includeShopInfo: true,
      includeLinkedItems: true,
    });

    return {
      coupon: normalizedCoupon,
    };
  });

// ============================================================================
// Validate Coupon (Store Front - for Checkout)
// ============================================================================

/**
 * Validate a coupon code for checkout
 * Checks all conditions: active, dates, usage limits, minimum cart, etc.
 */
export const validateStoreCoupon = createServerFn({ method: "POST" })
  .inputValidator(validateCouponSchema)
  .handler(async ({ data }): Promise<ValidateCouponResponse> => {
    const { code, shopId, cartAmount, userId, cartItems } = data;

    // Find the coupon
    const [coupon] = await db
      .select()
      .from(coupons)
      .where(and(eq(coupons.shopId, shopId), ilike(coupons.code, code)));

    if (!coupon) {
      return {
        valid: false,
        message: "Invalid coupon code.",
        invalidReason: "not_found",
      };
    }

    const normalizedCoupon = await fetchCouponWithRelations(coupon, {
      includeShopInfo: true,
      includeLinkedItems: true,
    });

    const now = new Date();

    // Check if coupon is active
    if (!coupon.isActive) {
      return {
        valid: false,
        coupon: normalizedCoupon,
        message: "This coupon is currently inactive.",
        invalidReason: "inactive",
      };
    }

    // Check if coupon has started
    if (now < coupon.activeFrom) {
      return {
        valid: false,
        coupon: normalizedCoupon,
        message: "This coupon is not yet active.",
        invalidReason: "not_started",
      };
    }

    // Check if coupon has expired
    if (now > coupon.activeTo) {
      return {
        valid: false,
        coupon: normalizedCoupon,
        message: "This coupon has expired.",
        invalidReason: "expired",
      };
    }

    // Check total usage limit
    if (coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit) {
      return {
        valid: false,
        coupon: normalizedCoupon,
        message: "This coupon has reached its usage limit.",
        invalidReason: "usage_limit_reached",
      };
    }

    // Check per-user usage limit
    if (userId && coupon.usageLimitPerUser) {
      const [userUsage] = await db
        .select({ count: count() })
        .from(couponUsage)
        .where(
          and(
            eq(couponUsage.couponId, coupon.id),
            eq(couponUsage.userId, userId),
          ),
        );

      if ((userUsage?.count ?? 0) >= coupon.usageLimitPerUser) {
        return {
          valid: false,
          coupon: normalizedCoupon,
          message:
            "You have already used this coupon the maximum number of times.",
          invalidReason: "user_limit_reached",
        };
      }
    }

    // Check minimum cart amount
    const minimumCartAmount = parseFloat(coupon.minimumCartAmount);
    const cartAmountNumber = parseFloat(cartAmount);
    if (cartAmountNumber < minimumCartAmount) {
      return {
        valid: false,
        coupon: normalizedCoupon,
        message: `Minimum cart amount of $${minimumCartAmount.toFixed(2)} required.`,
        invalidReason: "minimum_not_met",
      };
    }

    // Calculate discount
    let discountAmount = 0;
    let applicableAmount = cartAmountNumber;

    // Handle product/category restrictions
    if (coupon.applicableTo === "specific_products" && cartItems) {
      const productIds = normalizedCoupon.productIds ?? [];
      const applicableItems = cartItems.filter((item) =>
        productIds.includes(item.productId),
      );

      if (applicableItems.length === 0) {
        return {
          valid: false,
          coupon: normalizedCoupon,
          message: "This coupon doesn't apply to any items in your cart.",
          invalidReason: "no_applicable_products",
        };
      }

      applicableAmount = applicableItems.reduce(
        (sum, item) => sum + parseFloat(item.price) * item.quantity,
        0,
      );
    } else if (coupon.applicableTo === "specific_categories" && cartItems) {
      const categoryIds = normalizedCoupon.categoryIds ?? [];
      const applicableItems = cartItems.filter(
        (item) => item.categoryId && categoryIds.includes(item.categoryId),
      );

      if (applicableItems.length === 0) {
        return {
          valid: false,
          coupon: normalizedCoupon,
          message: "This coupon doesn't apply to any items in your cart.",
          invalidReason: "no_applicable_products",
        };
      }

      applicableAmount = applicableItems.reduce(
        (sum, item) => sum + parseFloat(item.price) * item.quantity,
        0,
      );
    }

    // Calculate final discount based on coupon type
    const discountValue = parseFloat(coupon.discountAmount);

    if (coupon.type === "percentage") {
      discountAmount = (applicableAmount * discountValue) / 100;
    } else if (coupon.type === "fixed") {
      discountAmount = Math.min(discountValue, applicableAmount);
    } else if (coupon.type === "free_shipping") {
      discountAmount = 0; // Shipping cost handling would be separate
    }

    // Apply maximum discount cap if set
    const maximumDiscount = coupon.maximumDiscountAmount
      ? parseFloat(coupon.maximumDiscountAmount)
      : null;

    if (maximumDiscount !== null && discountAmount > maximumDiscount) {
      discountAmount = maximumDiscount;
    }

    return {
      valid: true,
      coupon: normalizedCoupon,
      discountAmount,
      applicableAmount,
      message: "Coupon applied successfully!",
    };
  });

// ============================================================================
// Get Featured/Promotional Coupons (Public)
// ============================================================================

/**
 * Get featured/promotional coupons for display on homepage or banners
 */
export const getFeaturedCoupons = createServerFn({ method: "GET" })
  .inputValidator(
    z.object({
      shopSlug: z.string().optional(),
      shopId: z.string().optional(),
      limit: z.coerce.number().min(1).max(10).optional().default(5),
    }),
  )
  .handler(async ({ data }) => {
    const { shopSlug, shopId, limit } = data;

    // Resolve shop ID
    let resolvedShopId = shopId;
    if (shopSlug && !shopId) {
      const { shops } = await import("@/lib/db/schema/shop-schema");
      const [shop] = await db
        .select({ id: shops.id })
        .from(shops)
        .where(eq(shops.slug, shopSlug));

      if (shop) {
        resolvedShopId = shop.id;
      }
    }

    if (!resolvedShopId) {
      return { coupons: [] };
    }

    const activeCoupons = await getActiveCouponsForShop(resolvedShopId, {
      limit,
      includeShopInfo: true,
    });

    // Sort by discount amount (highest first)
    const sortedCoupons = activeCoupons.sort(
      (a, b) => parseFloat(b.discountAmount) - parseFloat(a.discountAmount),
    );

    return {
      coupons: sortedCoupons,
    };
  });
