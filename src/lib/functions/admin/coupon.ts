/**
 * Admin Coupon Server Functions
 *
 * Server functions for coupon management in the admin dashboard.
 * Admins can view and manage ALL coupons across all vendors and shops.
 */

import { createServerFn } from "@tanstack/react-start";
import { eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { coupons } from "@/lib/db/schema/coupon-schema";
import { shops } from "@/lib/db/schema/shop-schema";
import {
  executeCouponQuery,
  fetchCouponWithRelations,
} from "@/lib/helper/coupon-query-helpers";
import { adminMiddleware } from "@/lib/middleware/admin";
import {
  type AdminCouponsQuery,
  adminCouponsQuerySchema,
  deleteCouponSchema,
  getCouponByIdSchema,
  toggleCouponActiveSchema,
} from "@/lib/validators/shared/coupon-query";
import {
  createSuccessResponse,
  emptyPaginatedResponse,
} from "@/types/api-response";
import type { CouponListResponse, NormalizedCoupon } from "@/types/coupons";

// ============================================================================
// Get All Coupons (Admin)
// ============================================================================

/**
 * Get all coupons with optional filtering by shop/vendor
 * Admins can see all coupons across all vendors
 */
export const getAdminCoupons = createServerFn({ method: "GET" })
  .middleware([adminMiddleware])
  .inputValidator(adminCouponsQuerySchema)
  .handler(async ({ data }): Promise<CouponListResponse> => {
    const {
      shopId,
      vendorId,
      limit,
      offset,
      search,
      type,
      status,
      isActive,
      applicableTo,
      sortBy,
      sortDirection,
    } = data as AdminCouponsQuery;

    // Build base conditions for admin scope
    const baseConditions = [];

    // Filter by specific shop if provided
    if (shopId) {
      baseConditions.push(eq(coupons.shopId, shopId));
    }

    // Filter by vendor (get all shops for the vendor first)
    if (vendorId) {
      const vendorShops = await db
        .select({ id: shops.id })
        .from(shops)
        .where(eq(shops.vendorId, vendorId));

      if (vendorShops.length > 0) {
        baseConditions.push(
          inArray(
            coupons.shopId,
            vendorShops.map((s) => s.id),
          ),
        );
      } else {
        return emptyPaginatedResponse<NormalizedCoupon>(limit!, offset!);
      }
    }

    // Execute query using shared helper
    return executeCouponQuery({
      baseConditions,
      search,
      type,
      status,
      isActive,
      applicableTo,
      limit,
      offset,
      sortBy,
      sortDirection,
      includeShopInfo: true,
      includeLinkedItems: false, // Don't fetch linked items for list view
    });
  });

// ============================================================================
// Get Coupon by ID (Admin)
// ============================================================================

/**
 * Get a single coupon by ID (admin can view any coupon)
 */
export const getAdminCouponById = createServerFn({ method: "GET" })
  .middleware([adminMiddleware])
  .inputValidator(getCouponByIdSchema)
  .handler(async ({ data }) => {
    const { id } = data;

    const [coupon] = await db.select().from(coupons).where(eq(coupons.id, id));

    if (!coupon) {
      throw new Error("Coupon not found.");
    }

    const normalizedCoupon = await fetchCouponWithRelations(coupon, {
      includeShopInfo: true,
      includeLinkedItems: true,
    });

    return { coupon: normalizedCoupon };
  });

// ============================================================================
// Toggle Active Status (Admin)
// ============================================================================

/**
 * Toggle coupon active status
 */
export const toggleAdminCouponActive = createServerFn({ method: "POST" })
  .middleware([adminMiddleware])
  .inputValidator(toggleCouponActiveSchema)
  .handler(async ({ data }) => {
    const { id, isActive } = data;

    const [existingCoupon] = await db
      .select()
      .from(coupons)
      .where(eq(coupons.id, id));

    if (!existingCoupon) {
      throw new Error("Coupon not found.");
    }

    await db.update(coupons).set({ isActive }).where(eq(coupons.id, id));

    return createSuccessResponse(
      isActive ? "Coupon activated" : "Coupon deactivated",
    );
  });

// ============================================================================
// Delete Coupon (Admin)
// ============================================================================

/**
 * Delete a coupon (admin can delete any coupon)
 */
export const deleteAdminCoupon = createServerFn({ method: "POST" })
  .middleware([adminMiddleware])
  .inputValidator(deleteCouponSchema)
  .handler(async ({ data }) => {
    const { id } = data;

    const [existingCoupon] = await db
      .select()
      .from(coupons)
      .where(eq(coupons.id, id));

    if (!existingCoupon) {
      throw new Error("Coupon not found.");
    }

    // Check usage count
    if (existingCoupon.usageCount > 0) {
      // Soft delete might be preferred, but for now we'll allow deletion
      // You could add a warning here if needed
    }

    await db.delete(coupons).where(eq(coupons.id, id));

    return createSuccessResponse("Coupon deleted successfully");
  });
