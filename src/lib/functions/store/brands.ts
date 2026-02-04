/**
 * Store Front Brand Server Functions
 *
 * Public server functions for the storefront/customer-facing pages.
 * No authentication required - anyone can browse brands.
 * Only returns active brands.
 */

import { createServerFn } from "@tanstack/react-start";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { brands } from "@/lib/db/schema/brand-schema";
import {
  executeBrandQuery,
  fetchBrandWithRelations,
} from "@/lib/helper/brands-query-helpers";
import {
  getBrandByIdSchema,
  getBrandBySlugSchema,
  type StoreBrandsQuery,
  storeBrandsQuerySchema,
} from "@/lib/validators/shared/brand-query";
import {
  createPaginatedResponse,
  emptyPaginatedResponse,
} from "@/types/api-response";
import type { BrandItem, BrandListResponse } from "@/types/brands";

// ============================================================================
// Get Brands (Store Front - Public)
// ============================================================================

/**
 * Get brands for the public storefront
 * Only returns active brands
 * No authentication required
 */
export const getStoreBrands = createServerFn({ method: "GET" })
  .inputValidator(storeBrandsQuerySchema)
  .handler(async ({ data }): Promise<BrandListResponse> => {
    const { limit, offset, search, sortBy, sortDirection, shopId, shopSlug } =
      data as StoreBrandsQuery;

    // Base conditions: only active brands
    const baseConditions = [eq(brands.isActive, true)];

    // Filter by shop if specified
    if (shopId) {
      baseConditions.push(eq(brands.shopId, shopId));
    }

    // If shopSlug is provided, look up the shop first
    if (shopSlug && !shopId) {
      const { shops } = await import("@/lib/db/schema/shop-schema");
      const [shop] = await db
        .select({ id: shops.id })
        .from(shops)
        .where(eq(shops.slug, shopSlug));

      if (shop) {
        baseConditions.push(eq(brands.shopId, shop.id));
      } else {
        return emptyPaginatedResponse<BrandItem>(limit!, offset!);
      }
    }

    // Execute query using shared helper
    const result = await executeBrandQuery({
      baseConditions,
      search,
      isActive: true, // Always active for store
      limit,
      offset,
      sortBy,
      sortDirection,
      includeShopInfo: true,
    });

    return createPaginatedResponse(
      result.data,
      result.total,
      result.limit,
      result.offset,
    );
  });

// ============================================================================
// Get Brand by Slug (Store Front - Public)
// ============================================================================

/**
 * Get a single brand by slug for brand pages
 * Only returns if the brand is active
 */
export const getStoreBrandBySlug = createServerFn({ method: "GET" })
  .inputValidator(getBrandBySlugSchema)
  .handler(async ({ data }) => {
    const { slug, shopSlug } = data;

    // Build query conditions
    const conditions = [eq(brands.slug, slug), eq(brands.isActive, true)];

    // If shopSlug is provided, scope to that shop
    if (shopSlug) {
      const { shops } = await import("@/lib/db/schema/shop-schema");
      const [shop] = await db
        .select({ id: shops.id })
        .from(shops)
        .where(eq(shops.slug, shopSlug));

      if (shop) {
        conditions.push(eq(brands.shopId, shop.id));
      } else {
        throw new Error("Shop not found.");
      }
    }

    // Get brand
    const [brand] = await db
      .select()
      .from(brands)
      .where(and(...conditions));

    if (!brand) {
      throw new Error("Brand not found.");
    }

    // Fetch with relations
    const normalizedBrand = await fetchBrandWithRelations(brand, {
      includeShopInfo: true,
    });

    return {
      brand: normalizedBrand,
    };
  });

// ============================================================================
// Get Brand by ID (Store Front - Public)
// ============================================================================

/**
 * Get a single brand by ID
 * Only returns if the brand is active
 */
export const getStoreBrandById = createServerFn({ method: "GET" })
  .inputValidator(getBrandByIdSchema)
  .handler(async ({ data }) => {
    const { id } = data;

    // Get brand (only if active)
    const [brand] = await db
      .select()
      .from(brands)
      .where(and(eq(brands.id, id), eq(brands.isActive, true)));

    if (!brand) {
      throw new Error("Brand not found.");
    }

    // Fetch with relations
    const normalizedBrand = await fetchBrandWithRelations(brand, {
      includeShopInfo: true,
    });

    return {
      brand: normalizedBrand,
    };
  });

// ============================================================================
// Get Popular Brands (Store Front - Public)
// ============================================================================

/**
 * Get popular brands based on product count for homepage sections
 */
export const getPopularBrands = createServerFn({ method: "GET" })
  .inputValidator(
    z.object({
      limit: z.coerce.number().min(1).max(20).optional().default(10),
      shopSlug: z.string().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const { limit, shopSlug } = data;

    const baseConditions = [eq(brands.isActive, true)];

    // If shopSlug is provided, scope to that shop
    if (shopSlug) {
      const { shops } = await import("@/lib/db/schema/shop-schema");
      const [shop] = await db
        .select({ id: shops.id })
        .from(shops)
        .where(eq(shops.slug, shopSlug));

      if (shop) {
        baseConditions.push(eq(brands.shopId, shop.id));
      }
    }

    const result = await executeBrandQuery({
      baseConditions,
      limit,
      offset: 0,
      sortBy: "productCount",
      sortDirection: "desc",
      includeShopInfo: true,
    });

    return {
      brands: result.data,
    };
  });
