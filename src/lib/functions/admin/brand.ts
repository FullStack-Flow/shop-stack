/**
 * Admin Brand Server Functions
 *
 * Server functions for brand management in the admin dashboard.
 * Admins can view and manage ALL brands across all vendors and shops.
 */

import { createServerFn } from "@tanstack/react-start";
import { count, eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { brands } from "@/lib/db/schema/brand-schema";
import { products } from "@/lib/db/schema/products-schema";
import { shops } from "@/lib/db/schema/shop-schema";
import {
  executeBrandQuery,
  fetchBrandWithRelations,
} from "@/lib/helper/brands-query-helpers";
import { adminMiddleware } from "@/lib/middleware/admin";
import {
  type AdminBrandsQuery,
  adminBrandsQuerySchema,
  deleteBrandSchema,
  getBrandByIdSchema,
  toggleBrandActiveSchema,
} from "@/lib/validators/shared/brand-query";
import {
  createSuccessResponse,
  emptyPaginatedResponse,
} from "@/types/api-response";
import type { BrandItem, BrandListResponse } from "@/types/brands";

// ============================================================================
// Get All Brands (Admin)
// ============================================================================

/**
 * Get all brands with optional filtering by shop/vendor
 * Admins can see all brands across all vendors
 */
export const getAdminBrands = createServerFn({ method: "GET" })
  .middleware([adminMiddleware])
  .inputValidator(adminBrandsQuerySchema)
  .handler(async ({ data }): Promise<BrandListResponse> => {
    const {
      shopId,
      vendorId,
      limit,
      offset,
      search,
      isActive,
      sortBy,
      sortDirection,
    } = data as AdminBrandsQuery;

    // Build base conditions for admin scope
    const baseConditions = [];

    // Filter by specific shop if provided
    if (shopId) {
      baseConditions.push(eq(brands.shopId, shopId));
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
            brands.shopId,
            vendorShops.map((s) => s.id),
          ),
        );
      } else {
        return emptyPaginatedResponse<BrandItem>(limit!, offset!);
      }
    }

    // Execute query using shared helper
    return executeBrandQuery({
      baseConditions,
      search,
      isActive,
      limit,
      offset,
      sortBy,
      sortDirection,
      includeShopInfo: true,
    });
  });

// ============================================================================
// Get Brand by ID (Admin)
// ============================================================================

/**
 * Get a single brand by ID (admin can view any brand)
 */
export const getAdminBrandById = createServerFn({ method: "GET" })
  .middleware([adminMiddleware])
  .inputValidator(getBrandByIdSchema)
  .handler(async ({ data }) => {
    const { id } = data;

    const [brand] = await db.select().from(brands).where(eq(brands.id, id));

    if (!brand) {
      throw new Error("Brand not found.");
    }

    const normalizedBrand = await fetchBrandWithRelations(brand, {
      includeShopInfo: true,
    });

    return { brand: normalizedBrand };
  });

// ============================================================================
// Toggle Active Status (Admin)
// ============================================================================

/**
 * Toggle brand active status
 */
export const toggleAdminBrandActive = createServerFn({ method: "POST" })
  .middleware([adminMiddleware])
  .inputValidator(toggleBrandActiveSchema)
  .handler(async ({ data }) => {
    const { id, isActive } = data;

    const [existingBrand] = await db
      .select()
      .from(brands)
      .where(eq(brands.id, id));

    if (!existingBrand) {
      throw new Error("Brand not found.");
    }

    await db.update(brands).set({ isActive }).where(eq(brands.id, id));

    return createSuccessResponse(
      isActive ? "Brand activated" : "Brand deactivated",
    );
  });

// ============================================================================
// Delete Brand (Admin)
// ============================================================================

/**
 * Delete a brand (admin can delete any brand)
 */
export const deleteAdminBrand = createServerFn({ method: "POST" })
  .middleware([adminMiddleware])
  .inputValidator(deleteBrandSchema)
  .handler(async ({ data }) => {
    const { id } = data;

    const [existingBrand] = await db
      .select()
      .from(brands)
      .where(eq(brands.id, id));

    if (!existingBrand) {
      throw new Error("Brand not found.");
    }

    // Check for products
    const [productCount] = await db
      .select({ count: count() })
      .from(products)
      .where(eq(products.brandId, id));

    if ((productCount?.count ?? 0) > 0) {
      throw new Error(
        "Cannot delete a brand that has products. Please reassign products first.",
      );
    }

    await db.delete(brands).where(eq(brands.id, id));

    return createSuccessResponse("Brand deleted successfully");
  });
