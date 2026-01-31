import type { SQL } from "drizzle-orm";
import type { PaginatedResponse } from "./api-response";

export interface Tag {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
}

export interface TagFormValues {
  name: string;
  slug: string;
  description?: string | null;
  isActive?: boolean;
  sortOrder?: number;
}

export interface TagPermissions {
  canDelete: boolean;
  canEdit: boolean;
  canView: boolean;
  canCreate: boolean;
}

export interface TagItem {
  id: string;
  shopId: string;
  shopName?: string | null;
  shopSlug?: string | null;
  name: string;
  slug: string;
  description?: string | null;
  sortOrder: number;
  isActive: boolean;
  productCount: number;
  createdAt: string;
  updatedAt: string;
}

export type TagListResponse = PaginatedResponse<TagItem>;

export interface BatchedTagRelations {
  shopsMap: Map<string, { id: string; name: string; slug: string }>;
}

export interface TagQueryOptions {
  baseConditions?: SQL[];
  search?: string;
  isActive?: boolean;
  limit?: number;
  offset?: number;
  sortBy?: "name" | "createdAt" | "sortOrder" | "productCount";
  sortDirection?: "asc" | "desc";
  includeShopInfo?: boolean;
}

export interface TagQueryResult {
  data: TagItem[];
  total: number;
  limit: number;
  offset: number;
}

export interface ListTagsQuery {
  shopId: string;
  limit?: number;
  offset?: number;
  search?: string;
  isActive?: boolean;
  sortBy?: "name" | "createdAt" | "sortOrder" | "productCount";
  sortDirection?: "asc" | "desc";
}

/**
 * List tags response with pagination
 */
export interface ListTagsResponse {
  data: TagItem[];
  total: number;
  limit?: number;
  offset?: number;
}

/**
 * Create tag response
 */
export interface CreateTagResponse {
  success: boolean;
  tag: TagItem;
  message?: string;
}

/**
 * Update tag response
 */
export interface UpdateTagResponse {
  success: boolean;
  tag: TagItem;
  message?: string;
}

/**
 * Delete tag response
 */
export interface DeleteTagResponse {
  success: boolean;
  message: string;
}
