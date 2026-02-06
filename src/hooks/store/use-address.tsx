/**
 * Customer Addresses Hook
 *
 * React hook for address management in the customer account area.
 * Uses TanStack Query with server functions for SSR-compatible data fetching.
 */

import {
  queryOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createAddress,
  deleteAddress,
  getUserAddresses,
  setDefaultAddress,
  updateAddress,
} from "@/lib/functions/store/address";
import type {
  CreateAddressInput,
  DeleteAddressInput,
  UpdateAddressInput,
} from "@/lib/validators/address";

// ============================================================================
// Query Keys
// ============================================================================

export const addressKeys = {
  all: ["account", "addresses"] as const,
  lists: () => [...addressKeys.all, "list"] as const,
  details: () => [...addressKeys.all, "detail"] as const,
};

// ============================================================================
// Default Query Params
// ============================================================================

const defaultParams = {};

// ============================================================================
// Query Options
// ============================================================================

/**
 * Query options for fetching user addresses
 */
export const addressesQueryOptions = (_params = defaultParams) =>
  queryOptions({
    queryKey: addressKeys.lists(),
    queryFn: () => getUserAddresses(),
  });

// ============================================================================
// Combined Hook
// ============================================================================

/**
 * Combined hook for address queries and mutations
 * Provides a unified interface for all address operations
 */
export const useAddress = () => {
  const queryClient = useQueryClient();

  const invalidateAddresses = () => {
    queryClient.invalidateQueries({
      queryKey: addressKeys.lists(),
    });
  };

  return {
    addressesQueryOptions,
    invalidateAddresses,
  };
};

// ============================================================================
// Mutations Hook
// ============================================================================

/**
 * Hook providing mutations for address management
 */
export const useAddressMutations = () => {
  const queryClient = useQueryClient();

  const invalidateAddresses = () => {
    queryClient.invalidateQueries({
      queryKey: addressKeys.lists(),
    });
  };

  // Create address mutation
  const createAddressMutation = useMutation({
    mutationFn: async (data: CreateAddressInput) => {
      const result = await createAddress({ data });
      return result;
    },
    onSuccess: () => {
      toast.success("Address added successfully");
      invalidateAddresses();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to add address");
    },
  });

  // Update address mutation
  const updateAddressMutation = useMutation({
    mutationFn: async (data: UpdateAddressInput) => {
      const result = await updateAddress({ data });
      return result;
    },
    onSuccess: () => {
      toast.success("Address updated successfully");
      invalidateAddresses();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update address");
    },
  });

  // Delete address mutation
  const deleteAddressMutation = useMutation({
    mutationFn: async (data: DeleteAddressInput) => {
      const result = await deleteAddress({ data });
      return result;
    },
    onSuccess: () => {
      toast.success("Address deleted successfully");
      invalidateAddresses();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete address");
    },
  });

  // Set default address mutation
  const setDefaultAddressMutation = useMutation({
    mutationFn: async (data: DeleteAddressInput) => {
      const result = await setDefaultAddress({ data });
      return result;
    },
    onSuccess: () => {
      toast.success("Default address updated");
      invalidateAddresses();
    },
    onError: (_error: Error) => {
      toast.error("Failed to set default address");
    },
  });

  return {
    createAddress: createAddressMutation.mutateAsync,
    updateAddress: updateAddressMutation.mutateAsync,
    deleteAddress: deleteAddressMutation.mutateAsync,
    setDefaultAddress: setDefaultAddressMutation.mutateAsync,
    isCreating: createAddressMutation.isPending,
    isUpdating: updateAddressMutation.isPending,
    isDeleting: deleteAddressMutation.isPending,
    isSettingDefault: setDefaultAddressMutation.isPending,
  };
};
