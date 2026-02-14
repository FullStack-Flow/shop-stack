/**
 * Customer Reviews Hooks
 *
 * React Query hooks for customer review operations.
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  checkReviewEligibility,
  createReview,
  deleteReview,
  getProductReviews,
  getShopReviews,
  getUserReviews,
  updateReview,
  voteReviewHelpful,
} from "@/lib/functions/store/review";
import type {
  CreateReviewInput,
  UpdateReviewInput,
} from "@/lib/validators/review";

// ============================================================================
// Query Keys
// ============================================================================

export const reviewKeys = {
  all: ["reviews"] as const,
  productReviews: (
    productId: string,
    params?: { limit?: number; offset?: number; sortBy?: string },
  ) => [...reviewKeys.all, "product", productId, params] as const,
  shopReviews: (shopId: string, params?: { limit?: number; offset?: number }) =>
    [...reviewKeys.all, "shop", shopId, params] as const,
  eligibility: (productId: string) =>
    [...reviewKeys.all, "eligibility", productId] as const,
  userReviews: () => [...reviewKeys.all, "user"] as const,
};

// ============================================================================
// Get Product Reviews Hook
// ============================================================================

export function useProductReviews(
  productId: string,
  params?: {
    limit?: number;
    offset?: number;
    sortBy?: "newest" | "oldest" | "highest" | "lowest" | "helpful";
  },
) {
  return useQuery({
    queryKey: reviewKeys.productReviews(productId, params),
    queryFn: async () => {
      const result = await getProductReviews({
        data: {
          productId,
          limit: params?.limit ?? 10,
          offset: params?.offset ?? 0,
          sortBy: params?.sortBy ?? "newest",
        },
      });
      return result;
    },
    enabled: !!productId,
  });
}

// ============================================================================
// Get Shop Reviews Hook
// ============================================================================

export function useShopReviews(
  shopId: string,
  params?: {
    limit?: number;
    offset?: number;
  },
) {
  return useQuery({
    queryKey: reviewKeys.shopReviews(shopId, params),
    queryFn: async () => {
      const result = await getShopReviews({
        data: {
          shopId,
          limit: params?.limit ?? 10,
          offset: params?.offset ?? 0,
        },
      });
      return result;
    },
    enabled: !!shopId,
  });
}

// ============================================================================
// Check Review Eligibility Hook
// ============================================================================

export function useReviewEligibility(productId: string) {
  return useQuery({
    queryKey: reviewKeys.eligibility(productId),
    queryFn: async () => {
      const result = await checkReviewEligibility({
        data: { productId },
      });
      return result;
    },
    enabled: !!productId,
  });
}

// ============================================================================
// Get User Reviews Hook
// ============================================================================

export function useUserReviews() {
  return useQuery({
    queryKey: reviewKeys.userReviews(),
    queryFn: async () => {
      const result = await getUserReviews();
      return result.reviews;
    },
  });
}

// ============================================================================
// Review Mutations Hook
// ============================================================================

export function useReviewMutations() {
  const queryClient = useQueryClient();

  const createReviewMutation = useMutation({
    mutationFn: async (data: CreateReviewInput) => {
      const result = await createReview({ data });
      return result;
    },
    onSuccess: (_, variables) => {
      toast.success("Review submitted successfully!");
      // Invalidate related queries
      queryClient.invalidateQueries({
        queryKey: reviewKeys.productReviews(variables.productId),
      });
      queryClient.invalidateQueries({
        queryKey: reviewKeys.eligibility(variables.productId),
      });
      queryClient.invalidateQueries({
        queryKey: reviewKeys.userReviews(),
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to submit review");
    },
  });

  const updateReviewMutation = useMutation({
    mutationFn: async (data: UpdateReviewInput & { productId: string }) => {
      const { productId: _, ...updateData } = data;
      const result = await updateReview({ data: updateData });
      return result;
    },
    onSuccess: (_, variables) => {
      toast.success("Review updated successfully!");
      queryClient.invalidateQueries({
        queryKey: reviewKeys.productReviews(variables.productId),
      });
      queryClient.invalidateQueries({
        queryKey: reviewKeys.userReviews(),
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update review");
    },
  });

  const deleteReviewMutation = useMutation({
    mutationFn: async (data: { reviewId: string; productId: string }) => {
      const result = await deleteReview({ data: { reviewId: data.reviewId } });
      return result;
    },
    onSuccess: (_, variables) => {
      toast.success("Review deleted successfully!");
      queryClient.invalidateQueries({
        queryKey: reviewKeys.productReviews(variables.productId),
      });
      queryClient.invalidateQueries({
        queryKey: reviewKeys.eligibility(variables.productId),
      });
      queryClient.invalidateQueries({
        queryKey: reviewKeys.userReviews(),
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete review");
    },
  });

  const voteHelpfulMutation = useMutation({
    mutationFn: async (data: { reviewId: string; productId: string }) => {
      const result = await voteReviewHelpful({
        data: { reviewId: data.reviewId },
      });
      return result;
    },
    onSuccess: (result, variables) => {
      toast.success(result.message);
      queryClient.invalidateQueries({
        queryKey: reviewKeys.productReviews(variables.productId),
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to vote");
    },
  });

  return {
    createReview: createReviewMutation,
    updateReview: updateReviewMutation,
    deleteReview: deleteReviewMutation,
    voteHelpful: voteHelpfulMutation,
  };
}
