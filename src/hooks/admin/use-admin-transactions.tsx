/**
 * Admin Transactions Hooks
 *
 * React Query hooks for admin transaction management.
 */

import { useQuery } from '@tanstack/react-query';
import {
  getAdminTransactionStats,
  getAdminTransactions,
} from '@/lib/functions/admin/transaction';

// ============================================================================
// Query Keys
// ============================================================================

export const adminTransactionKeys = {
  all: ['admin-transactions'] as const,
  list: (params?: {
    limit?: number;
    offset?: number;
    status?: string;
    shopId?: string;
    vendorId?: string;
  }) => [...adminTransactionKeys.all, 'list', params] as const,
  stats: () => [...adminTransactionKeys.all, 'stats'] as const,
};

// ============================================================================
// Hooks
// ============================================================================

/**
 * Hook to fetch admin transactions
 */
export function useAdminTransactions(params?: {
  limit?: number;
  offset?: number;
  status?: 'pending' | 'processing' | 'succeeded' | 'failed' | 'refunded';
  shopId?: string;
  vendorId?: string;
}) {
  return useQuery({
    queryKey: adminTransactionKeys.list(params),
    queryFn: async () => {
      const result = await getAdminTransactions({
        data: {
          limit: params?.limit ?? 50,
          offset: params?.offset ?? 0,
          status: params?.status,
          shopId: params?.shopId,
          vendorId: params?.vendorId,
        },
      });
      return result;
    },
  });
}

/**
 * Hook to fetch admin transaction stats
 */
export function useAdminTransactionStats() {
  return useQuery({
    queryKey: adminTransactionKeys.stats(),
    queryFn: async () => {
      const result = await getAdminTransactionStats();
      return result;
    },
  });
}
