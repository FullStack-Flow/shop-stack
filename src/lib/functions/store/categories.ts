import { createServerFn } from "@tanstack/react-start";
import { and, eq } from "drizzle-orm";
import z from "zod";
import { db } from "@/lib/db";
import { categories } from "@/lib/db/schema/category-schema";
import {
  buildCategoryTree,
  executeCategoryQuery,
  fetchCategoryWithRelations,
} from "@/lib/helper/category-query-helpers";
import {
  getCategoryByIdSchema,
  getCategoryBySlugSchema,
  type StoreCategoriesQuery,
  storeCategoriesQuerySchema,
} from "@/lib/validators/shared/category-query";
import {
  createPaginatedResponse,
  emptyPaginatedResponse,
} from "@/types/api-response";
import type {
  CategoryListResponse,
  CategoryTreeNode,
  NormalizedCategory,
} from "@/types/category-types";

/**
 * Get categories for the public storefront
 * Only returns active categories
 * No authentication required
 */
export const getStoreCategories = createServerFn({ method: "GET" })
  .inputValidator(storeCategoriesQuerySchema)
  .handler(async ({ data }): Promise<CategoryListResponse> => {
    const {
      limit,
      offset,
      search,
      parentId,
      featured,
      sortBy,
      sortDirection,
      shopId,
      shopSlug,
    } = data as StoreCategoriesQuery;

    // Base conditions: only active categories
    const baseConditions = [eq(categories.isActive, true)];

    // Filter by shop if specified
    if (shopId) {
      baseConditions.push(eq(categories.shopId, shopId));
    }

    // If shopSlug is provided, look up the shop first
    if (shopSlug && !shopId) {
      const { shops } = await import("@/lib/db/schema/shop-schema");
      const [shop] = await db
        .select({ id: shops.id })
        .from(shops)
        .where(eq(shops.slug, shopSlug));

      if (shop) {
        baseConditions.push(eq(categories.shopId, shop.id));
      } else {
        return emptyPaginatedResponse<NormalizedCategory>(limit!, offset!);
      }
    }

    // Execute query using shared helper
    const result = await executeCategoryQuery({
      baseConditions,
      search,
      parentId: parentId ?? undefined,
      isActive: true, // Always active for store
      featured,
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

/**
 * Get a single category by slug for category pages
 * Only returns if the category is active
 */
export const getStoreCategoryBySlug = createServerFn({ method: "GET" })
  .inputValidator(getCategoryBySlugSchema)
  .handler(async ({ data }) => {
    const { slug, shopSlug } = data;

    // Build query conditions
    const conditions = [
      eq(categories.slug, slug),
      eq(categories.isActive, true),
    ];

    // If shopSlug is provided, scope to that shop
    if (shopSlug) {
      const { shops } = await import("@/lib/db/schema/shop-schema");
      const [shop] = await db
        .select({ id: shops.id })
        .from(shops)
        .where(eq(shops.slug, shopSlug));

      if (shop) {
        conditions.push(eq(categories.shopId, shop.id));
      } else {
        throw new Error("Shop not found.");
      }
    }

    // Get category
    const [category] = await db
      .select()
      .from(categories)
      .where(and(...conditions));

    if (!category) {
      throw new Error("Category not found.");
    }

    // Fetch with relations
    const normalizedCategory = await fetchCategoryWithRelations(category, {
      includeShopInfo: true,
    });

    return {
      category: normalizedCategory,
    };
  });

export const getStoreCategoryById = createServerFn({ method: "GET" })
  .inputValidator(getCategoryByIdSchema)
  .handler(async ({ data }) => {
    const { id } = data;

    // Get category (only if active)
    const [category] = await db
      .select()
      .from(categories)
      .where(and(eq(categories.id, id), eq(categories.isActive, true)));

    if (!category) {
      throw new Error("Category not found.");
    }

    // Fetch with relations
    const normalizedCategory = await fetchCategoryWithRelations(category, {
      includeShopInfo: true,
    });

    return {
      category: normalizedCategory,
    };
  });

/**
 * Get featured categories for homepage or promotional sections
 */
export const getFeaturedCategories = createServerFn({ method: "GET" })
  .inputValidator(
    z.object({
      limit: z.coerce.number().min(1).max(20).optional().default(8),
      shopSlug: z.string().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const { limit, shopSlug } = data;

    const baseConditions = [
      eq(categories.isActive, true),
      eq(categories.featured, true),
    ];

    // If shopSlug is provided, scope to that shop
    if (shopSlug) {
      const { shops } = await import("@/lib/db/schema/shop-schema");
      const [shop] = await db
        .select({ id: shops.id })
        .from(shops)
        .where(eq(shops.slug, shopSlug));

      if (shop) {
        baseConditions.push(eq(categories.shopId, shop.id));
      }
    }

    const result = await executeCategoryQuery({
      baseConditions,
      limit,
      offset: 0,
      sortBy: "sortOrder",
      sortDirection: "asc",
      includeShopInfo: true,
    });

    return {
      categories: result.data,
    };
  });

/**
 * Get hierarchical category tree for navigation menus
 */
export const getCategoryTree = createServerFn({ method: "GET" })
  .inputValidator(
    z.object({
      shopSlug: z.string().optional(),
      shopId: z.string().optional(),
      maxDepth: z.coerce.number().min(1).max(5).optional().default(3),
    }),
  )
  .handler(async ({ data }): Promise<{ tree: CategoryTreeNode[] }> => {
    const { shopSlug, shopId, maxDepth } = data;

    const baseConditions = [eq(categories.isActive, true)];

    // Filter by shop
    if (shopId) {
      baseConditions.push(eq(categories.shopId, shopId));
    } else if (shopSlug) {
      const { shops } = await import("@/lib/db/schema/shop-schema");
      const [shop] = await db
        .select({ id: shops.id })
        .from(shops)
        .where(eq(shops.slug, shopSlug));

      if (shop) {
        baseConditions.push(eq(categories.shopId, shop.id));
      }
    }

    // Fetch all active categories (no pagination for tree building)
    const result = await executeCategoryQuery({
      baseConditions,
      limit: 500, // Get all categories for tree building
      offset: 0,
      sortBy: "sortOrder",
      sortDirection: "asc",
      includeShopInfo: false,
    });

    // Filter by max depth
    const filteredCategories = result.data.filter((c) => c.level < maxDepth);

    // Build the tree
    const tree = buildCategoryTree(filteredCategories);

    return { tree };
  });

/**
 * Get subcategories of a parent category
 */
export const getSubcategories = createServerFn({ method: "GET" })
  .inputValidator(
    z.object({
      parentId: z.string().min(1, "Parent category ID is required"),
      limit: z.coerce.number().min(1).max(50).optional().default(20),
    }),
  )
  .handler(async ({ data }) => {
    const { parentId, limit } = data;

    const result = await executeCategoryQuery({
      baseConditions: [
        eq(categories.isActive, true),
        eq(categories.parentId, parentId),
      ],
      limit,
      offset: 0,
      sortBy: "sortOrder",
      sortDirection: "asc",
      includeShopInfo: false,
    });

    return {
      categories: result.data,
    };
  });
