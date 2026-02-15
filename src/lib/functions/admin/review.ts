/**
 * Review Server Functions (Admin)
 *
 * Server functions for admin review operations.
 * Admins can view ALL reviews across the platform.
 * Admins can moderate, approve, reject, and delete reviews.
 */

import { createServerFn } from "@tanstack/react-start";
import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema/auth-schema";
import { products } from "@/lib/db/schema/products-schema";
import { productReviews } from "@/lib/db/schema/review-schema";
import { shops } from "@/lib/db/schema/shop-schema";
import {
  batchFetchReviewRelations,
  executeDetailedReviewQuery,
  formatReviewDates,
  requireReview,
  reviewWithShopSelectFields,
  updateProductRating,
} from "@/lib/helper/review-query-helpers";
import { adminMiddleware } from "@/lib/middleware/admin";
import {
  adminDeleteReviewSchema,
  getAdminReviewByIdSchema,
  getAdminReviewsSchema,
  updateReviewStatusSchema,
} from "@/lib/validators/review";
import { createPaginatedResponse } from "@/types/api-response";
import type { AdminReviewResponse, AdminReviewStats } from "@/types/review";

// ============================================================================
// Get All Reviews (Admin)
// ============================================================================

/**
 * Get all reviews across the platform
 * Admin only
 */
export const getAdminReviews = createServerFn({ method: "GET" })
  .middleware([adminMiddleware])
  .inputValidator(getAdminReviewsSchema)
  .handler(async ({ data }) => {
    const {
      shopId,
      productId,
      userId: filterUserId,
      status,
      rating,
      limit,
      offset,
    } = data;

    // Execute query using shared helper
    const result = await executeDetailedReviewQuery({
      shopId,
      productId,
      userId: filterUserId,
      status,
      rating,
      limit,
      offset,
      includeProductImages: true,
      includeVendorInfo: true,
    });

    return createPaginatedResponse(
      result.data as AdminReviewResponse[],
      result.total,
      result.limit,
      result.offset,
    );
  });

// ============================================================================
// Get Admin Review Stats
// ============================================================================

export const getAdminReviewStats = createServerFn({ method: "GET" })
  .middleware([adminMiddleware])
  .handler(async (): Promise<AdminReviewStats> => {
    // Get overall stats
    const [overallStats] = await db
      .select({
        total: sql<number>`count(*)::int`,
        avgRating: sql<number>`avg(${productReviews.rating})::numeric(3,2)`,
      })
      .from(productReviews);

    // Get status breakdown
    const statusStats = await db
      .select({
        status: productReviews.status,
        count: sql<number>`count(*)::int`,
      })
      .from(productReviews)
      .groupBy(productReviews.status);

    let pendingCount = 0;
    let approvedCount = 0;
    let rejectedCount = 0;

    for (const stat of statusStats) {
      if (stat.status === "pending") pendingCount = stat.count;
      if (stat.status === "approved") approvedCount = stat.count;
      if (stat.status === "rejected") rejectedCount = stat.count;
    }

    // Get reviews this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [{ monthCount }] = await db
      .select({ monthCount: sql<number>`count(*)::int` })
      .from(productReviews)
      .where(sql`${productReviews.createdAt} >= ${startOfMonth}`);

    // Get top rated shops
    const topShops = await db
      .select({
        shopId: productReviews.shopId,
        shopName: shops.name,
        avgRating: sql<number>`avg(${productReviews.rating})::numeric(3,2)`,
        reviewCount: sql<number>`count(*)::int`,
      })
      .from(productReviews)
      .innerJoin(shops, eq(productReviews.shopId, shops.id))
      .where(eq(productReviews.status, "approved"))
      .groupBy(productReviews.shopId, shops.name)
      .having(sql`count(*) >= 5`) // At least 5 reviews
      .orderBy(sql`avg(${productReviews.rating}) DESC`)
      .limit(5);

    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentActivity = await db
      .select({
        date: sql<string>`date(${productReviews.createdAt})`,
        reviewCount: sql<number>`count(*)::int`,
      })
      .from(productReviews)
      .where(sql`${productReviews.createdAt} >= ${sevenDaysAgo}`)
      .groupBy(sql`date(${productReviews.createdAt})`)
      .orderBy(sql`date(${productReviews.createdAt})`);

    return {
      totalReviews: overallStats.total || 0,
      averageRating: parseFloat(String(overallStats.avgRating)) || 0,
      pendingModeration: pendingCount,
      approvedReviews: approvedCount,
      rejectedReviews: rejectedCount,
      reviewsThisMonth: monthCount,
      topRatedShops: topShops.map((shop) => ({
        shopId: shop.shopId,
        shopName: shop.shopName,
        averageRating: parseFloat(String(shop.avgRating)) || 0,
        reviewCount: shop.reviewCount,
      })),
      recentActivity: recentActivity.map((day) => ({
        date: day.date,
        reviewCount: day.reviewCount,
      })),
    };
  });

// ============================================================================
// Update Review Status (Admin)
// ============================================================================

export const updateReviewStatus = createServerFn({ method: "POST" })
  .middleware([adminMiddleware])
  .inputValidator(updateReviewStatusSchema)
  .handler(async ({ data }) => {
    const { reviewId, status } = data;

    // Check if review exists using shared helper
    const review = await requireReview(reviewId);

    // Update status
    await db
      .update(productReviews)
      .set({ status })
      .where(eq(productReviews.id, reviewId));

    // Update product rating stats using shared helper
    await updateProductRating(review.productId);

    return {
      success: true,
      message: `Review ${status === "approved" ? "approved" : status === "rejected" ? "rejected" : "updated"} successfully`,
    };
  });

// ============================================================================
// Delete Review (Admin)
// ============================================================================

export const adminDeleteReview = createServerFn({ method: "POST" })
  .middleware([adminMiddleware])
  .inputValidator(adminDeleteReviewSchema)
  .handler(async ({ data }) => {
    const { reviewId, reason } = data;

    // Check if review exists using shared helper
    const review = await requireReview(reviewId);

    // Log deletion reason (in production, you might want to store this)
    console.log(`Admin deleted review ${reviewId}. Reason: ${reason}`);

    // Delete the review
    await db.delete(productReviews).where(eq(productReviews.id, reviewId));

    // Update product rating stats using shared helper
    await updateProductRating(review.productId);

    return {
      success: true,
      message: "Review deleted successfully",
    };
  });

// ============================================================================
// Get Review by ID (Admin)
// ============================================================================

export const getAdminReviewById = createServerFn({ method: "GET" })
  .middleware([adminMiddleware])
  .inputValidator(getAdminReviewByIdSchema)
  .handler(async ({ data }) => {
    const { reviewId } = data;

    const review = await db
      .select(reviewWithShopSelectFields)
      .from(productReviews)
      .innerJoin(user, eq(productReviews.userId, user.id))
      .innerJoin(products, eq(productReviews.productId, products.id))
      .innerJoin(shops, eq(productReviews.shopId, shops.id))
      .where(eq(productReviews.id, reviewId))
      .then((res) => res[0]);

    if (!review) {
      throw new Error("Review not found");
    }

    // Batch fetch related data
    const relations = await batchFetchReviewRelations(
      [{ productId: review.productId, vendorId: review.vendorId }],
      { includeProductImages: true, includeVendorInfo: true },
    );

    const vendor = review.vendorId
      ? relations.vendorsMap.get(review.vendorId)
      : undefined;
    const dates = formatReviewDates(review);

    return {
      review: {
        id: review.id,
        userId: review.userId,
        userName: review.userName || "Anonymous",
        userEmail: review.userEmail,
        userAvatar: review.userAvatar,
        productId: review.productId,
        productName: review.productName,
        productImage: relations.productImagesMap.get(review.productId) || null,
        shopId: review.shopId,
        shopName: review.shopName,
        shopSlug: review.shopSlug,
        vendorId: review.vendorId || undefined,
        vendorName: vendor?.name,
        vendorEmail: vendor?.email,
        orderId: review.orderId,
        rating: review.rating,
        title: review.title,
        comment: review.comment,
        status: review.status,
        helpfulCount: review.helpfulCount,
        isVerifiedPurchase: review.isVerifiedPurchase,
        vendorResponse: review.vendorResponse,
        ...dates,
      } as AdminReviewResponse,
    };
  });
