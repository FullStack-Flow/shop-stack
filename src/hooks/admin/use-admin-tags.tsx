/**
 * Admin Tags Hook
 *
 * React Query hooks for admin tag management.
 * Provides query options and mutations for admin-level tag operations.
 */

import {
  queryOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  deleteAdminTag,
  getAdminTagById,
  getAdminTags,
  toggleAdminTagActive,
} from '@/lib/functions/admin/tag';
import type { AdminTagsQuery } from '@/lib/validators/shared/tag-query';

// ============================================================================
// Query Keys
// ============================================================================

export const adminTagsKeys = {
  all: ['admin', 'tags'] as const,
  lists: () => [...adminTagsKeys.all, 'list'] as const,
  list: (params: Partial<AdminTagsQuery>) =>
    [...adminTagsKeys.lists(), params] as const,
  details: () => [...adminTagsKeys.all, 'detail'] as const,
  detail: (id: string) => [...adminTagsKeys.details(), id] as const,
};

// ============================================================================
// Default Query Params
// ============================================================================

const defaultParams: Partial<AdminTagsQuery> = {
  limit: 10,
  offset: 0,
  sortBy: 'sortOrder',
  sortDirection: 'asc',
};

// ============================================================================
// Query Options
// ============================================================================

/**
 * Query options for fetching admin tags with pagination and filters
 */
export const adminTagsQueryOptions = (params: Partial<AdminTagsQuery> = {}) => {
  const mergedParams = { ...defaultParams, ...params };
  return queryOptions({
    queryKey: adminTagsKeys.list(mergedParams),
    queryFn: () => getAdminTags({ data: mergedParams }),
  });
};

/**
 * Query options for fetching a single tag by ID (admin)
 */
export const adminTagByIdQueryOptions = (id: string) =>
  queryOptions({
    queryKey: adminTagsKeys.detail(id),
    queryFn: () => getAdminTagById({ data: { id } }),
    enabled: !!id,
  });

// ============================================================================
// Mutations Hook
// ============================================================================

/**
 * Hook providing mutations for admin tag management
 */
export const useAdminTagMutations = () => {
  const queryClient = useQueryClient();

  const invalidateTags = () => {
    queryClient.invalidateQueries({
      queryKey: adminTagsKeys.all,
    });
  };

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) =>
      toggleAdminTagActive({ data: { id, isActive } }),
    onSuccess: (result) => {
      toast.success(result.message || 'Tag status updated');
      invalidateTags();
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update tag status');
    },
  });

  const deleteTagMutation = useMutation({
    mutationFn: (id: string) => deleteAdminTag({ data: { id } }),
    onSuccess: () => {
      toast.success('Tag deleted successfully');
      invalidateTags();
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete tag');
    },
  });

  const mutationState = {
    deletingId: deleteTagMutation.isPending
      ? (deleteTagMutation.variables ?? null)
      : null,
    togglingId: toggleActiveMutation.isPending
      ? (toggleActiveMutation.variables?.id ?? null)
      : null,
    isAnyMutating:
      toggleActiveMutation.isPending || deleteTagMutation.isPending,
  };

  return {
    toggleActive: toggleActiveMutation.mutateAsync,
    deleteTag: deleteTagMutation.mutateAsync,
    isTogglingActive: toggleActiveMutation.isPending,
    isDeleting: deleteTagMutation.isPending,
    mutationState,
    isTagMutating: (id: string) =>
      mutationState.deletingId === id || mutationState.togglingId === id,
  };
};

// ============================================================================
// Combined Hook
// ============================================================================

/**
 * Combined hook for admin tag management
 */
export const useAdminTags = () => {
  const mutations = useAdminTagMutations();

  return {
    adminTagsQueryOptions,
    adminTagByIdQueryOptions,
    ...mutations,
  };
};
