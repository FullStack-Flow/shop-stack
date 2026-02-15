/**
 * Tax Rate Types
 *
 * Type definitions for tax rates in the marketplace.
 */

import type { SQL } from "drizzle-orm";
import type { PaginatedResponse } from "./api-response";

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
  isActive?: boolean;
  isCompound?: boolean;
}

export interface TaxPermissions {
  canDelete: boolean;
  canEdit: boolean;
  canView: boolean;
  canCreate: boolean;
}

export interface Taxes {
  id: string;
  name: string;
  rate: number;
  country: string;
  state?: string;
  zip?: string;
  priority: number;
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

/**
 * Tax Rate Query Options
 */
export interface TaxRateQueryOptions {
  baseConditions?: SQL[];
  limit?: number;
  offset?: number;
  sortBy?: "name" | "rate" | "priority" | "createdAt";
  sortDirection?: "asc" | "desc";
  search?: string;
  isActive?: boolean;
  country?: string;
  includeShopInfo?: boolean;
}

/**
 * Tax Rate Query Result
 */
export interface TaxRateQueryResult {
  data: NormalizedTaxRate[];
  total: number;
  limit: number;
  offset: number;
}

export interface NormalizedTaxRate extends TaxRateItem {
  shopName?: string | null;
  shopSlug?: string | null;
  productCount: number;
}

/**
 * Shared tax rate list response type
 */
export type TaxRateListResponse = PaginatedResponse<NormalizedTaxRate>;
