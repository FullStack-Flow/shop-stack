/**
 * Tax Rate Types
 *
 * Type definitions for tax rates in the marketplace.
 */

export interface TaxRateItem {
  id: string;
  shopId: string;
  name: string;
  rate: string;
  country: string;
  state?: string;
  zip?: string;
  priority: string;
  isActive: boolean;
  isCompound: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TaxRateFormValues {
  name: string;
  rate: number;
  country: string;
  state?: string;
  zip?: string;
  priority: number;
  isActive: boolean;
  isCompound: boolean;
}

export interface TaxRateFilters {
  isActive?: boolean;
  country?: string;
  search?: string;
}

export interface TaxRateMutationState {
  creatingId: string | null;
  deletingId: string | null;
  updatingId: string | null;
  togglingId: string | null;
  isAnyMutating: boolean;
}
