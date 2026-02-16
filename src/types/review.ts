import type { SQL } from "drizzle-orm";
import type { ReviewStatus } from "@/lib/validators/review";
import type { PaginatedResponse } from "./api-response";

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

export interface Review {
  id: string;
  productName: string;
  productImage: string;
  customerName: string;
  customerAvatar?: string;
  rating: number;
  comment: string;
  date: string;
  status: "approved" | "pending" | "rejected";
}

export interface ReviewPermissions {
  canDelete: boolean;
  canEdit: boolean;
  canView: boolean;
  canUpdateStatus: boolean;
}

export interface ReviewEligibility {
  canReview: boolean;
  eligibleOrderItems: {
    orderItemId: string;
    orderId: string;
    orderNumber: string;
    productName: string;
    purchaseDate: string;
    alreadyReviewed: boolean;
  }[];
  existingReviews: {
    reviewId: string;
    rating: number;
    title: string;
    createdAt: string;
  }[];
}

export interface AdminReviewResponse extends DetailedReviewResponse {
  // Admin response includes all detailed fields
}

export interface AdminReviewStats {
  totalReviews: number;
  averageRating: number;
  pendingModeration: number;
  approvedReviews: number;
  rejectedReviews: number;
  reviewsThisMonth: number;
  topRatedShops: {
    shopId: string;
    shopName: string;
    averageRating: number;
    reviewCount: number;
  }[];
  recentActivity: {
    date: string;
    reviewCount: number;
  }[];
}
