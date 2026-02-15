/**
 * Admin Tax Rates Hook
 *
 * React Query hooks for admin tax rate management.
 * Provides query options and mutations for admin-level tax rate operations.
 */

import {
  queryOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import {
  deleteAdminTaxRate,
  getAdminTaxRateById,
  getAdminTaxRates,
  toggleAdminTaxRateActive,
} from "@/lib/functions/admin/tax";
import type { AdminTaxRatesQuery } from "@/lib/validators/shared/tax-rate-query";

// ============================================================================
// Query Keys
// ============================================================================

export const adminTaxRatesKeys = {
  all: ["admin", "taxRates"] as const,
  lists: () => [...adminTaxRatesKeys.all, "list"] as const,
  list: (params: Partial<AdminTaxRatesQuery>) =>
    [...adminTaxRatesKeys.lists(), params] as const,
  details: () => [...adminTaxRatesKeys.all, "detail"] as const,
  detail: (id: string) => [...adminTaxRatesKeys.details(), id] as const,
};

// ============================================================================
// Default Query Params
// ============================================================================

const defaultParams: Partial<AdminTaxRatesQuery> = {
  limit: 10,
  offset: 0,
  sortBy: "priority",
  sortDirection: "asc",
};

// ============================================================================
// Query Options
// ============================================================================

/**
 * Query options for fetching admin tax rates with pagination and filters
 */
export const adminTaxRatesQueryOptions = (
  params: Partial<AdminTaxRatesQuery> = {},
) => {
  const mergedParams = { ...defaultParams, ...params };
  return queryOptions({
    queryKey: adminTaxRatesKeys.list(mergedParams),
    queryFn: () => getAdminTaxRates({ data: mergedParams }),
  });
};

/**
 * Query options for fetching a single tax rate by ID (admin)
 */
export const adminTaxRateByIdQueryOptions = (id: string) =>
  queryOptions({
    queryKey: adminTaxRatesKeys.detail(id),
    queryFn: () => getAdminTaxRateById({ data: { id } }),
    enabled: !!id,
  });

// ============================================================================
// Mutations Hook
// ============================================================================

/**
 * Hook providing mutations for admin tax rate management
 */
export const useAdminTaxRateMutations = () => {
  const queryClient = useQueryClient();

  const invalidateTaxRates = () => {
    queryClient.invalidateQueries({
      queryKey: adminTaxRatesKeys.all,
    });
  };

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) =>
      toggleAdminTaxRateActive({ data: { id, isActive } }),
    onSuccess: (result) => {
      toast.success(result.message || "Tax rate status updated");
      invalidateTaxRates();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update tax rate status");
    },
  });

  const deleteTaxRateMutation = useMutation({
    mutationFn: (id: string) => deleteAdminTaxRate({ data: { id } }),
    onSuccess: () => {
      toast.success("Tax rate deleted successfully");
      invalidateTaxRates();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete tax rate");
    },
  });

  const mutationState = {
    deletingId: deleteTaxRateMutation.isPending
      ? (deleteTaxRateMutation.variables ?? null)
      : null,
    togglingId: toggleActiveMutation.isPending
      ? (toggleActiveMutation.variables?.id ?? null)
      : null,
    isAnyMutating:
      toggleActiveMutation.isPending || deleteTaxRateMutation.isPending,
  };

  return {
    toggleActive: toggleActiveMutation.mutateAsync,
    deleteTaxRate: deleteTaxRateMutation.mutateAsync,
    isTogglingActive: toggleActiveMutation.isPending,
    isDeleting: deleteTaxRateMutation.isPending,
    mutationState,
    isTaxRateMutating: (id: string) =>
      mutationState.deletingId === id || mutationState.togglingId === id,
  };
};

// ============================================================================
// Combined Hook
// ============================================================================

/**
 * Combined hook for admin tax rate management
 */
export const useAdminTaxRates = () => {
  const mutations = useAdminTaxRateMutations();

  return {
    adminTaxRatesQueryOptions,
    adminTaxRateByIdQueryOptions,
    ...mutations,
  };
};
