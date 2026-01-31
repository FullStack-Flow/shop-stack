import {
  queryOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createTaxRate,
  deleteTaxRate,
  getTaxRateById,
  getTaxRates,
  toggleTaxRateActive,
  updateTaxRate,
} from "@/lib/functions/vendor/tax";
import type {
  CreateTaxRateInput,
  UpdateTaxRateInput,
  VendorTaxRatesQuery,
} from "@/lib/validators/shared/tax-rate-query";
import type { TaxRateMutationState } from "@/types/taxes";

export const vendorTaxRatesKeys = {
  all: (shopId: string) => ["vendor", "tax-rates", shopId] as const,
  lists: (shopId: string) =>
    [...vendorTaxRatesKeys.all(shopId), "list"] as const,
  list: (params: VendorTaxRatesQuery) =>
    [...vendorTaxRatesKeys.lists(params.shopId), params] as const,
  details: (shopId: string) =>
    [...vendorTaxRatesKeys.all(shopId), "detail"] as const,
  detail: (shopId: string, id: string) =>
    [...vendorTaxRatesKeys.details(shopId), id] as const,
};

const defaultParams: Partial<VendorTaxRatesQuery> = {
  limit: 10,
  offset: 0,
  sortBy: "priority",
  sortDirection: "asc",
};

export const taxRatesQueryOptions = (params: VendorTaxRatesQuery) =>
  queryOptions({
    queryKey: vendorTaxRatesKeys.list(params),
    queryFn: () => getTaxRates({ data: { ...defaultParams, ...params } }),
    enabled: !!params.shopId,
  });

export const taxRateByIdQueryOptions = (id: string, shopId: string) =>
  queryOptions({
    queryKey: vendorTaxRatesKeys.detail(shopId, id),
    queryFn: () => getTaxRateById({ data: { id, shopId } }),
    enabled: !!id && !!shopId,
  });

export const useTaxRateMutations = (shopId: string) => {
  const queryClient = useQueryClient();

  const invalidateTaxRates = () => {
    queryClient.invalidateQueries({
      queryKey: vendorTaxRatesKeys.all(shopId),
    });
  };

  const createTaxRateMutation = useMutation({
    mutationFn: async (data: Omit<CreateTaxRateInput, "shopId">) => {
      const result = await createTaxRate({ data: { ...data, shopId } });
      return result;
    },
    onSuccess: (result) => {
      toast.success(`Tax rate "${result.taxRate?.name}" created successfully!`);
      invalidateTaxRates();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create tax rate");
    },
  });

  const updateTaxRateMutation = useMutation({
    mutationFn: async (
      data: Omit<UpdateTaxRateInput, "shopId"> & { id: string },
    ) => {
      const result = await updateTaxRate({ data: { ...data, shopId } });
      return result;
    },
    onSuccess: (result) => {
      toast.success(`Tax rate "${result.taxRate?.name}" updated successfully!`);
      invalidateTaxRates();
      if (result.taxRate?.id) {
        queryClient.invalidateQueries({
          queryKey: vendorTaxRatesKeys.detail(shopId, result.taxRate.id),
        });
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update tax rate");
    },
  });

  const deleteTaxRateMutation = useMutation({
    mutationFn: async (taxRateId: string) => {
      const result = await deleteTaxRate({
        data: { id: taxRateId, shopId },
      });
      return result;
    },
    onSuccess: () => {
      toast.success("Tax rate deleted successfully");
      invalidateTaxRates();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete tax rate");
    },
  });

  const toggleTaxRateActiveMutation = useMutation({
    mutationFn: async (taxRateId: string) => {
      const result = await toggleTaxRateActive({
        data: { id: taxRateId, shopId },
      });
      return { ...result, taxRateId };
    },
    onSuccess: (result) => {
      toast.success(result.message || "Tax rate status updated");
      invalidateTaxRates();
      queryClient.invalidateQueries({
        queryKey: vendorTaxRatesKeys.detail(shopId, result.taxRateId),
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update tax rate status");
    },
  });

  const mutationState: TaxRateMutationState = {
    creatingId: createTaxRateMutation.isPending ? "new" : null,
    deletingId: deleteTaxRateMutation.isPending
      ? (deleteTaxRateMutation.variables ?? null)
      : null,
    updatingId: updateTaxRateMutation.isPending
      ? (updateTaxRateMutation.variables?.id ?? null)
      : null,
    togglingId: toggleTaxRateActiveMutation.isPending
      ? (toggleTaxRateActiveMutation.variables ?? null)
      : null,
    isAnyMutating:
      createTaxRateMutation.isPending ||
      updateTaxRateMutation.isPending ||
      deleteTaxRateMutation.isPending ||
      toggleTaxRateActiveMutation.isPending,
  };

  return {
    createTaxRate: createTaxRateMutation.mutateAsync,
    updateTaxRate: updateTaxRateMutation.mutateAsync,
    deleteTaxRate: deleteTaxRateMutation.mutateAsync,
    toggleTaxRateActive: toggleTaxRateActiveMutation.mutateAsync,
    isCreating: createTaxRateMutation.isPending,
    isUpdating: updateTaxRateMutation.isPending,
    isDeleting: deleteTaxRateMutation.isPending,
    isToggling: toggleTaxRateActiveMutation.isPending,
    mutationState,
    isTaxRateMutating: (id: string) =>
      mutationState.deletingId === id ||
      mutationState.updatingId === id ||
      mutationState.togglingId === id,
  };
};

export const useTaxRates = (shopId: string) => {
  const mutations = useTaxRateMutations(shopId);

  return {
    taxRatesQueryOptions: (params: Omit<VendorTaxRatesQuery, "shopId">) =>
      taxRatesQueryOptions({ ...params, shopId }),
    taxRateByIdQueryOptions: (id: string) =>
      taxRateByIdQueryOptions(id, shopId),
    queryKeys: vendorTaxRatesKeys,
    ...mutations,
  };
};
