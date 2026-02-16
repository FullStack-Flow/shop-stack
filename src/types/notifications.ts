export interface NotificationResponse {
  id: string;
  type: string;
  title: string;
  message: string;
  data: {
    orderId?: string;
    orderNumber?: string;
    productId?: string;
    reviewId?: string;
    amount?: number;
    link?: string;
  } | null;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
}

export interface UseVendorNotificationsOptions {
  shopSlug: string;
  limit?: number;
  unreadOnly?: boolean;
  enabled?: boolean;
  refetchInterval?: number;
}

export interface UseVendorNotificationsResult {
  notifications: NotificationResponse[];
  unreadCount: number;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}
