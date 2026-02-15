/**
 * Admin Category Server Functions
 *
 * Server functions for category management in the admin dashboard.
 * Admins can view and manage ALL categories across all vendors and shops.
 */

import { createServerFn } from "@tanstack/react-start";
import { eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { categories } from "@/lib/db/schema/category-schema";
import { shops } from "@/lib/db/schema/shop-schema";
import {
  executeCategoryQuery,
  fetchCategoryWithRelations,
} from "@/lib/helper/category-query-helpers";
import { adminMiddleware } from "@/lib/middleware/admin";
import {
  type AdminCategoriesQuery,
  adminCategoriesQuerySchema,
  deleteCategorySchema,
  getCategoryByIdSchema,
  toggleCategoryActiveSchema,
  toggleCategoryFeaturedSchema,
} from "@/lib/validators/shared/category-query";
import {
  createSuccessResponse,
  emptyPaginatedResponse,
} from "@/types/api-response";
import type {
  CategoryListResponse,
  NormalizedCategory,
} from "@/types/category-types";

// ============================================================================
// Get All Categories (Admin)
// ============================================================================

/**
 * Get all categories with optional filtering by shop/vendor
 * Admins can see all categories across all vendors
 */
export const getAdminCategories = createServerFn({ method: "GET" })
  .middleware([adminMiddleware])
  .inputValidator(adminCategoriesQuerySchema)
  .handler(async ({ data }): Promise<CategoryListResponse> => {
    const {
      shopId,
      vendorId,
      limit,
      offset,
      search,
      parentId,
      isActive,
      featured,
      sortBy,
      sortDirection,
    } = data as AdminCategoriesQuery;

    // Build base conditions for admin scope
    const baseConditions = [];

    // Filter by specific shop if provided
    if (shopId) {
      baseConditions.push(eq(categories.shopId, shopId));
    }

    // Filter by vendor (get all shops for the vendor first)
    if (vendorId) {
      const vendorShops = await db
        .select({ id: shops.id })
        .from(shops)
        .where(eq(shops.vendorId, vendorId));

      if (vendorShops.length > 0) {
        baseConditions.push(
          inArray(
            categories.shopId,
            vendorShops.map((s) => s.id),
          ),
        );
      } else {
        return emptyPaginatedResponse<NormalizedCategory>(limit!, offset!);
      }
    }

    // Execute query using shared helper
    return executeCategoryQuery({
      baseConditions,
      search,
      parentId: parentId ?? undefined,
      isActive,
      featured,
      limit,
      offset,
      sortBy,
      sortDirection,
      includeShopInfo: true,
    });
  });

// ============================================================================
// Get Category by ID (Admin)
// ============================================================================

/**
 * Get a single category by ID (admin can view any category)
 */
export const getAdminCategoryById = createServerFn({ method: "GET" })
  .middleware([adminMiddleware])
  .inputValidator(getCategoryByIdSchema)
  .handler(async ({ data }) => {
    const { id } = data;

    const [category] = await db
      .select()
      .from(categories)
      .where(eq(categories.id, id));

    if (!category) {
      throw new Error("Category not found.");
    }

    const normalizedCategory = await fetchCategoryWithRelations(category, {
      includeShopInfo: true,
    });

    return { category: normalizedCategory };
  });

// ============================================================================
// Toggle Active Status (Admin)
// ============================================================================

/**
 * Toggle category active status
 */
export const toggleAdminCategoryActive = createServerFn({ method: "POST" })
  .middleware([adminMiddleware])
  .inputValidator(toggleCategoryActiveSchema)
  .handler(async ({ data }) => {
    const { id, isActive } = data;

    const [existingCategory] = await db
      .select()
      .from(categories)
      .where(eq(categories.id, id));

    if (!existingCategory) {
      throw new Error("Category not found.");
    }

    await db.update(categories).set({ isActive }).where(eq(categories.id, id));

    return createSuccessResponse(
      isActive ? "Category activated" : "Category deactivated",
    );
  });

// ============================================================================
// Toggle Featured Status (Admin)
// ============================================================================

/**
 * Toggle category featured status
 */
export const toggleAdminCategoryFeatured = createServerFn({ method: "POST" })
  .middleware([adminMiddleware])
  .inputValidator(toggleCategoryFeaturedSchema)
  .handler(async ({ data }) => {
    const { id, featured } = data;

    const [existingCategory] = await db
      .select()
      .from(categories)
      .where(eq(categories.id, id));

    if (!existingCategory) {
      throw new Error("Category not found.");
    }

    await db.update(categories).set({ featured }).where(eq(categories.id, id));

    return createSuccessResponse(
      featured
        ? "Category marked as featured"
        : "Category removed from featured",
    );
  });

// ============================================================================
// Delete Category (Admin)
// ============================================================================

/**
 * Delete a category (admin can delete any category)
 */
export const deleteAdminCategory = createServerFn({ method: "POST" })
  .middleware([adminMiddleware])
  .inputValidator(deleteCategorySchema)
  .handler(async ({ data }) => {
    const { id } = data;

    const [existingCategory] = await db
      .select()
      .from(categories)
      .where(eq(categories.id, id));

    if (!existingCategory) {
      throw new Error("Category not found.");
    }

    // Check for children
    const [childCount] = await db
      .select({ count: db.$count(categories) })
      .from(categories)
      .where(eq(categories.parentId, id));

    if ((childCount?.count ?? 0) > 0) {
      throw new Error(
        "Cannot delete a category that has subcategories. Please delete or reassign subcategories first.",
      );
    }

    // Check for products
    const { products } = await import("@/lib/db/schema/products-schema");
    const [productCount] = await db
      .select({ count: db.$count(products) })
      .from(products)
      .where(eq(products.categoryId, id));

    if ((productCount?.count ?? 0) > 0) {
      throw new Error(
        "Cannot delete a category that has products. Please reassign products first.",
      );
    }

    await db.delete(categories).where(eq(categories.id, id));

    return createSuccessResponse("Category deleted successfully");
  });
