import type { SQL } from "drizzle-orm";
import type { PaginatedResponse } from "./api-response";

export interface Brand {
  id: string;
  name: string;
  slug: string;
  website?: string;
  logo?: string;
  description?: string;
}

export interface BrandPermissions {
  canDelete?: boolean;
  canEdit?: boolean;
  canView?: boolean;
}

export interface BatchedBrandRelations {
  productCountsMap: Map<string, number>;
  shopsMap: Map<string, { id: string; name: string; slug: string }>;
}

export interface NormalizedBrand {
  id: string;
  shopId: string;
  shopName?: string | null;
  shopSlug?: string | null;
  name: string;
  slug: string;
  description?: string | null;
  logo?: string | null;
  website?: string | null;
  sortOrder: number;
  isActive: boolean;
  productCount: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Shared brand list response type
 */
export type BrandListResponse = PaginatedResponse<NormalizedBrand>;

export interface BrandQueryOptions {
  baseConditions?: SQL[];
  search?: string;
  isActive?: boolean;
  limit?: number;
  offset?: number;
  sortBy?: "name" | "createdAt" | "sortOrder" | "productCount";
  sortDirection?: "asc" | "desc";
  includeShopInfo?: boolean;
}

export interface BrandQueryResult {
  data: NormalizedBrand[];
  total: number;
  limit: number;
  offset: number;
}

export interface BrandItem {
  id: string;
  shopId: string;
  name: string;
  slug: string;
  description?: string | null;
  logo?: string | null;
  website?: string | null;
  sortOrder: number;
  isActive: boolean;
  productCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ListBrandsQuery {
  shopId: string;
  limit?: number;
  offset?: number;
  search?: string;
  isActive?: boolean;
  sortBy?: "name" | "createdAt" | "sortOrder" | "productCount";
  sortDirection?: "asc" | "desc";
}

export interface CreateBrandResponse {
  success: boolean;
  brand: BrandItem;
  message?: string;
}

export interface UpdateBrandResponse {
  success: boolean;
  brand: BrandItem;
  message?: string;
}

export interface DeleteBrandResponse {
  success: boolean;
  message: string;
}

export interface BrandFormValues {
  name: string;
  slug: string;
  website: string;
  description: string;
  logo: string | null;
}
