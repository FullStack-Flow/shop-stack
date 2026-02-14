/**
 * Review Query Helpers
 *
 * Shared utilities for review queries across vendor, admin, and store contexts.
 * Centralizes batch fetching, normalization, and query building logic.
 */

import { and, asc, count, desc, eq, inArray, type SQL, sql } from "drizzle-orm";
import type { PaginatedResponse } from "@/types/api-response";
import { db } from "../db";
import { user } from "../db/schema/auth-schema";
import { productImages, products } from "../db/schema/products-schema";
import { productReviews } from "../db/schema/review-schema";
import { shops, vendors } from "../db/schema/shop-schema";
import type { ReviewStatus } from "../validators/review";

// ============================================================================
// Types
// ============================================================================

/**
 * Rating breakdown type for review statistics
 */
export interface RatingBreakdown {
  5: number;
  4: number;
  3: number;
  2: number;
  1: number;
}

/**
 * Base review fields shared across all contexts
 */
export interface BaseReviewFields {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string | null;
  productId: string;
  productName: string;
  rating: number;
  title: string;
  comment: string;
  status: string;
  helpfulCount: number;
  isVerifiedPurchase: boolean;
  vendorResponse: string | null;
  vendorRespondedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Store review response (customer-facing)
 */
export interface StoreReviewResponse extends BaseReviewFields {
  hasVotedHelpful?: boolean;
}

/**
 * Admin/Vendor review response (includes additional details)
 */
export interface DetailedReviewResponse extends BaseReviewFields {
  userEmail: string;
  productImage: string | null;
  shopId: string;
  shopName: string;
  shopSlug?: string;
  orderId: string;
  vendorId?: string;
  vendorName?: string;
  vendorEmail?: string;
}

/**
 * Batched relations for review queries
 */
export interface BatchedReviewRelations {
  productImagesMap: Map<string, string>;
  vendorsMap: Map<string, { name: string; email: string }>;
}

/**
 * Review query options
 */
export interface ReviewQueryOptions {
  baseConditions?: SQL[];
  shopId?: string;
  productId?: string;
  userId?: string;
  status?: ReviewStatus;
  rating?: number;
  limit?: number;
  offset?: number;
  sortBy?: "newest" | "oldest" | "highest" | "lowest" | "helpful";
  sortDirection?: "asc" | "desc";
  includeVendorInfo?: boolean;
  includeProductImages?: boolean;
}

/**
 * Review query result
 */
export interface ReviewQueryResult<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
}

/**
 * Product rating stats
 */
export interface ProductRatingStats {
  average: number;
  count: number;
  breakdown: RatingBreakdown;
}

/**
 * Shared review list response type
 */
export type ReviewListResponse<T> = PaginatedResponse<T>;

// ============================================================================
// Shared Select Fields
// ============================================================================

/**
 * Base review select fields used across all contexts
 */
export const baseReviewSelectFields = {
  id: productReviews.id,
  userId: productReviews.userId,
  productId: productReviews.productId,
  shopId: productReviews.shopId,
  orderId: productReviews.orderId,
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
} as const;

/**
 * Extended select fields with user info
 */
export const reviewWithUserSelectFields = {
  ...baseReviewSelectFields,
  userName: user.name,
  userEmail: user.email,
  userAvatar: user.image,
} as const;

/**
 * Extended select fields with product info
 */
export const reviewWithProductSelectFields = {
  ...reviewWithUserSelectFields,
  productName: products.name,
} as const;

/**
 * Extended select fields with shop info
 */
export const reviewWithShopSelectFields = {
  ...reviewWithProductSelectFields,
  shopName: shops.name,
  shopSlug: shops.slug,
  vendorId: shops.vendorId,
} as const;

// ============================================================================
// Batch Fetch Relations
// ============================================================================

/**
 * Batch fetch product images for a list of product IDs
 */
export async function batchFetchProductImages(
  productIds: string[],
): Promise<Map<string, string>> {
  const imageMap = new Map<string, string>();

  if (productIds.length === 0) return imageMap;

  const images = await db
    .select({
      productId: productImages.productId,
      url: productImages.url,
      isPrimary: productImages.isPrimary,
    })
    .from(productImages)
    .where(inArray(productImages.productId, productIds));

  for (const img of images) {
    // Prioritize primary images
    if (!imageMap.has(img.productId) || img.isPrimary) {
      imageMap.set(img.productId, img.url);
    }
  }

  return imageMap;
}

/**
 * Batch fetch vendor info for a list of vendor IDs
 */
export async function batchFetchVendorInfo(
  vendorIds: string[],
): Promise<Map<string, { name: string; email: string }>> {
  const vendorMap = new Map<string, { name: string; email: string }>();

  if (vendorIds.length === 0) return vendorMap;

  const vendorData = await db
    .select({
      vendorId: vendors.id,
      userName: user.name,
      userEmail: user.email,
    })
    .from(vendors)
    .innerJoin(user, eq(vendors.userId, user.id))
    .where(inArray(vendors.id, vendorIds));

  for (const v of vendorData) {
    vendorMap.set(v.vendorId, {
      name: v.userName || "Unknown",
      email: v.userEmail,
    });
  }

  return vendorMap;
}

/**
 * Batch fetch all related data for reviews
 */
export async function batchFetchReviewRelations(
  reviews: { productId: string; vendorId?: string | null }[],
  options: {
    includeProductImages?: boolean;
    includeVendorInfo?: boolean;
  } = {},
): Promise<BatchedReviewRelations> {
  const productIds = [...new Set(reviews.map((r) => r.productId))];
  const vendorIds = [
    ...new Set(reviews.map((r) => r.vendorId).filter(Boolean)),
  ] as string[];

  // Build parallel queries
  const queries: Promise<any>[] = [];

  if (options.includeProductImages && productIds.length > 0) {
    queries.push(batchFetchProductImages(productIds));
  } else {
    queries.push(Promise.resolve(new Map<string, string>()));
  }

  if (options.includeVendorInfo && vendorIds.length > 0) {
    queries.push(batchFetchVendorInfo(vendorIds));
  } else {
    queries.push(
      Promise.resolve(new Map<string, { name: string; email: string }>()),
    );
  }

  const [productImagesMap, vendorsMap] = await Promise.all(queries);

  return {
    productImagesMap,
    vendorsMap,
  };
}

// ============================================================================
// Format Review Dates
// ============================================================================

/**
 * Format review date fields for API response
 */
export function formatReviewDates(review: {
  createdAt: Date;
  updatedAt: Date;
  vendorRespondedAt: Date | null;
}): {
  createdAt: string;
  updatedAt: string;
  vendorRespondedAt: string | null;
} {
  return {
    createdAt: review.createdAt.toISOString(),
    updatedAt: review.updatedAt.toISOString(),
    vendorRespondedAt: review.vendorRespondedAt?.toISOString() || null,
  };
}

// ============================================================================
// Build Filter Conditions
// ============================================================================

/**
 * Build SQL WHERE conditions from filter parameters
 */
export function buildReviewFilterConditions(
  options: Omit<
    ReviewQueryOptions,
    "limit" | "offset" | "sortBy" | "sortDirection"
  >,
): SQL[] {
  const conditions: SQL[] = [];

  // Add base conditions
  if (options.baseConditions) {
    conditions.push(...options.baseConditions);
  }

  // Shop filter
  if (options.shopId) {
    conditions.push(eq(productReviews.shopId, options.shopId));
  }

  // Product filter
  if (options.productId) {
    conditions.push(eq(productReviews.productId, options.productId));
  }

  // User filter
  if (options.userId) {
    conditions.push(eq(productReviews.userId, options.userId));
  }

  // Status filter
  if (options.status) {
    conditions.push(eq(productReviews.status, options.status));
  }

  // Rating filter
  if (options.rating) {
    conditions.push(eq(productReviews.rating, options.rating));
  }

  return conditions;
}

/**
 * Get order by clause based on sort option
 */
export function getReviewOrderByClause(
  sortBy: ReviewQueryOptions["sortBy"] = "newest",
) {
  switch (sortBy) {
    case "oldest":
      return asc(productReviews.createdAt);
    case "highest":
      return desc(productReviews.rating);
    case "lowest":
      return asc(productReviews.rating);
    case "helpful":
      return desc(productReviews.helpfulCount);
    default:
      return desc(productReviews.createdAt);
  }
}

// ============================================================================
// Calculate Rating Stats
// ============================================================================

/**
 * Calculate rating statistics from rating data
 */
export function calculateRatingStats(
  ratingData: { rating: number; count: number }[],
): ProductRatingStats {
  const breakdown: RatingBreakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  let totalCount = 0;
  let totalRating = 0;

  for (const stat of ratingData) {
    const rating = stat.rating as 1 | 2 | 3 | 4 | 5;
    breakdown[rating] = stat.count;
    totalCount += stat.count;
    totalRating += stat.rating * stat.count;
  }

  return {
    average:
      totalCount > 0 ? Math.round((totalRating / totalCount) * 10) / 10 : 0,
    count: totalCount,
    breakdown,
  };
}

/**
 * Get rating breakdown for a shop
 */
export async function getShopRatingStats(
  shopId: string,
): Promise<ProductRatingStats> {
  const ratingData = await db
    .select({
      rating: productReviews.rating,
      count: sql<number>`count(*)::int`,
    })
    .from(productReviews)
    .where(eq(productReviews.shopId, shopId))
    .groupBy(productReviews.rating);

  return calculateRatingStats(ratingData);
}

/**
 * Get rating breakdown for a product (approved reviews only)
 */
export async function getProductRatingStats(
  productId: string,
): Promise<ProductRatingStats> {
  const ratingData = await db
    .select({
      rating: productReviews.rating,
      count: sql<number>`count(*)::int`,
    })
    .from(productReviews)
    .where(
      and(
        eq(productReviews.productId, productId),
        eq(productReviews.status, "approved"),
      ),
    )
    .groupBy(productReviews.rating);

  return calculateRatingStats(ratingData);
}

// ============================================================================
// Get Review Count
// ============================================================================

/**
 * Get review count with optional conditions
 */
export async function getReviewCount(
  conditions?: SQL | SQL[],
): Promise<number> {
  const whereClause = Array.isArray(conditions)
    ? conditions.length > 0
      ? and(...conditions)
      : undefined
    : conditions;

  const [{ reviewCount }] = await db
    .select({ reviewCount: sql<number>`count(*)::int` })
    .from(productReviews)
    .where(whereClause);

  return reviewCount;
}

// ============================================================================
// Update Product Rating
// ============================================================================

/**
 * Recalculate and update the denormalized rating fields on the product table
 */
export async function updateProductRating(productId: string): Promise<void> {
  const stats = await getProductRatingStats(productId);
  await db
    .update(products)
    .set({
      averageRating: stats.average.toString(),
      reviewCount: stats.count,
    })
    .where(eq(products.id, productId));
}

// ============================================================================
// Review Existence Checks
// ============================================================================

/**
 * Get a review by ID
 */
export async function getReviewById(reviewId: string) {
  return db.query.productReviews.findFirst({
    where: eq(productReviews.id, reviewId),
  });
}

/**
 * Check if a review exists and throw if not found
 */
export async function requireReview(reviewId: string) {
  const review = await getReviewById(reviewId);
  if (!review) {
    throw new Error("Review not found");
  }
  return review;
}

/**
 * Verify review ownership
 */
export async function verifyReviewOwnership(reviewId: string, userId: string) {
  const review = await requireReview(reviewId);
  if (review.userId !== userId) {
    throw new Error("You can only modify your own reviews");
  }
  return review;
}

// ============================================================================
// Execute Review Query (Admin/Vendor)
// ============================================================================

/**
 * Execute a detailed review query (for admin/vendor contexts)
 * Returns reviews with user, product, and shop info
 */
export async function executeDetailedReviewQuery(
  options: ReviewQueryOptions,
): Promise<ReviewQueryResult<DetailedReviewResponse>> {
  const limit = options.limit ?? 20;
  const offset = options.offset ?? 0;

  // Build filter conditions
  const conditions = buildReviewFilterConditions(options);
  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  // Build order by clause
  const orderByClause = getReviewOrderByClause(options.sortBy);

  // Parallel: Get count and paginated reviews
  const [countResult, reviews] = await Promise.all([
    db.select({ count: count() }).from(productReviews).where(whereClause),
    db
      .select(reviewWithShopSelectFields)
      .from(productReviews)
      .innerJoin(user, eq(productReviews.userId, user.id))
      .innerJoin(products, eq(productReviews.productId, products.id))
      .innerJoin(shops, eq(productReviews.shopId, shops.id))
      .where(whereClause)
      .orderBy(orderByClause)
      .limit(limit)
      .offset(offset),
  ]);

  const total = countResult[0]?.count ?? 0;

  if (reviews.length === 0) {
    return { data: [], total, limit, offset };
  }

  // Batch fetch related data
  const reviewsWithVendorId = reviews.map((r) => ({
    productId: r.productId,
    vendorId: r.vendorId,
  }));

  const relations = await batchFetchReviewRelations(reviewsWithVendorId, {
    includeProductImages: options.includeProductImages ?? true,
    includeVendorInfo: options.includeVendorInfo ?? false,
  });

  // Normalize reviews
  const normalizedReviews: DetailedReviewResponse[] = reviews.map((review) => {
    const vendor = review.vendorId
      ? relations.vendorsMap.get(review.vendorId)
      : undefined;
    const dates = formatReviewDates(review);

    return {
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
    };
  });

  return {
    data: normalizedReviews,
    total,
    limit,
    offset,
  };
}
