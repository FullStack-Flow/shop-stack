/**
 * Coupon Types
 *
 * Type definitions for coupons in the marketplace.
 */

import type { SQL } from "drizzle-orm";
import type {
  Coupon,
  CouponApplicability as ZodCouponApplicability,
  CouponCategoryRelation as ZodCouponCategoryRelation,
  CouponFormValues as ZodCouponFormValues,
  CouponProductRelation as ZodCouponProductRelation,
  CouponStatus as ZodCouponStatus,
  CouponType as ZodCouponType,
} from "@/lib/validators/shared/coupon-query";
import type { PaginatedResponse } from "./api-response";

// ============================================================================
// Enums
// ============================================================================

export type CouponType = ZodCouponType;
export type CouponStatus = ZodCouponStatus;
export type CouponApplicability = ZodCouponApplicability;

// ============================================================================
// Base Coupon Relations
// ============================================================================

export type CouponProductRelation = ZodCouponProductRelation;
export type CouponCategoryRelation = ZodCouponCategoryRelation;

// ============================================================================
// Coupon Item (Full Entity)
// ============================================================================

export type CouponItem = Coupon;

export interface NormalizedCoupon extends CouponItem {
  shopName?: string | null;
  shopSlug?: string | null;
  vendorId?: string | null;
  vendorName?: string | null;
}

// ============================================================================
// Form Values
// ============================================================================

export type CouponFormValues = ZodCouponFormValues;

// ============================================================================
// Permissions
// ============================================================================

export interface CouponPermissions {
  canDelete: boolean;
  canEdit: boolean;
  canView: boolean;
  canCreate: boolean;
  canToggleStatus: boolean;
}

// ============================================================================
// Filters & Query Options
// ============================================================================

export interface CouponFilters {
  isActive?: boolean;
  type?: CouponType;
  status?: CouponStatus;
  applicableTo?: CouponApplicability;
  isExpired?: boolean;
  isScheduled?: boolean;
  search?: string;
}

export interface CouponQueryOptions {
  baseConditions?: SQL[];
  search?: string;
  type?: CouponType;
  status?: CouponStatus;
  applicableTo?: CouponApplicability;
  isActive?: boolean;
  isExpired?: boolean;
  isScheduled?: boolean;
  activeFrom?: Date;
  activeTo?: Date;
  limit?: number;
  offset?: number;
  sortBy?:
    | "code"
    | "discountAmount"
    | "usageCount"
    | "activeFrom"
    | "activeTo"
    | "createdAt";
  sortDirection?: "asc" | "desc";
  includeShopInfo?: boolean;
  includeVendorInfo?: boolean;
}

// ============================================================================
// Query Types
// ============================================================================

export interface ListCouponsQuery {
  shopId: string;
  limit?: number;
  offset?: number;
  search?: string;
  isActive?: boolean;
  type?: CouponType;
  status?: CouponStatus;
  applicableTo?: CouponApplicability;
  sortBy?:
    | "code"
    | "discountAmount"
    | "usageCount"
    | "activeFrom"
    | "activeTo"
    | "createdAt";
  sortDirection?: "asc" | "desc";
}

// ============================================================================
// Response Types
// ============================================================================

export type CouponListResponse = PaginatedResponse<NormalizedCoupon>;

export interface BatchedCouponRelations {
  productsMap: Map<string, { productId: string; productName: string }[]>;
  categoriesMap: Map<string, { categoryId: string; categoryName: string }[]>;
  shopsMap: Map<
    string,
    { id: string; name: string; slug: string; vendorId?: string }
  >;
  vendorsMap: Map<string, { id: string; businessName: string | null }>;
}

export interface ListCouponsResponse {
  data: NormalizedCoupon[];
  total: number;
  limit: number;
  offset: number;
}

export interface CreateCouponResponse {
  success: boolean;
  coupon: NormalizedCoupon;
  message?: string;
}

export interface UpdateCouponResponse {
  success: boolean;
  coupon: NormalizedCoupon;
  message?: string;
}

export interface DeleteCouponResponse {
  success: boolean;
  message: string;
}

export interface ValidateCouponResponse {
  valid: boolean;
  coupon?: NormalizedCoupon;
  message?: string;
  discountAmount?: number;
  applicableAmount?: number;
  invalidReason?:
    | "not_found"
    | "inactive"
    | "not_started"
    | "expired"
    | "usage_limit_reached"
    | "user_limit_reached"
    | "minimum_not_met"
    | "no_applicable_products";
}

export interface AvailableCouponsResponse {
  coupons: (NormalizedCoupon & {
    userUsageCount: number;
    isEligible: boolean;
  })[];
}

export interface ApplyCouponToOrderResponse {
  success: boolean;
  message: string;
  discountAmount: number;
  couponId?: string;
}

export interface UserCouponUsageResponse {
  usage: CouponUsageInfo[];
}

export interface CouponAnalyticsResponse {
  totalUsage: number;
  totalDiscount: number;
  usageByDay: { date: string; count: number; discount: number }[];
}

// ============================================================================
// Mutation State
// ============================================================================

export interface CouponMutationState {
  creatingId: string | null;
  deletingId: string | null;
  updatingId: string | null;
  isCreating: boolean;
  isAnyMutating: boolean;
}

// ============================================================================
// Validation Types
// ============================================================================

export interface CouponValidationResult {
  valid: boolean;
  message?: string;
  discountAmount?: number;
}

// ============================================================================
// Usage Types
// ============================================================================

export interface CouponUsageInfo {
  couponId: string;
  userId: string;
  orderId?: string;
  discountApplied: string;
  usedAt: string;
}
