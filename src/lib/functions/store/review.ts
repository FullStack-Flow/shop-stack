/**
 * Review Server Functions (Store)
 *
 * Server functions for customer-facing review operations.
 */

import { createServerFn } from "@tanstack/react-start";
import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema/auth-schema";
import { orderItems, orders } from "@/lib/db/schema/order-schema";
import { productImages, products } from "@/lib/db/schema/products-schema";
import {
  productReviews,
  reviewHelpfulVotes,
} from "@/lib/db/schema/review-schema";
import {
  formatReviewDates,
  getProductRatingStats,
  getReviewOrderByClause,
  requireReview,
  updateProductRating,
  verifyReviewOwnership,
} from "@/lib/helper/review-query-helpers";
import { authMiddleware } from "@/lib/middleware/auth";
import { optionalAuthMiddleware } from "@/lib/middleware/optional-auth";
import {
  checkReviewEligibilitySchema,
  createReviewSchema,
  deleteReviewSchema,
  getProductReviewsSchema,
  getShopReviewsSchema,
  updateReviewSchema,
  voteHelpfulSchema,
} from "@/lib/validators/review";

import type { ReviewEligibility, StoreReviewResponse } from "@/types/review";

// ============================================================================
// Check Review Eligibility
// ============================================================================

/**
 * Check if the current user can review a product
 * Returns list of order items they haven't reviewed yet
 */
export const checkReviewEligibility = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .inputValidator(checkReviewEligibilitySchema)
  .handler(async ({ context, data }): Promise<ReviewEligibility> => {
    const userId = context.session?.user?.id;
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const { productId } = data;

    // Get all paid orders containing this product for this user
    const eligibleOrders = await db
      .select({
        orderItemId: orderItems.id,
        orderId: orders.id,
        orderNumber: orders.orderNumber,
        productName: orderItems.productName,
        purchaseDate: orders.createdAt,
      })
      .from(orderItems)
      .innerJoin(orders, eq(orderItems.orderId, orders.id))
      .where(
        and(
          eq(orderItems.productId, productId),
          eq(orders.userId, userId),
          eq(orders.paymentStatus, "paid"), // Only paid orders
        ),
      )
      .orderBy(desc(orders.createdAt));

    if (eligibleOrders.length === 0) {
      return {
        canReview: false,
        eligibleOrderItems: [],
        existingReviews: [],
      };
    }

    // Get existing reviews by this user for this product
    const existingReviews = await db
      .select({
        reviewId: productReviews.id,
        orderItemId: productReviews.orderItemId,
        rating: productReviews.rating,
        title: productReviews.title,
        createdAt: productReviews.createdAt,
      })
      .from(productReviews)
      .where(
        and(
          eq(productReviews.productId, productId),
          eq(productReviews.userId, userId),
        ),
      );

    const reviewedOrderItemIds = new Set(
      existingReviews.map((r) => r.orderItemId),
    );

    const eligibleOrderItems = eligibleOrders.map((order) => ({
      orderItemId: order.orderItemId,
      orderId: order.orderId,
      orderNumber: order.orderNumber,
      productName: order.productName,
      purchaseDate: order.purchaseDate.toISOString(),
      alreadyReviewed: reviewedOrderItemIds.has(order.orderItemId),
    }));

    const hasUnreviewedItems = eligibleOrderItems.some(
      (item) => !item.alreadyReviewed,
    );

    return {
      canReview: hasUnreviewedItems,
      eligibleOrderItems,
      existingReviews: existingReviews.map((r) => ({
        reviewId: r.reviewId,
        rating: r.rating,
        title: r.title,
        createdAt: r.createdAt.toISOString(),
      })),
    };
  });

// ============================================================================
// Create Review
// ============================================================================

export const createReview = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator(createReviewSchema)
  .handler(async ({ context, data }) => {
    const userId = context.session?.user?.id;
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const { productId, orderItemId, rating, title, comment } = data;

    // Verify the order item belongs to this user and is paid
    const orderItem = await db
      .select({
        id: orderItems.id,
        orderId: orderItems.orderId,
        productId: orderItems.productId,
        userId: orders.userId,
        paymentStatus: orders.paymentStatus,
        shopId: orders.shopId,
      })
      .from(orderItems)
      .innerJoin(orders, eq(orderItems.orderId, orders.id))
      .where(eq(orderItems.id, orderItemId))
      .then((res) => res[0]);

    if (!orderItem) {
      throw new Error("Order item not found");
    }

    if (orderItem.userId !== userId) {
      throw new Error("You can only review products from your own orders");
    }

    if (orderItem.paymentStatus !== "paid") {
      throw new Error("You can only review products from paid orders");
    }

    if (orderItem.productId !== productId) {
      throw new Error("Product ID does not match the order item");
    }

    // Check if already reviewed
    const existingReview = await db.query.productReviews.findFirst({
      where: and(
        eq(productReviews.orderItemId, orderItemId),
        eq(productReviews.userId, userId),
      ),
    });

    if (existingReview) {
      throw new Error("You have already reviewed this purchase");
    }

    // Create the review
    const reviewId = uuidv4();
    await db.insert(productReviews).values({
      id: reviewId,
      userId,
      productId,
      shopId: orderItem.shopId,
      orderId: orderItem.orderId,
      orderItemId,
      rating,
      title,
      comment,
      status: "approved", // Auto-approve for now
      isVerifiedPurchase: true,
    });

    // Update product rating stats
    await updateProductRating(productId);

    return {
      success: true,
      reviewId,
      message: "Review submitted successfully",
    };
  });

// ============================================================================
// Update Review
// ============================================================================

export const updateReview = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator(updateReviewSchema)
  .handler(async ({ context, data }) => {
    const userId = context.session?.user?.id;
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const { reviewId, rating, title, comment } = data;

    // Verify ownership using shared helper
    const review = await verifyReviewOwnership(reviewId, userId);

    // Update the review
    await db
      .update(productReviews)
      .set({
        ...(rating !== undefined && { rating }),
        ...(title !== undefined && { title }),
        ...(comment !== undefined && { comment }),
      })
      .where(eq(productReviews.id, reviewId));

    // Update product rating stats
    await updateProductRating(review.productId);

    return {
      success: true,
      message: "Review updated successfully",
    };
  });

// ============================================================================
// Delete Review
// ============================================================================

export const deleteReview = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator(deleteReviewSchema)
  .handler(async ({ context, data }) => {
    const userId = context.session?.user?.id;
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const { reviewId } = data;

    // Verify ownership using shared helper
    const review = await verifyReviewOwnership(reviewId, userId);

    // Delete the review
    await db.delete(productReviews).where(eq(productReviews.id, reviewId));

    // Update product rating stats
    await updateProductRating(review.productId);

    return {
      success: true,
      message: "Review deleted successfully",
    };
  });

// ============================================================================
// Get Product Reviews (Public)
// ============================================================================

export const getProductReviews = createServerFn({ method: "GET" })
  .middleware([optionalAuthMiddleware])
  .inputValidator(getProductReviewsSchema)
  .handler(async ({ context, data }) => {
    const currentUserId = context.session?.user?.id;
    const { productId, limit, offset, sortBy } = data;

    // Build order by clause using shared helper
    const orderByClause = getReviewOrderByClause(sortBy);

    // Get reviews with user info
    const reviews = await db
      .select({
        id: productReviews.id,
        userId: productReviews.userId,
        userName: user.name,
        userAvatar: user.image,
        productId: productReviews.productId,
        rating: productReviews.rating,
        title: productReviews.title,
        comment: productReviews.comment,
        status: productReviews.status,
        helpfulCount: productReviews.helpfulCount,
        isVerifiedPurchase: productReviews.isVerifiedPurchase,
        vendorResponse: productReviews.vendorResponse,
        vendorRespondedAt: productReviews.vendorRespondedAt,
        createdAt: productReviews.createdAt,
        updatedAt: productReviews.updatedAt,
      })
      .from(productReviews)
      .innerJoin(user, eq(productReviews.userId, user.id))
      .where(
        and(
          eq(productReviews.productId, productId),
          eq(productReviews.status, "approved"), // Only show approved reviews
        ),
      )
      .orderBy(orderByClause)
      .limit(limit)
      .offset(offset);

    // Check if current user has voted on these reviews
    let userVotes: Set<string> = new Set();
    if (currentUserId && reviews.length > 0) {
      const reviewIds = reviews.map((r) => r.id);
      const votes = await db
        .select({ reviewId: reviewHelpfulVotes.reviewId })
        .from(reviewHelpfulVotes)
        .where(
          and(
            inArray(reviewHelpfulVotes.reviewId, reviewIds),
            eq(reviewHelpfulVotes.userId, currentUserId),
          ),
        );
      userVotes = new Set(votes.map((v) => v.reviewId));
    }

    // Get total count
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(productReviews)
      .where(
        and(
          eq(productReviews.productId, productId),
          eq(productReviews.status, "approved"),
        ),
      );

    // Get rating stats using shared helper
    const ratingStats = await getProductRatingStats(productId);

    return {
      reviews: reviews.map((review): StoreReviewResponse => {
        const dates = formatReviewDates(review);
        return {
          id: review.id,
          userId: review.userId,
          userName: review.userName || "Anonymous",
          userAvatar: review.userAvatar,
          productId: review.productId,
          productName: "", // Not needed for display
          rating: review.rating,
          title: review.title,
          comment: review.comment,
          status: review.status,
          helpfulCount: review.helpfulCount,
          isVerifiedPurchase: review.isVerifiedPurchase,
          vendorResponse: review.vendorResponse,
          ...dates,
          hasVotedHelpful: userVotes.has(review.id),
        };
      }),
      total: count,
      ratingStats,
    };
  });

// ============================================================================
// Vote Review Helpful
// ============================================================================

export const voteReviewHelpful = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator(voteHelpfulSchema)
  .handler(async ({ context, data }) => {
    const userId = context.session?.user?.id;
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const { reviewId } = data;

    // Check if review exists using shared helper
    const review = await requireReview(reviewId);

    // Can't vote on your own review
    if (review.userId === userId) {
      throw new Error("You can't vote on your own review");
    }

    // Check if already voted
    const existingVote = await db.query.reviewHelpfulVotes.findFirst({
      where: and(
        eq(reviewHelpfulVotes.reviewId, reviewId),
        eq(reviewHelpfulVotes.userId, userId),
      ),
    });

    if (existingVote) {
      // Remove vote (toggle off)
      await db
        .delete(reviewHelpfulVotes)
        .where(eq(reviewHelpfulVotes.id, existingVote.id));

      await db
        .update(productReviews)
        .set({ helpfulCount: sql`${productReviews.helpfulCount} - 1` })
        .where(eq(productReviews.id, reviewId));

      return {
        success: true,
        voted: false,
        message: "Vote removed",
      };
    }

    // Add vote
    await db.insert(reviewHelpfulVotes).values({
      id: uuidv4(),
      reviewId,
      userId,
    });

    await db
      .update(productReviews)
      .set({ helpfulCount: sql`${productReviews.helpfulCount} + 1` })
      .where(eq(productReviews.id, reviewId));

    return {
      success: true,
      voted: true,
      message: "Marked as helpful",
    };
  });

// ============================================================================
// Get User's Reviews
// ============================================================================

export const getUserReviews = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const userId = context.session?.user?.id;
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const reviews = await db
      .select({
        id: productReviews.id,
        productId: productReviews.productId,
        productName: products.name,
        productImage: sql<string | null>`(
            SELECT ${productImages.url} FROM ${productImages}
            WHERE ${productImages.productId} = ${products.id}
            ORDER BY ${productImages.isPrimary} DESC, ${productImages.createdAt} DESC
            LIMIT 1
        )`.as("product_image"),
        rating: productReviews.rating,
        title: productReviews.title,
        comment: productReviews.comment,
        status: productReviews.status,
        helpfulCount: productReviews.helpfulCount,
        vendorResponse: productReviews.vendorResponse,
        vendorRespondedAt: productReviews.vendorRespondedAt,
        createdAt: productReviews.createdAt,
        updatedAt: productReviews.updatedAt,
      })
      .from(productReviews)
      .innerJoin(products, eq(productReviews.productId, products.id))
      .where(eq(productReviews.userId, userId))
      .orderBy(desc(productReviews.createdAt));

    return {
      reviews: reviews.map((review) => {
        const dates = formatReviewDates(review);
        return {
          id: review.id,
          productId: review.productId,
          productName: review.productName,
          productImage: review.productImage ?? null,
          rating: review.rating,
          title: review.title,
          comment: review.comment,
          status: review.status,
          helpfulCount: review.helpfulCount,
          vendorResponse: review.vendorResponse,
          ...dates,
        };
      }),
    };
  });

// ============================================================================
// Get Shop Reviews (Public)
// ============================================================================

export const getShopReviews = createServerFn({ method: "GET" })
  .middleware([optionalAuthMiddleware])
  .inputValidator(getShopReviewsSchema)
  .handler(async ({ context, data }) => {
    const currentUserId = context.session?.user?.id;
    const { shopId, limit, offset } = data;

    // Get reviews with user info for this shop
    const reviews = await db
      .select({
        id: productReviews.id,
        userId: productReviews.userId,
        userName: user.name,
        userAvatar: user.image,
        productId: productReviews.productId,
        productName: products.name,
        rating: productReviews.rating,
        title: productReviews.title,
        comment: productReviews.comment,
        status: productReviews.status,
        helpfulCount: productReviews.helpfulCount,
        isVerifiedPurchase: productReviews.isVerifiedPurchase,
        vendorResponse: productReviews.vendorResponse,
        vendorRespondedAt: productReviews.vendorRespondedAt,
        createdAt: productReviews.createdAt,
        updatedAt: productReviews.updatedAt,
      })
      .from(productReviews)
      .innerJoin(user, eq(productReviews.userId, user.id))
      .innerJoin(products, eq(productReviews.productId, products.id))
      .where(
        and(
          eq(productReviews.shopId, shopId),
          eq(productReviews.status, "approved"),
        ),
      )
      .orderBy(desc(productReviews.createdAt))
      .limit(limit)
      .offset(offset);

    // Check if current user has voted on these reviews
    let userVotes: Set<string> = new Set();
    if (currentUserId && reviews.length > 0) {
      const reviewIds = reviews.map((r) => r.id);
      const votes = await db
        .select({ reviewId: reviewHelpfulVotes.reviewId })
        .from(reviewHelpfulVotes)
        .where(
          and(
            inArray(reviewHelpfulVotes.reviewId, reviewIds),
            eq(reviewHelpfulVotes.userId, currentUserId),
          ),
        );
      userVotes = new Set(votes.map((v) => v.reviewId));
    }

    // Get total count
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(productReviews)
      .where(
        and(
          eq(productReviews.shopId, shopId),
          eq(productReviews.status, "approved"),
        ),
      );

    // Get rating stats for shop
    const ratingData = await db
      .select({
        rating: productReviews.rating,
        count: sql<number>`count(*)::int`,
      })
      .from(productReviews)
      .where(
        and(
          eq(productReviews.shopId, shopId),
          eq(productReviews.status, "approved"),
        ),
      )
      .groupBy(productReviews.rating);

    // Calculate average and breakdown
    const breakdown: { 5: number; 4: number; 3: number; 2: number; 1: number } =
      {
        5: 0,
        4: 0,
        3: 0,
        2: 0,
        1: 0,
      };
    let totalCount = 0;
    let totalRating = 0;

    for (const stat of ratingData) {
      const rating = stat.rating as 1 | 2 | 3 | 4 | 5;
      breakdown[rating] = stat.count;
      totalCount += stat.count;
      totalRating += stat.rating * stat.count;
    }

    const averageRating =
      totalCount > 0 ? Math.round((totalRating / totalCount) * 10) / 10 : 0;

    return {
      reviews: reviews.map((review): StoreReviewResponse => {
        const dates = formatReviewDates(review);
        return {
          id: review.id,
          userId: review.userId,
          userName: review.userName || "Anonymous",
          userAvatar: review.userAvatar,
          productId: review.productId,
          productName: review.productName,
          rating: review.rating,
          title: review.title,
          comment: review.comment,
          status: review.status,
          helpfulCount: review.helpfulCount,
          isVerifiedPurchase: review.isVerifiedPurchase,
          vendorResponse: review.vendorResponse,
          ...dates,
          hasVotedHelpful: userVotes.has(review.id),
        };
      }),
      total: count,
      ratingStats: {
        average: averageRating,
        count: totalCount,
        breakdown,
      },
    };
  });
