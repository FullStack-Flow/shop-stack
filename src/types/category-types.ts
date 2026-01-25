import type { SQL } from "drizzle-orm";
import type { PaginatedResponse } from "./api-response";

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  icon?: string;
  parentId?: string;
  level: number;
  productCount: number;
  subcategories?: Category[];
  isActive: boolean;
  featured?: boolean;
  sortOrder: number;
}

export interface CategoryFilters {
  search?: string;
  featured?: boolean;
  parentId?: string;
  level?: number;
}

export interface CategoryWithChildren extends Category {
  subcategories: CategoryWithChildren[];
  productCount: number; // Total products including subcategories
}

export interface CategoryBreadcrumb {
  id: string;
  name: string;
  slug: string;
}

export interface CategoryFormValues {
  name: string;
  slug: string;
  description: string;
  image: string | null;
  icon: string;
  parentId: string;
}

export interface CategoryOption {
  id: string;
  name: string;
}

export interface CategoryPermissions {
  canDelete: boolean;
  canEdit: boolean;
  canView: boolean;
  canToggleStatus: boolean;
}

export interface BatchedCategoryRelations {
  parentNamesMap: Map<string, string>;
  productCountsMap: Map<string, number>;
  shopsMap: Map<string, { id: string; name: string; slug: string }>;
}

export interface NormalizedCategory {
  id: string;
  shopId: string;
  shopName?: string | null;
  shopSlug?: string | null;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  icon?: string | null;
  parentId?: string | null;
  parentName?: string | null;
  level: number;
  sortOrder: number;
  isActive: boolean;
  featured: boolean;
  productCount: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Shared category list response type
 * Used across vendor, admin, and store category functions
 */
export type CategoryListResponse = PaginatedResponse<NormalizedCategory>;

export interface CategoryQueryOptions {
  baseConditions?: SQL[];
  search?: string;
  parentId?: string | null;
  isActive?: boolean;
  featured?: boolean;
  limit?: number;
  offset?: number;
  sortBy?: "name" | "createdAt" | "sortOrder" | "productCount";
  sortDirection?: "asc" | "desc";
  includeShopInfo?: boolean;
}

export interface CategoryQueryResult {
  data: NormalizedCategory[];
  total: number;
  limit: number;
  offset: number;
}
