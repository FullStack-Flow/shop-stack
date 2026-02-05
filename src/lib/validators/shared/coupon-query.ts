/**
 * Shared Coupon Query Validators
 *
 * Composable z schemas for coupon queries.
 * Uses base-query for common schemas to ensure DRY compliance.
 */

import { z } from "zod";
import {
  ADMIN_DEFAULT_LIMIT,
  createDeleteSchema,
  createGetByIdSchema,
  createToggleActiveSchema,
  isActiveField,
  optionalShopIdField,
  optionalVendorIdField,
  paginationFields,
  searchFields,
  shopScopeFields,
  shopSlugFields,
  sortDirectionEnum,
  storeIsActiveField,
  VENDOR_DEFAULT_LIMIT,
} from "./base-query";

// Re-export common types
export type { SortDirection } from "./base-query";

// ============================================================================
// Entity-Specific Enums
// ============================================================================

export const couponTypeEnum = z.enum(["percentage", "fixed", "free_shipping"]);

export const couponStatusEnum = z.enum([
  "active",
  "inactive",
  "expired",
  "scheduled",
]);

export const couponApplicabilityEnum = z.enum([
  "all",
  "specific_products",
  "specific_categories",
]);

export const couponSortByEnum = z.enum([
  "code",
  "discountAmount",
  "usageCount",
  "activeFrom",
  "activeTo",
  "createdAt",
]);

// ============================================================================
// Entity-Specific Filter Fields
// ============================================================================

export const couponFilterFields = {
  ...isActiveField,
  type: couponTypeEnum.optional(),
  status: couponStatusEnum.optional(),
  applicableTo: couponApplicabilityEnum.optional(),
  isExpired: z.coerce.boolean().optional(),
  isScheduled: z.coerce.boolean().optional(),
};

/**
 * Date range filter fields
 */
export const dateRangeFilterFields = {
  activeFrom: z.coerce.date().optional(),
  activeTo: z.coerce.date().optional(),
};

// ============================================================================
// Sort Fields
// ============================================================================

const sortFields = {
  sortBy: couponSortByEnum.optional().default("createdAt"),
  sortDirection: sortDirectionEnum.optional().default("desc"),
};

// ============================================================================
// Get by ID/Slug Schemas (using factory functions)
// ============================================================================

export const getCouponByIdSchema = createGetByIdSchema("Coupon");

/**
 * Schema for getting a coupon by code
 */
export const getCouponByCodeSchema = z.object({
  code: z.string().min(1, "Coupon code is required"),
  shopId: z.string().min(1, "Shop ID is required"),
  shopSlug: z.string().optional(),
});

// ============================================================================
// Composed Query Schemas
// ============================================================================

/**
 * Store Front Query Schema
 * - Public access (no auth)
 * - Limited filters (customer-facing only)
 * - Only active coupons
 */
export const storeCouponsQuerySchema = z.object({
  ...paginationFields,
  limit: paginationFields.limit.default(20),
  ...sortFields,
  ...searchFields,
  ...shopSlugFields,
  ...optionalShopIdField,
  ...storeIsActiveField,
});

/**
 * Admin Query Schema
 * - Admin auth required
 * - Full filter access
 * - Can see all coupons across all shops
 */
export const adminCouponsQuerySchema = z.object({
  ...paginationFields,
  limit: paginationFields.limit.default(ADMIN_DEFAULT_LIMIT),
  ...sortFields,
  ...searchFields,
  ...couponFilterFields,
  ...dateRangeFilterFields,
  ...optionalShopIdField,
  ...optionalVendorIdField,
});

/**
 * Vendor Query Schema
 * - Vendor auth required
 * - Shop ID is required (scoped to their shop)
 */
export const vendorCouponsQuerySchema = z.object({
  ...shopScopeFields,
  ...paginationFields,
  limit: paginationFields.limit.default(VENDOR_DEFAULT_LIMIT),
  ...sortFields,
  ...searchFields,
  ...couponFilterFields,
  ...dateRangeFilterFields,
});

// ============================================================================
// Action Schemas (using factory functions)
// ============================================================================

export const toggleCouponActiveSchema = createToggleActiveSchema("Coupon");

export const deleteCouponSchema = createDeleteSchema("Coupon");

/**
 * Schema for coupon analytics
 */
export const getCouponAnalyticsSchema = z.object({
  couponId: z.string().min(1, "Coupon ID is required"),
  shopId: z.string().min(1, "Shop ID is required"),
});

/**
 * Schema for linking products to a coupon
 */
export const linkCouponToProductsSchema = z.object({
  couponId: z.string().min(1, "Coupon ID is required"),
  shopId: z.string().min(1, "Shop ID is required"),
  productIds: z.array(z.string()).min(1, "At least one product is required"),
});

/**
 * Schema for linking categories to a coupon
 */
export const linkCouponToCategoriesSchema = z.object({
  couponId: z.string().min(1, "Coupon ID is required"),
  shopId: z.string().min(1, "Shop ID is required"),
  categoryIds: z.array(z.string()).min(1, "At least one category is required"),
});

// ============================================================================
// Entity Schemas
// ============================================================================

/**
 * Coupon Product Relation Schema
 */
export const couponProductRelationSchema = z.object({
  couponId: z.string(),
  productId: z.string(),
});

/**
 * Coupon Category Relation Schema
 */
export const couponCategoryRelationSchema = z.object({
  couponId: z.string(),
  categoryId: z.string(),
});

/**
 * Full Coupon Entity Schema (Response)
 */
export const couponSchema = z.object({
  id: z.string(),
  shopId: z.string(),
  code: z.string(),
  description: z.string().optional().nullable(),
  image: z.string().optional().nullable(),
  type: couponTypeEnum,
  discountAmount: z.string(),
  minimumCartAmount: z.string(),
  maximumDiscountAmount: z.string().optional().nullable(),
  activeFrom: z.string(),
  activeTo: z.string(),
  usageLimit: z.number().optional().nullable(),
  usageLimitPerUser: z.number().default(1),
  usageCount: z.number().default(0),
  isActive: z.boolean().default(true),
  status: couponStatusEnum,
  applicableTo: couponApplicabilityEnum,
  productIds: z.array(z.string()).default([]),
  categoryIds: z.array(z.string()).default([]),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// ============================================================================
// Coupon Entity Field Groups (DRY - Reusable across Create/Update)
// ============================================================================

/**
 * Required coupon identification fields (for create)
 */
const couponRequiredIdFields = {
  shopId: z.string().min(1, "Shop ID is required"),
};

/**
 * Optional coupon identification fields (for update)
 */
const couponOptionalIdFields = {
  id: z.string().min(1, "Coupon ID is required"),
  shopId: z.string().min(1, "Shop ID is required"),
};

/**
 * Coupon code field with validation
 */
const couponCodeField = z
  .string()
  .min(2, "Coupon code must be at least 2 characters")
  .max(50, "Coupon code must be at most 50 characters")
  .regex(
    /^[A-Z0-9_-]+$/,
    "Coupon code must contain only uppercase letters, numbers, hyphens, and underscores",
  );

/**
 * Coupon description field
 */
const couponDescriptionField = z.string().max(500).optional();

/**
 * Coupon type fields (for create - with defaults)
 */
const couponTypeFieldsCreate = {
  type: couponTypeEnum.optional().default("percentage"),
  applicableTo: couponApplicabilityEnum.optional().default("all"),
};

/**
 * Coupon type fields (for update - no defaults)
 */
const couponTypeFieldsUpdate = {
  type: couponTypeEnum.optional(),
  applicableTo: couponApplicabilityEnum.optional(),
};

/**
 * Coupon pricing fields (for create)
 */
const couponPricingFieldsCreate = {
  discountAmount: z.string().min(1, "Discount amount is required"),
  minimumCartAmount: z.string().optional().default("0"),
  maximumDiscountAmount: z.string().optional(),
};

/**
 * Coupon pricing fields (for update - all optional nullable)
 */
const couponPricingFieldsUpdate = {
  discountAmount: z.string().optional(),
  minimumCartAmount: z.string().optional().nullable(),
  maximumDiscountAmount: z.string().optional().nullable(),
};

/**
 * Coupon validity fields (for create)
 */
const couponValidityFieldsCreate = {
  activeFrom: z.string().min(1, "Start date is required"),
  activeTo: z.string().min(1, "End date is required"),
};

/**
 * Coupon validity fields (for update - optional)
 */
const couponValidityFieldsUpdate = {
  activeFrom: z.string().optional(),
  activeTo: z.string().optional(),
};

/**
 * Coupon usage limit fields (for create - with defaults)
 */
const couponUsageLimitFieldsCreate = {
  usageLimit: z.coerce.number().min(0).optional(),
  usageLimitPerUser: z.coerce.number().min(1).optional().default(1),
};

/**
 * Coupon usage limit fields (for update - no defaults)
 */
const couponUsageLimitFieldsUpdate = {
  usageLimit: z.coerce.number().min(0).optional().nullable(),
  usageLimitPerUser: z.coerce.number().min(1).optional(),
};

/**
 * Coupon flag fields (for create - with defaults)
 */
const couponFlagFieldsCreate = {
  isActive: z.boolean().optional().default(true),
};

/**
 * Coupon flag fields (for update - no defaults)
 */
const couponFlagFieldsUpdate = {
  isActive: z.boolean().optional(),
};

/**
 * Coupon relation arrays (for create)
 */
const couponRelationArraysCreate = {
  productIds: z.array(z.string()).optional().default([]),
  categoryIds: z.array(z.string()).optional().default([]),
};

/**
 * Coupon relation arrays (for update - no defaults)
 */
const couponRelationArraysUpdate = {
  productIds: z.array(z.string()).optional(),
  categoryIds: z.array(z.string()).optional(),
};

// ============================================================================
// Composed Coupon Schemas
// ============================================================================

/**
 * Schema for creating a new coupon (Vendor)
 */
export const createCouponSchema = z
  .object({
    ...couponRequiredIdFields,
    code: couponCodeField,
    description: couponDescriptionField,
    image: z.string().optional(),
    ...couponTypeFieldsCreate,
    ...couponPricingFieldsCreate,
    ...couponValidityFieldsCreate,
    ...couponUsageLimitFieldsCreate,
    ...couponFlagFieldsCreate,
    ...couponRelationArraysCreate,
  })
  .refine(
    (data) => {
      // Validate discount amount for non-free_shipping coupons
      if (
        data.type !== "free_shipping" &&
        parseFloat(data.discountAmount) <= 0
      ) {
        return false;
      }
      return true;
    },
    {
      message: "Discount amount is required for percentage and fixed coupons",
      path: ["discountAmount"],
    },
  )
  .refine(
    (data) => {
      // Validate percentage is not over 100
      if (data.type === "percentage" && parseFloat(data.discountAmount) > 100) {
        return false;
      }
      return true;
    },
    {
      message: "Percentage discount cannot exceed 100%",
      path: ["discountAmount"],
    },
  )
  .refine(
    (data) => {
      // Validate activeFrom is before activeTo
      const from = new Date(data.activeFrom);
      const to = new Date(data.activeTo);
      return from < to;
    },
    {
      message: "Start date must be before end date",
      path: ["activeTo"],
    },
  )
  .refine(
    (data) => {
      // Validate productIds are provided for specific_products
      if (data.applicableTo === "specific_products") {
        return data.productIds && data.productIds.length > 0;
      }
      return true;
    },
    {
      message: "At least one product must be selected",
      path: ["productIds"],
    },
  )
  .refine(
    (data) => {
      // Validate categoryIds are provided for specific_categories
      if (data.applicableTo === "specific_categories") {
        return data.categoryIds && data.categoryIds.length > 0;
      }
      return true;
    },
    {
      message: "At least one category must be selected",
      path: ["categoryIds"],
    },
  );

/**
 * Schema for coupon form values (UI-specific)
 */
export const couponFormSchema = z
  .object({
    code: couponCodeField,
    description: couponDescriptionField,
    image: z.string().optional(),
    type: couponTypeEnum.optional().default("percentage"),
    applicableTo: couponApplicabilityEnum.optional().default("all"),
    discountAmount: z.string().min(1, "Discount amount is required"),
    minimumCartAmount: z.string().optional().default("0"),
    maximumDiscountAmount: z.string().optional(),
    activeFrom: z.string().min(1, "Start date is required"),
    activeTo: z.string().min(1, "End date is required"),
    usageLimit: z.coerce.number().min(0).optional(),
    usageLimitPerUser: z.coerce.number().min(1).optional().default(1),
    isActive: z.boolean().optional().default(true),
    productIds: z.array(z.string()).optional().default([]),
    categoryIds: z.array(z.string()).optional().default([]),
  })
  .refine(
    (data) => {
      if (
        data.type !== "free_shipping" &&
        parseFloat(data.discountAmount) <= 0
      ) {
        return false;
      }
      return true;
    },
    {
      message: "Discount amount is required for percentage and fixed coupons",
      path: ["discountAmount"],
    },
  )
  .refine(
    (data) => {
      if (data.type === "percentage" && parseFloat(data.discountAmount) > 100) {
        return false;
      }
      return true;
    },
    {
      message: "Percentage discount cannot exceed 100%",
      path: ["discountAmount"],
    },
  )
  .refine(
    (data) => {
      const from = new Date(data.activeFrom);
      const to = new Date(data.activeTo);
      return from < to;
    },
    {
      message: "Start date must be before end date",
      path: ["activeTo"],
    },
  )
  .refine(
    (data) => {
      if (data.applicableTo === "specific_products") {
        return data.productIds && data.productIds.length > 0;
      }
      return true;
    },
    {
      message: "At least one product must be selected",
      path: ["productIds"],
    },
  )
  .refine(
    (data) => {
      if (data.applicableTo === "specific_categories") {
        return data.categoryIds && data.categoryIds.length > 0;
      }
      return true;
    },
    {
      message: "At least one category must be selected",
      path: ["categoryIds"],
    },
  );

/**
 * Schema for updating an existing coupon (Vendor)
 */
export const updateCouponSchema = z
  .object({
    ...couponOptionalIdFields,
    code: couponCodeField.optional(),
    description: couponDescriptionField.optional().nullable(),
    image: z.string().optional().nullable(),
    ...couponTypeFieldsUpdate,
    ...couponPricingFieldsUpdate,
    ...couponValidityFieldsUpdate,
    ...couponUsageLimitFieldsUpdate,
    ...couponFlagFieldsUpdate,
    ...couponRelationArraysUpdate,
  })
  .refine(
    (data) => {
      // Validate percentage is not over 100
      if (
        data.type === "percentage" &&
        data.discountAmount !== undefined &&
        parseFloat(data.discountAmount) > 100
      ) {
        return false;
      }
      return true;
    },
    {
      message: "Percentage discount cannot exceed 100%",
      path: ["discountAmount"],
    },
  )
  .refine(
    (data) => {
      // Validate activeFrom is before activeTo when both are provided
      if (data.activeFrom && data.activeTo) {
        const from = new Date(data.activeFrom);
        const to = new Date(data.activeTo);
        return from < to;
      }
      return true;
    },
    {
      message: "Start date must be before end date",
      path: ["activeTo"],
    },
  );

// ============================================================================
// Checkout & Usage Schemas
// ============================================================================

/**
 * Cart Item for validation
 */
export const cartItemSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  categoryId: z.string().optional().nullable(),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  price: z.string().min(1, "Price is required"), // Numeric in DB, string in Zod
});

/**
 * Schema for validating a coupon for checkout
 */
export const validateCouponSchema = z.object({
  code: z.string().min(1, "Coupon code is required"),
  shopId: z.string().min(1, "Shop ID is required"),
  cartAmount: z.string().min(1, "Cart amount is required"),
  userId: z.string().optional(), // For per-user usage limit validation
  cartItems: z.array(cartItemSchema).optional(), // For product/category validation
});

/**
 * Schema for applying a coupon to an order
 */
export const applyCouponToOrderSchema = z.object({
  couponId: z.string().min(1, "Coupon ID is required"),
  userId: z.string().min(1, "User ID is required"),
  orderId: z.string().optional(),
  discountApplied: z.string().min(1, "Discount applied is required"),
  shopId: z.string().min(1, "Shop ID is required"),
});

/**
 * Schema for getting user's coupon usage
 */
export const getUserCouponUsageSchema = z.object({
  couponId: z.string().min(1, "Coupon ID is required"),
  userId: z.string().min(1, "User ID is required"),
});

/**
 * Schema for getting available coupons for a user
 */
export const getAvailableCouponsForUserSchema = z.object({
  shopId: z.string().min(1, "Shop ID is required"),
  userId: z.string().optional(),
  cartAmount: z.string().optional(),
  cartItems: z.array(cartItemSchema).optional(),
});

// ============================================================================
// Type Exports
// ============================================================================

export type CouponType = z.infer<typeof couponTypeEnum>;
export type CouponStatus = z.infer<typeof couponStatusEnum>;
export type CouponApplicability = z.infer<typeof couponApplicabilityEnum>;
export type CouponSortBy = z.infer<typeof couponSortByEnum>;

export type Coupon = z.infer<typeof couponSchema>;
export type CouponProductRelation = z.infer<typeof couponProductRelationSchema>;
export type CouponCategoryRelation = z.infer<
  typeof couponCategoryRelationSchema
>;

export type CreateCouponInput = z.infer<typeof createCouponSchema>;
export type UpdateCouponInput = z.infer<typeof updateCouponSchema>;
export type CouponFormValues = z.infer<typeof couponFormSchema>;

export type StoreCouponsQuery = z.infer<typeof storeCouponsQuerySchema>;
export type AdminCouponsQuery = z.infer<typeof adminCouponsQuerySchema>;
export type VendorCouponsQuery = z.infer<typeof vendorCouponsQuerySchema>;

export type GetCouponByCodeInput = z.infer<typeof getCouponByCodeSchema>;
export type GetCouponAnalyticsInput = z.infer<typeof getCouponAnalyticsSchema>;
export type LinkCouponToProductsInput = z.infer<
  typeof linkCouponToProductsSchema
>;
export type LinkCouponToCategoriesInput = z.infer<
  typeof linkCouponToCategoriesSchema
>;

export type CartItem = z.infer<typeof cartItemSchema>;
export type ValidateCouponInput = z.infer<typeof validateCouponSchema>;
export type ApplyCouponToOrderInput = z.infer<typeof applyCouponToOrderSchema>;
export type GetUserCouponUsageInput = z.infer<typeof getUserCouponUsageSchema>;
export type GetAvailableCouponsForUserInput = z.infer<
  typeof getAvailableCouponsForUserSchema
>;
