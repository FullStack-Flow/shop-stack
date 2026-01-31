/**
 * Coupon Server Functions
 *
 * Server functions for coupon management in the vendor dashboard.
 * Uses TanStack Start's createServerFn with Zod validation.
 */

import { createServerFn } from "@tanstack/react-start";
import { and, count, eq, gte, ilike, lte } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import { db } from "@/lib/db";
import {
  couponCategories,
  couponProducts,
  coupons,
  couponUsage,
} from "@/lib/db/schema/coupon-schema";
import {
  executeCouponQuery,
  fetchCouponWithRelations,
} from "@/lib/helper/coupon-query-helpers";
import { requireShopAccess } from "@/lib/helper/vendor";

import { authMiddleware } from "@/lib/middleware/auth";
import {
  createCouponSchema,
  deleteCouponSchema,
  getAvailableCouponsForUserSchema,
  getCouponByCodeSchema,
  getCouponByIdSchema,
  updateCouponSchema,
  validateCouponSchema,
  vendorCouponsQuerySchema,
} from "@/lib/validators/shared/coupon-query";
import { createSuccessResponse } from "@/types/api-response";
import type {
  AvailableCouponsResponse,
  CouponListResponse,
  CreateCouponResponse,
  DeleteCouponResponse,
  UpdateCouponResponse,
  ValidateCouponResponse,
} from "@/types/coupons";

// ============================================================================
// Get Coupons (List with Pagination)
// ============================================================================

export const getCoupons = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .inputValidator(vendorCouponsQuerySchema)
  .handler(async ({ context, data }): Promise<CouponListResponse> => {
    const userId = context.session.user.id;
    const {
      shopId,
      limit,
      offset,
      search,
      type,
      status,
      isActive,
      applicableTo,
      sortBy,
      sortDirection,
    } = data;

    // Verify shop access (vendor ownership or admin)
    await requireShopAccess(userId, shopId);

    // Use shared query helper
    return executeCouponQuery({
      baseConditions: [eq(coupons.shopId, shopId)],
      search,
      type,
      status,
      isActive,
      applicableTo,
      limit,
      offset,
      sortBy: sortBy as any,
      sortDirection,
      includeShopInfo: false,
      includeVendorInfo: false,
    });
  });

// ============================================================================
// Get Coupon by ID
// ============================================================================

export const getCouponById = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .inputValidator(
    getCouponByIdSchema.extend({
      shopId: z.string().min(1, "Shop ID is required"),
    }),
  )
  .handler(async ({ context, data }) => {
    const userId = context.session.user.id;
    const { id, shopId } = data;

    // Verify shop access (vendor ownership or admin)
    await requireShopAccess(userId, shopId);

    // Get coupon
    const coupon = await db.query.coupons.findFirst({
      where: and(eq(coupons.id, id), eq(coupons.shopId, shopId)),
    });

    if (!coupon) {
      throw new Error("Coupon not found.");
    }

    // Use shared helper for fetching with relations
    const normalizedCoupon = await fetchCouponWithRelations(coupon, {
      includeShopInfo: false,
      includeVendorInfo: false,
    });

    return { coupon: normalizedCoupon };
  });

// ============================================================================
// Get Coupon by Code (for validation)
// ============================================================================

export const getCouponByCode = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .inputValidator(getCouponByCodeSchema)
  .handler(async ({ context, data }) => {
    const userId = context.session.user.id;
    const { code, shopId } = data;

    // Verify shop access (vendor ownership or admin)
    await requireShopAccess(userId, shopId);

    // Get coupon by code (case-insensitive)
    const coupon = await db.query.coupons.findFirst({
      where: and(eq(coupons.shopId, shopId), ilike(coupons.code, code)),
    });

    if (!coupon) {
      throw new Error("Coupon not found.");
    }

    // Use shared helper for fetching with relations
    const normalizedCoupon = await fetchCouponWithRelations(coupon, {
      includeShopInfo: false,
      includeVendorInfo: false,
    });

    return { coupon: normalizedCoupon };
  });

// ============================================================================
// Create Coupon
// ============================================================================

export const createCoupon = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator(createCouponSchema)
  .handler(async ({ context, data }): Promise<CreateCouponResponse> => {
    const userId = context.session.user.id;
    const { shopId, productIds, categoryIds, ...couponData } = data;

    // Verify shop access (vendor ownership or admin)
    await requireShopAccess(userId, shopId);

    // Check for duplicate code within the shop
    const existingCoupon = await db.query.coupons.findFirst({
      where: and(
        eq(coupons.shopId, shopId),
        ilike(coupons.code, couponData.code),
      ),
    });

    if (existingCoupon) {
      throw new Error(
        "A coupon with this code already exists in this shop. Please choose a different code.",
      );
    }

    // Parse dates
    const activeFromDate = new Date(couponData.activeFrom);
    const activeToDate = new Date(couponData.activeTo);

    // Create the coupon
    const couponId = uuidv4();

    await db.insert(coupons).values({
      id: couponId,
      shopId: shopId,
      code: couponData.code,
      description: couponData.description || null,
      image: couponData.image || null,
      type: couponData.type,
      discountAmount: String(couponData.discountAmount),
      minimumCartAmount: String(couponData.minimumCartAmount),
      maximumDiscountAmount: couponData.maximumDiscountAmount
        ? String(couponData.maximumDiscountAmount)
        : null,
      activeFrom: activeFromDate,
      activeTo: activeToDate,
      usageLimit: couponData.usageLimit || null,
      usageLimitPerUser: couponData.usageLimitPerUser ?? 1,
      usageCount: 0,
      isActive: couponData.isActive ?? true,
      applicableTo: couponData.applicableTo ?? "all",
      status: "active", // Default status
    });

    // Insert product/category links if applicable
    const insertPromises: Promise<any>[] = [];

    if (
      couponData.applicableTo === "specific_products" &&
      productIds &&
      productIds.length > 0
    ) {
      const productRecords = productIds.map((productId) => ({
        couponId,
        productId,
      }));
      insertPromises.push(db.insert(couponProducts).values(productRecords));
    }

    if (
      couponData.applicableTo === "specific_categories" &&
      categoryIds &&
      categoryIds.length > 0
    ) {
      const categoryRecords = categoryIds.map((categoryId) => ({
        couponId,
        categoryId,
      }));
      insertPromises.push(db.insert(couponCategories).values(categoryRecords));
    }

    await Promise.all(insertPromises);

    // Fetch the created coupon
    const newCoupon = await db.query.coupons.findFirst({
      where: eq(coupons.id, couponId),
    });

    if (!newCoupon) {
      throw new Error("Failed to create coupon.");
    }

    // Use shared helper for fetching with relations
    const normalizedCoupon = await fetchCouponWithRelations(newCoupon, {
      includeShopInfo: false,
      includeVendorInfo: false,
    });

    return {
      ...createSuccessResponse("Coupon created successfully"),
      coupon: normalizedCoupon,
    };
  });

// ============================================================================
// Update Coupon
// ============================================================================

export const updateCoupon = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator(updateCouponSchema)
  .handler(async ({ context, data }): Promise<UpdateCouponResponse> => {
    const userId = context.session.user.id;
    const { id, shopId, productIds, categoryIds, ...updateData } = data;

    // Verify shop access (vendor ownership or admin)
    await requireShopAccess(userId, shopId);

    // Check if coupon exists
    const existingCoupon = await db.query.coupons.findFirst({
      where: and(eq(coupons.id, id), eq(coupons.shopId, shopId)),
    });

    if (!existingCoupon) {
      throw new Error("Coupon not found.");
    }

    // Check for duplicate code if code is being updated
    if (updateData.code && updateData.code !== existingCoupon.code) {
      const codeExists = await db.query.coupons.findFirst({
        where: and(
          eq(coupons.shopId, shopId),
          ilike(coupons.code, updateData.code),
        ),
      });

      if (codeExists) {
        throw new Error("A coupon with this code already exists in this shop.");
      }
    }

    // Build update object
    const updateValues: Record<string, any> = {};

    if (updateData.code !== undefined) updateValues.code = updateData.code;
    if (updateData.description !== undefined)
      updateValues.description = updateData.description;
    if (updateData.image !== undefined)
      updateValues.image = updateData.image || null;
    if (updateData.type !== undefined) updateValues.type = updateData.type;
    if (updateData.discountAmount !== undefined)
      updateValues.discountAmount = String(updateData.discountAmount);
    if (updateData.minimumCartAmount !== undefined)
      updateValues.minimumCartAmount = String(updateData.minimumCartAmount);
    if (updateData.maximumDiscountAmount !== undefined)
      updateValues.maximumDiscountAmount = updateData.maximumDiscountAmount
        ? String(updateData.maximumDiscountAmount)
        : null;
    if (updateData.activeFrom !== undefined)
      updateValues.activeFrom = new Date(updateData.activeFrom);
    if (updateData.activeTo !== undefined)
      updateValues.activeTo = new Date(updateData.activeTo);
    if (updateData.usageLimit !== undefined)
      updateValues.usageLimit = updateData.usageLimit;
    if (updateData.usageLimitPerUser !== undefined)
      updateValues.usageLimitPerUser = updateData.usageLimitPerUser;
    if (updateData.isActive !== undefined)
      updateValues.isActive = updateData.isActive;
    if (updateData.applicableTo !== undefined)
      updateValues.applicableTo = updateData.applicableTo;

    // Update the coupon
    if (Object.keys(updateValues).length > 0) {
      await db.update(coupons).set(updateValues).where(eq(coupons.id, id));
    }

    // Update product/category links if applicableTo changed or IDs provided
    const newApplicableTo =
      updateData.applicableTo ?? existingCoupon.applicableTo;

    const promises: Promise<any>[] = [];

    // Clear existing links if applicableTo changed
    if (
      updateData.applicableTo !== undefined &&
      updateData.applicableTo !== existingCoupon.applicableTo
    ) {
      promises.push(
        db.delete(couponProducts).where(eq(couponProducts.couponId, id)),
        db.delete(couponCategories).where(eq(couponCategories.couponId, id)),
      );
    }

    // Insert new links
    if (newApplicableTo === "specific_products" && productIds !== undefined) {
      // Clear and re-insert product links (if not already cleared above)
      if (
        updateData.applicableTo === undefined ||
        updateData.applicableTo === existingCoupon.applicableTo
      ) {
        promises.push(
          db.delete(couponProducts).where(eq(couponProducts.couponId, id)),
        );
      }

      if (productIds.length > 0) {
        // Need to wait for delete to finish before inserting if using promises in parallel on same table?
        // Drizzle batch or sequence is better. But here we push to promises array.
        // If we push delete then insert to Promise.all, order is not guaranteed.
        // Better to await deletes first.
      }
    }

    // Re-structure update logic to be safe
    // 1. Update coupon details
    // 2. Manage relations

    if (
      newApplicableTo === "specific_products" &&
      productIds !== undefined &&
      productIds.length >= 0
    ) {
      await db.delete(couponProducts).where(eq(couponProducts.couponId, id));
      if (productIds.length > 0) {
        const productRecords = productIds.map((productId) => ({
          couponId: id,
          productId,
        }));
        await db.insert(couponProducts).values(productRecords);
      }
    }

    if (
      newApplicableTo === "specific_categories" &&
      categoryIds !== undefined &&
      categoryIds.length >= 0
    ) {
      await db
        .delete(couponCategories)
        .where(eq(couponCategories.couponId, id));
      if (categoryIds.length > 0) {
        const categoryRecords = categoryIds.map((categoryId) => ({
          couponId: id,
          categoryId,
        }));
        await db.insert(couponCategories).values(categoryRecords);
      }
    }

    // Fetch updated coupon
    const updatedCoupon = await db.query.coupons.findFirst({
      where: eq(coupons.id, id),
    });

    if (!updatedCoupon) {
      throw new Error("Failed to update coupon.");
    }

    // Use shared helper for fetching with relations
    const normalizedCoupon = await fetchCouponWithRelations(updatedCoupon, {
      includeShopInfo: false,
      includeVendorInfo: false,
    });

    return {
      ...createSuccessResponse("Coupon updated successfully"),
      coupon: normalizedCoupon,
    };
  });

// ============================================================================
// Delete Coupon
// ============================================================================

export const deleteCoupon = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator(
    deleteCouponSchema.extend({
      shopId: z.string().min(1, "Shop ID is required"),
    }),
  )
  .handler(async ({ context, data }): Promise<DeleteCouponResponse> => {
    const userId = context.session.user.id;
    const { id, shopId } = data;

    // Verify shop access (vendor ownership or admin)
    await requireShopAccess(userId, shopId);

    // Check if coupon exists
    const existingCoupon = await db.query.coupons.findFirst({
      where: and(eq(coupons.id, id), eq(coupons.shopId, shopId)),
    });

    if (!existingCoupon) {
      throw new Error("Coupon not found.");
    }

    // Delete the coupon (junction tables will cascade)
    await db.delete(coupons).where(eq(coupons.id, id));

    return createSuccessResponse("Coupon deleted successfully");
  });

// ============================================================================
// Validate Coupon (Enhanced - for checkout)
// ============================================================================

export const validateCoupon = createServerFn({ method: "POST" })
  .inputValidator(validateCouponSchema)
  .handler(async ({ data }): Promise<ValidateCouponResponse> => {
    const { code, shopId, cartAmount, userId, cartItems } = data;
    const _cartAmountValue = parseFloat(cartAmount);

    // Find the coupon
    const coupon = await db.query.coupons.findFirst({
      where: and(eq(coupons.shopId, shopId), ilike(coupons.code, code)),
    });

    if (!coupon) {
      return {
        valid: false,
        message: "Invalid coupon code.",
        invalidReason: "not_found",
      };
    }

    const normalizedCoupon = await fetchCouponWithRelations(coupon, {
      includeShopInfo: false,
      includeVendorInfo: false,
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
      const userUsageResult = await db
        .select({ count: count() })
        .from(couponUsage)
        .where(
          and(
            eq(couponUsage.couponId, coupon.id),
            eq(couponUsage.userId, userId),
          ),
        );
      const userUsageCount = Number(userUsageResult[0]?.count ?? 0);
      if (userUsageCount >= coupon.usageLimitPerUser) {
        return {
          valid: false,
          coupon: normalizedCoupon,
          message: `You have already used this coupon ${userUsageCount} time(s).`,
          invalidReason: "user_limit_reached",
        };
      }
    }

    // Calculate applicable amount based on product/category restrictions
    let applicableAmount = _cartAmountValue;

    if (cartItems && cartItems.length > 0) {
      if (coupon.applicableTo === "specific_products") {
        const couponProductIds = normalizedCoupon.productIds ?? [];
        const couponProductIdSet = new Set(couponProductIds);
        applicableAmount = cartItems
          .filter((item) => couponProductIdSet.has(item.productId))
          .reduce(
            (sum, item) => sum + parseFloat(item.price) * item.quantity,
            0,
          );
      } else if (coupon.applicableTo === "specific_categories") {
        const couponCategoryIds = normalizedCoupon.categoryIds ?? [];
        const couponCategoryIdSet = new Set(couponCategoryIds);
        applicableAmount = cartItems
          .filter(
            (item) =>
              item.categoryId && couponCategoryIdSet.has(item.categoryId),
          )
          .reduce(
            (sum, item) => sum + parseFloat(item.price) * item.quantity,
            0,
          );
      }
    }

    // Check if any products are applicable
    if (applicableAmount === 0 && coupon.applicableTo !== "all") {
      return {
        valid: false,
        coupon: normalizedCoupon,
        message: "This coupon doesn't apply to any items in your cart.",
        invalidReason: "no_applicable_products",
      };
    }

    // Check minimum cart amount
    const minimumAmount = parseFloat(coupon.minimumCartAmount);
    if (_cartAmountValue < minimumAmount) {
      return {
        valid: false,
        coupon: normalizedCoupon,
        message: `Minimum order amount of $${minimumAmount.toFixed(2)} required for applicable items.`,
        invalidReason: "minimum_not_met",
      };
    }

    // Calculate discount amount (on applicable items only)
    let discountAmount = 0;
    const couponValue = parseFloat(coupon.discountAmount);

    switch (coupon.type) {
      case "percentage":
        discountAmount = (applicableAmount * couponValue) / 100;
        break;
      case "fixed":
        discountAmount = Math.min(couponValue, applicableAmount);
        break;
      case "free_shipping":
        discountAmount = 0; // Handled at checkout level
        break;
    }

    // Apply maximum discount cap
    if (coupon.maximumDiscountAmount) {
      const maxDiscount = parseFloat(coupon.maximumDiscountAmount);
      if (discountAmount > maxDiscount) {
        discountAmount = maxDiscount;
      }
    }

    return {
      valid: true,
      coupon: normalizedCoupon,
      discountAmount,
      applicableAmount,
      message: "Coupon validated successfully.",
    };
  });

// ============================================================================
// Available Coupons for User
// ============================================================================

export const getAvailableCouponsForUser = createServerFn({ method: "GET" })
  .inputValidator(getAvailableCouponsForUserSchema)
  .handler(async ({ data }): Promise<AvailableCouponsResponse> => {
    const { shopId, userId } = data;
    const now = new Date();

    const activeCoupons = await db.query.coupons.findMany({
      where: and(
        eq(coupons.shopId, shopId),
        eq(coupons.isActive, true),
        lte(coupons.activeFrom, now),
        gte(coupons.activeTo, now),
      ),
    });

    if (activeCoupons.length === 0) {
      return { coupons: [] };
    }

    const availableCoupons: AvailableCouponsResponse["coupons"] = [];

    for (const coupon of activeCoupons) {
      // Check total usage
      if (
        coupon.usageLimit !== null &&
        coupon.usageCount >= coupon.usageLimit
      ) {
        continue;
      }

      // Check per-user usage
      let userUsageCount = 0;
      if (userId && coupon.usageLimitPerUser) {
        const userUsageResult = await db
          .select({ count: count() })
          .from(couponUsage)
          .where(
            and(
              eq(couponUsage.couponId, coupon.id),
              eq(couponUsage.userId, userId),
            ),
          );
        userUsageCount = Number(userUsageResult[0]?.count ?? 0);
        if (userUsageCount >= coupon.usageLimitPerUser) {
          continue;
        }
      }

      const normalized = await fetchCouponWithRelations(coupon, {
        includeShopInfo: false,
        includeVendorInfo: false,
      });
      availableCoupons.push({
        ...normalized,
        userUsageCount,
        isEligible: true,
      });
    }

    return { coupons: availableCoupons };
  });
