import type { SQL } from "drizzle-orm";
import type { Brand as BrandSchema } from "@/lib/db/schema/brand-schema";
import type { PaginatedResponse } from "./api-response";

// Re-export Brand type from Drizzle schema as the single source of truth
export type Brand = BrandSchema;

export interface BrandPermissions {
  canDelete?: boolean;
  canEdit?: boolean;
  canView?: boolean;
}

export interface BatchedBrandRelations {
  productCountsMap: Map<string, number>;
  shopsMap: Map<string, { id: string; name: string; slug: string }>;
}

// Consolidated BrandItem interface (removed duplicate NormalizedBrand)
export interface BrandItem {
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
export type BrandListResponse = PaginatedResponse<BrandItem>;

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
  data: BrandItem[];
  total: number;
  limit: number;
  offset: number;
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
  website?: string;
  description?: string;
  logo?: string | null;
}
