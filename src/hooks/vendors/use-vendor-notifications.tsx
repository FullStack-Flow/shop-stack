/**
 * Vendor Notifications Hook
 *
 * React Query hook for managing vendor shop notifications.
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getVendorNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "@/lib/functions/vendor/notification";
import type {
  UseVendorNotificationsOptions,
  UseVendorNotificationsResult,
} from "@/types/notifications";

// ============================================================================
// Query Keys
// ============================================================================

export const notificationKeys = {
  all: ["notifications"] as const,
  shop: (shopSlug: string) => [...notificationKeys.all, shopSlug] as const,
  list: (
    shopSlug: string,
    filters?: { unreadOnly?: boolean; limit?: number },
  ) => [...notificationKeys.shop(shopSlug), "list", filters] as const,
};

// ============================================================================
// Hook: Use Vendor Notifications
// ============================================================================

export function useVendorNotifications({
  shopSlug,
  limit = 20,
  unreadOnly = false,
  enabled = true,
  refetchInterval = 30000, // 30 seconds default polling
}: UseVendorNotificationsOptions): UseVendorNotificationsResult {
  const query = useQuery({
    queryKey: notificationKeys.list(shopSlug, { unreadOnly, limit }),
    queryFn: async () => {
      return getVendorNotifications({
        data: {
          shopSlug,
          limit,
          offset: 0,
          unreadOnly,
        },
      });
    },
    enabled: enabled && !!shopSlug,
    refetchInterval,
    staleTime: 10000, // 10 seconds
  });

  return {
    notifications: query.data?.notifications ?? [],
    unreadCount: query.data?.unreadCount ?? 0,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

// ============================================================================
// Hook: Vendor Notification Mutations
// ============================================================================

export function useVendorNotificationMutations(shopSlug: string) {
  const queryClient = useQueryClient();

  const markAsRead = useMutation({
    mutationFn: async (notificationId: string) => {
      return markNotificationAsRead({
        data: {
          shopSlug,
          notificationId,
        },
      });
    },
    onSuccess: () => {
      // Invalidate notifications query to refetch
      queryClient.invalidateQueries({
        queryKey: notificationKeys.shop(shopSlug),
      });
    },
  });

  const markAllAsRead = useMutation({
    mutationFn: async () => {
      return markAllNotificationsAsRead({
        data: {
          shopSlug,
        },
      });
    },
    onSuccess: () => {
      // Invalidate notifications query to refetch
      queryClient.invalidateQueries({
        queryKey: notificationKeys.shop(shopSlug),
      });
    },
  });

  return {
    markAsRead: markAsRead.mutate,
    markAllAsRead: markAllAsRead.mutate,
    isMarkingAsRead: markAsRead.isPending,
    isMarkingAllAsRead: markAllAsRead.isPending,
  };
}
