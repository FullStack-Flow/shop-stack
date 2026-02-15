/**
 * Admin Attributes Hook
 *
 * React Query hooks for admin attribute management.
 * Provides query options and mutations for admin-level attribute operations.
 * Supports React Query Suspense for SSR integration.
 */

import {
  queryOptions,
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { toast } from "sonner";
import {
  deleteAdminAttribute,
  getAdminAttributeById,
  getAdminAttributes,
  toggleAdminAttributeActive,
  updateAdminAttribute,
} from "@/lib/functions/admin/attribute.ts";
import type { AdminAttributesQuery } from "@/lib/validators/shared/attribute-query";
import type {
  AdminAttributeMutationState,
  ToggleActiveParams,
  UpdateAttributeParams,
} from "@/types/attributes";

// ============================================================================
// Query Keys
// ============================================================================

export const adminAttributesKeys = {
  all: ["admin", "attributes"] as const,
  lists: () => [...adminAttributesKeys.all, "list"] as const,
  list: (params: Partial<AdminAttributesQuery>) =>
    [...adminAttributesKeys.lists(), params] as const,
  details: () => [...adminAttributesKeys.all, "detail"] as const,
  detail: (id: string) => [...adminAttributesKeys.details(), id] as const,
};

// ============================================================================
// Default Query Params
// ============================================================================

const defaultParams: Partial<AdminAttributesQuery> = {
  limit: 10,
  offset: 0,
  sortBy: "sortOrder",
  sortDirection: "asc",
};

// ============================================================================
// Query Options (for SSR/Suspense compatibility)
// ============================================================================

/**
 * Query options for fetching admin attributes with pagination and filters
 * Compatible with both useQuery and useSuspenseQuery
 */
export const adminAttributesQueryOptions = (
  params: Partial<AdminAttributesQuery> = {},
) => {
  const mergedParams = { ...defaultParams, ...params };
  return queryOptions({
    queryKey: adminAttributesKeys.list(mergedParams),
    queryFn: () => getAdminAttributes({ data: mergedParams }),
    staleTime: 30 * 1000, // 30 seconds
  });
};

/**
 * Query options for fetching a single attribute by ID (admin)
 * Compatible with both useQuery and useSuspenseQuery
 */
export const adminAttributeByIdQueryOptions = (id: string) =>
  queryOptions({
    queryKey: adminAttributesKeys.detail(id),
    queryFn: () => getAdminAttributeById({ data: { id } }),
    enabled: !!id,
    staleTime: 60 * 1000, // 1 minute
  });

/**
 * Query options for fetching a single attribute by ID (admin) - Suspense version
 * Omits 'enabled' field as useSuspenseQuery doesn't support conditional execution
 */
export const adminAttributeByIdSuspenseOptions = (id: string) =>
  queryOptions({
    queryKey: adminAttributesKeys.detail(id),
    queryFn: () => getAdminAttributeById({ data: { id } }),
    staleTime: 60 * 1000, // 1 minute
  });

// ============================================================================
// Suspense Hooks (for SSR with loader prefetching)
// ============================================================================

/**
 * Suspense-enabled hook for fetching admin attributes
 * Use this when you want React Suspense to handle loading states
 */
export const useAdminAttributesSuspense = (
  params: Partial<AdminAttributesQuery> = {},
) => {
  return useSuspenseQuery(adminAttributesQueryOptions(params));
};

/**
 * Suspense-enabled hook for fetching a single attribute
 */
export const useAdminAttributeByIdSuspense = (id: string) => {
  return useSuspenseQuery(adminAttributeByIdSuspenseOptions(id));
};

// ============================================================================
// Mutations Hook with Enhanced Loading States
// ============================================================================

/**
 * Hook providing mutations for admin attribute management
 * Includes granular loading states for individual operations
 */
export const useAdminAttributeMutations = () => {
  const queryClient = useQueryClient();

  const invalidateAttributes = () => {
    queryClient.invalidateQueries({
      queryKey: adminAttributesKeys.all,
    });
  };

  // Toggle active mutation with optimistic updates
  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: ToggleActiveParams) =>
      toggleAdminAttributeActive({ data: { id, isActive } }),
    onMutate: async ({ id, isActive }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: adminAttributesKeys.all });

      // Return context for rollback
      return { id, isActive };
    },
    onSuccess: (result) => {
      toast.success(result.message || "Attribute status updated");
      invalidateAttributes();
    },
    onError: (error: Error, _variables, context) => {
      toast.error(error.message || "Failed to update attribute status");
      // Invalidate to refetch correct state
      if (context) {
        invalidateAttributes();
      }
    },
  });

  // Delete mutation
  const deleteAttributeMutation = useMutation({
    mutationFn: (id: string) => deleteAdminAttribute({ data: { id } }),
    onSuccess: () => {
      toast.success("Attribute deleted successfully");
      invalidateAttributes();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete attribute");
    },
  });

  // Update mutation
  const updateAttributeMutation = useMutation({
    mutationFn: (data: UpdateAttributeParams) => updateAdminAttribute({ data }),
    onSuccess: (result: { message?: string }) => {
      toast.success(result.message || "Attribute updated successfully");
      invalidateAttributes();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update attribute");
    },
  });

  // Enhanced mutation state with specific IDs
  const mutationState: AdminAttributeMutationState = {
    togglingId: toggleActiveMutation.isPending
      ? (toggleActiveMutation.variables?.id ?? null)
      : null,
    deletingId: deleteAttributeMutation.isPending
      ? (deleteAttributeMutation.variables ?? null)
      : null,
    updatingId: updateAttributeMutation.isPending
      ? (updateAttributeMutation.variables?.id ?? null)
      : null,
    isAnyMutating:
      toggleActiveMutation.isPending ||
      deleteAttributeMutation.isPending ||
      updateAttributeMutation.isPending,
  };

  return {
    toggleActive: toggleActiveMutation.mutateAsync,
    deleteAttribute: deleteAttributeMutation.mutateAsync,
    updateAttribute: updateAttributeMutation.mutateAsync,

    isTogglingActive: toggleActiveMutation.isPending,
    isDeleting: deleteAttributeMutation.isPending,
    isUpdating: updateAttributeMutation.isPending,

    mutationState,

    // Helper function to check if a specific attribute is being mutated
    isAttributeMutating: (id: string) =>
      mutationState.togglingId === id ||
      mutationState.deletingId === id ||
      mutationState.updatingId === id,
  };
};

// ============================================================================
// Combined Hook
// ============================================================================

/**
 * Combined hook for admin attribute management
 */
export const useAdminAttributes = () => {
  const mutations = useAdminAttributeMutations();

  return {
    adminAttributesQueryOptions,
    adminAttributeByIdQueryOptions,
    queryKeys: adminAttributesKeys,
    ...mutations,
  };
};
