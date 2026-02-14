/**
 * Review Validators
 *
 * Zod validation schemas for review operations.
 */

import { z } from "zod";

// ============================================================================
// Review Status Type
// ============================================================================

export const reviewStatusSchema = z.enum(["pending", "approved", "rejected"]);
export type ReviewStatus = z.infer<typeof reviewStatusSchema>;

// ============================================================================
// Create Review Schema
// ============================================================================

export const createReviewSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  orderItemId: z.string().min(1, "Order item ID is required"),
  rating: z
    .number()
    .min(1, "Rating must be at least 1")
    .max(5, "Rating must be at most 5"),
  title: z
    .string()
    .min(5, "Title must be at least 5 characters")
    .max(100, "Title must be at most 100 characters"),
  comment: z
    .string()
    .min(10, "Review must be at least 10 characters")
    .max(1000, "Review must be at most 1000 characters"),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;

// ============================================================================
// Update Review Schema (Customer can edit their own review)
// ============================================================================

export const updateReviewSchema = z.object({
  reviewId: z.string().min(1, "Review ID is required"),
  rating: z
    .number()
    .min(1, "Rating must be at least 1")
    .max(5, "Rating must be at most 5")
    .optional(),
  title: z
    .string()
    .min(5, "Title must be at least 5 characters")
    .max(100, "Title must be at most 100 characters")
    .optional(),
  comment: z
    .string()
    .min(10, "Review must be at least 10 characters")
    .max(1000, "Review must be at most 1000 characters")
    .optional(),
});

export type UpdateReviewInput = z.infer<typeof updateReviewSchema>;

// ============================================================================
// Delete Review Schema
// ============================================================================

export const deleteReviewSchema = z.object({
  reviewId: z.string().min(1, "Review ID is required"),
});

export type DeleteReviewInput = z.infer<typeof deleteReviewSchema>;

// ============================================================================
// Get Reviews Schema (For Product Page)
// ============================================================================

export const getProductReviewsSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  limit: z.number().min(1).max(50).optional().default(10),
  offset: z.number().min(0).optional().default(0),
  sortBy: z
    .enum(["newest", "oldest", "highest", "lowest", "helpful"])
    .optional()
    .default("newest"),
});

export type GetProductReviewsInput = z.infer<typeof getProductReviewsSchema>;

// ============================================================================
// Check Review Eligibility Schema
// ============================================================================

export const checkReviewEligibilitySchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
});

export type CheckReviewEligibilityInput = z.infer<
  typeof checkReviewEligibilitySchema
>;

// ============================================================================
// Vote Helpful Schema
// ============================================================================

export const voteHelpfulSchema = z.object({
  reviewId: z.string().min(1, "Review ID is required"),
});

export type VoteHelpfulInput = z.infer<typeof voteHelpfulSchema>;

// ============================================================================
// Vendor Review Schemas
// ============================================================================

export const getVendorReviewsSchema = z.object({
  shopSlug: z.string().optional(),
  productId: z.string().optional(),
  status: reviewStatusSchema.optional(),
  rating: z.number().min(1).max(5).optional(),
  limit: z.number().min(1).max(100).optional().default(20),
  offset: z.number().min(0).optional().default(0),
});

export type GetVendorReviewsInput = z.infer<typeof getVendorReviewsSchema>;

export const respondToReviewSchema = z.object({
  reviewId: z.string().min(1, "Review ID is required"),
  response: z
    .string()
    .min(10, "Response must be at least 10 characters")
    .max(500, "Response must be at most 500 characters"),
});

export type RespondToReviewInput = z.infer<typeof respondToReviewSchema>;

// ============================================================================
// Admin Review Schemas
// ============================================================================

export const getAdminReviewsSchema = z.object({
  shopId: z.string().optional(),
  productId: z.string().optional(),
  userId: z.string().optional(),
  status: reviewStatusSchema.optional(),
  rating: z.number().min(1).max(5).optional(),
  limit: z.number().min(1).max(100).optional().default(20),
  offset: z.number().min(0).optional().default(0),
});

export type GetAdminReviewsInput = z.infer<typeof getAdminReviewsSchema>;

export const updateReviewStatusSchema = z.object({
  reviewId: z.string().min(1, "Review ID is required"),
  status: reviewStatusSchema,
  reason: z.string().optional(), // Reason for rejection
});

export type UpdateReviewStatusInput = z.infer<typeof updateReviewStatusSchema>;

export const adminDeleteReviewSchema = z.object({
  reviewId: z.string().min(1, "Review ID is required"),
  reason: z.string().min(5, "Reason must be at least 5 characters"),
});

export type AdminDeleteReviewInput = z.infer<typeof adminDeleteReviewSchema>;

export const getAdminReviewByIdSchema = z.object({
  reviewId: z.string().min(1, "Review ID is required"),
});

export type GetAdminReviewByIdInput = z.infer<typeof getAdminReviewByIdSchema>;

export const getShopReviewsSchema = z.object({
  shopId: z.string().min(1, "Shop ID is required"),
  limit: z.number().min(1).max(50).optional().default(10),
  offset: z.number().min(0).optional().default(0),
});

export type GetShopReviewsInput = z.infer<typeof getShopReviewsSchema>;
