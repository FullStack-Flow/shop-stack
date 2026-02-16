import type { SQL } from "drizzle-orm";
import type { PaginatedResponse } from "./api-response";

export interface AttributeValue {
  id: string;
  name: string;
  slug: string;
  value: string;
}

export interface Attribute {
  id: string;
  name: string;
  slug: string;
  values: AttributeValue[];
  type: "select" | "color" | "image" | "label";
}

export interface AttributeFormValues {
  name: string;
  slug: string;
  type: "select" | "color" | "image" | "label";
  values: AttributeValue[];
}

export interface AttributePermissions {
  canDelete: boolean;
  canEdit: boolean;
  canView: boolean;
}

export interface AttributeValueItem {
  id: string;
  name: string;
  slug: string;
  value?: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface BatchedAttributeRelations {
  productCountsMap: Map<string, number>;
  valuesMap: Map<string, AttributeValueItem[]>;
  shopsMap: Map<string, { id: string; name: string; slug: string }>;
}

export interface AttributeItem {
  id: string;
  shopId: string;
  shopName?: string | null;
  shopSlug?: string | null;
  name: string;
  slug: string;
  type: "select" | "color" | "image" | "label";
  values: AttributeValueItem[];
  sortOrder: number;
  isActive: boolean;
  productCount: number;
  createdAt: string;
  updatedAt: string;
}

export type AttributeListResponse = PaginatedResponse<AttributeItem>;

export interface AttributeQueryOptions {
  baseConditions?: SQL[];
  search?: string;
  type?: "select" | "color" | "image" | "label";
  isActive?: boolean;
  limit?: number;
  offset?: number;
  sortBy?: "name" | "createdAt" | "sortOrder";
  sortDirection?: "asc" | "desc";
  includeShopInfo?: boolean;
  includeValues?: boolean;
}

export interface AttributeQueryResult {
  data: AttributeItem[];
  total: number;
  limit: number;
  offset: number;
}

export interface ListAttributesQuery {
  shopId: string;
  limit?: number;
  offset?: number;
  search?: string;
  type?: "select" | "color" | "image" | "label";
  isActive?: boolean;
  sortBy?: "name" | "createdAt" | "sortOrder";
  sortDirection?: "asc" | "desc";
}

/**
 * List attributes response with pagination
 */
export interface ListAttributesResponse {
  data: AttributeItem[];
  total: number;
  limit?: number;
  offset?: number;
}

/**
 * Create attribute response
 */
export interface CreateAttributeResponse {
  success: boolean;
  attribute: AttributeItem;
  message?: string;
}

/**
 * Update attribute response
 */
export interface UpdateAttributeResponse {
  success: boolean;
  attribute: AttributeItem;
  message?: string;
}

/**
 * Delete attribute response
 */
export interface DeleteAttributeResponse {
  success: boolean;
  message: string;
}

export interface ToggleActiveParams {
  id: string;
  isActive: boolean;
}

export interface UpdateAttributeParams {
  id: string;
  name?: string;
  slug?: string;
  type?: "select" | "color" | "image" | "label";
  values?: { name: string; slug: string; value: string }[];
  sortOrder?: number;
  isActive?: boolean;
}

export interface AdminAttributeMutationState {
  togglingId: string | null;
  deletingId: string | null;
  updatingId: string | null;
  isAnyMutating: boolean;
}
