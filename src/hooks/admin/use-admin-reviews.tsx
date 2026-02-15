/**
 * Admin Reviews Hooks
 *
 * React Query hooks for admin review operations.
 * Admins can view ALL reviews and moderate them.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  adminDeleteReview,
  getAdminReviewById,
  getAdminReviewStats,
  getAdminReviews,
  updateReviewStatus,
} from '@/lib/functions/admin/review';
import type {
  AdminDeleteReviewInput,
  UpdateReviewStatusInput,
} from '@/lib/validators/review';

// Input type for admin reviews hook (limit/offset optional since they have defaults)
interface UseAdminReviewsInput {
  shopId?: string;
  productId?: string;
  userId?: string;
  status?: 'pending' | 'approved' | 'rejected';
  rating?: number;
  limit?: number;
  offset?: number;
}

// ============================================================================
// Query Keys
// ============================================================================

export const adminReviewKeys = {
  all: ['admin-reviews'] as const,
  list: (params?: UseAdminReviewsInput) =>
    [...adminReviewKeys.all, 'list', params] as const,
  detail: (reviewId: string) =>
    [...adminReviewKeys.all, 'detail', reviewId] as const,
  stats: () => [...adminReviewKeys.all, 'stats'] as const,
};

// ============================================================================
// Get Admin Reviews Hook
// ============================================================================

export function useAdminReviews(params?: UseAdminReviewsInput) {
  return useQuery({
    queryKey: adminReviewKeys.list(params),
    queryFn: async () => {
      const result = await getAdminReviews({
        data: {
          shopId: params?.shopId,
          productId: params?.productId,
          userId: params?.userId,
          status: params?.status,
          rating: params?.rating,
          limit: params?.limit ?? 20,
          offset: params?.offset ?? 0,
        },
      });
      return result;
    },
  });
}

// ============================================================================
// Get Admin Review by ID Hook
// ============================================================================

export function useAdminReview(reviewId: string) {
  return useQuery({
    queryKey: adminReviewKeys.detail(reviewId),
    queryFn: async () => {
      const result = await getAdminReviewById({
        data: { reviewId },
      });
      return result.review;
    },
    enabled: !!reviewId,
  });
}

// ============================================================================
// Get Admin Review Stats Hook
// ============================================================================

export function useAdminReviewStats() {
  return useQuery({
    queryKey: adminReviewKeys.stats(),
    queryFn: async () => {
      const result = await getAdminReviewStats();
      return result;
    },
  });
}

// ============================================================================
// Admin Review Mutations Hook
// ============================================================================

export function useAdminReviewMutations() {
  const queryClient = useQueryClient();

  const updateStatusMutation = useMutation({
    mutationFn: async (data: UpdateReviewStatusInput) => {
      const result = await updateReviewStatus({ data });
      return result;
    },
    onSuccess: (result) => {
      toast.success(result.message);
      queryClient.invalidateQueries({
        queryKey: adminReviewKeys.all,
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update review status');
    },
  });

  const deleteReviewMutation = useMutation({
    mutationFn: async (data: AdminDeleteReviewInput) => {
      const result = await adminDeleteReview({ data });
      return result;
    },
    onSuccess: () => {
      toast.success('Review deleted successfully!');
      queryClient.invalidateQueries({
        queryKey: adminReviewKeys.all,
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete review');
    },
  });

  return {
    updateStatus: updateStatusMutation,
    deleteReview: deleteReviewMutation,
  };
}
