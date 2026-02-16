import { createServerFn } from "@tanstack/react-start";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { products } from "@/lib/db/schema/products-schema";
import {
  executeProductQuery,
  fetchProductWithRelations,
} from "@/lib/helper/products-query-helpers";
import { getProductRatingStats } from "@/lib/helper/review-query-helpers";
import {
  getFeaturedProductsSchema,
  getProductByIdSchema,
  getProductBySlugSchema,
  getRelatedProductsSchema,
  storeProductsQuerySchema,
} from "@/lib/validators/shared/product-query";
import {
  createPaginatedResponse,
  emptyPaginatedResponse,
} from "@/types/api-response";
import type { NormalizedProduct, ProductQueryOptions } from "@/types/products";
import type {
  StoreProduct,
  StoreProductListResponse,
} from "@/types/store-types";

/**
 * Transform NormalizedProduct to StoreProduct by removing sensitive fields
 */
function toStoreProduct(product: NormalizedProduct): StoreProduct {
  const {
    costPrice: _costPrice,
    lowStockThreshold: _lowStockThreshold,
    trackInventory: _trackInventory,
    ...storeProduct
  } = product;
  return storeProduct;
}

export const getStoreProducts = createServerFn({ method: "GET" })
  .inputValidator(storeProductsQuerySchema)
  .handler(async ({ data }): Promise<StoreProductListResponse> => {
    const baseConditions = [
      eq(products.status, "active"),
      eq(products.isActive, true),
    ];

    // Filter by shop if specified
    if (data.shopId) {
      baseConditions.push(eq(products.shopId, data.shopId));
    }

    // If shopSlug is provided, look up the shop first
    if (data.shopSlug && !data.shopId) {
      const { shops } = await import("@/lib/db/schema/shop-schema");
      const [shop] = await db
        .select({ id: shops.id })
        .from(shops)
        .where(eq(shops.slug, data.shopSlug));

      if (shop) {
        baseConditions.push(eq(products.shopId, shop.id));
      } else {
        return emptyPaginatedResponse<StoreProduct>(data.limit!, data.offset!);
      }
    }

    let mappedSortBy: ProductQueryOptions["sortBy"];
    if (data.sortBy === "price") {
      mappedSortBy = "sellingPrice";
    } else {
      mappedSortBy = data.sortBy;
    }

    // Execute query using shared helper
    const result = await executeProductQuery({
      baseConditions,
      search: data.search,
      productType: data.productType,
      categoryId: data.categoryId,
      brandId: data.brandId,
      tagId: data.tagId,
      isFeatured: data.isFeatured,
      isActive: true,
      inStock: data.inStock,
      minPrice: data.minPrice,
      maxPrice: data.maxPrice,
      minRating: data.minRating,
      limit: data.limit,
      offset: data.offset,
      sortBy: mappedSortBy,
      sortDirection: data.sortDirection,
      includeShopInfo: true,
      includeVendorInfo: false,
      excludeCostPrice: true,
    });

    // Transform to store product format
    const storeProducts = result.data.map(toStoreProduct);

    return createPaginatedResponse(
      storeProducts,
      result.total,
      result.limit,
      result.offset,
    );
  });

export const getStoreProductBySlug = createServerFn({ method: "GET" })
  .inputValidator(getProductBySlugSchema)
  .handler(async ({ data }) => {
    const { slug, shopSlug } = data;

    // Build query conditions
    const conditions = [
      eq(products.slug, slug),
      eq(products.status, "active"),
      eq(products.isActive, true),
    ];

    // If shopSlug is provided, scope to that shop
    if (shopSlug) {
      const { shops } = await import("@/lib/db/schema/shop-schema");
      const [shop] = await db
        .select({ id: shops.id })
        .from(shops)
        .where(eq(shops.slug, shopSlug));

      if (shop) {
        conditions.push(eq(products.shopId, shop.id));
      } else {
        throw new Error("Shop not found.");
      }
    }

    // Get product
    const [product] = await db
      .select()
      .from(products)
      .where(and(...conditions));

    if (!product) {
      throw new Error("Product not found.");
    }

    // Fetch with relations
    const normalizedProduct = await fetchProductWithRelations(product, {
      includeShopInfo: true,
      includeVendorInfo: false,
      excludeCostPrice: true,
    });

    // Get rating stats
    // TODO: Uncomment this when rating stats are implemented
    const ratingStats = await getProductRatingStats(product.id);

    return {
      product: toStoreProduct(normalizedProduct),
      ratingStats,
    };
  });

// ============================================================================
// Get Product by ID (Store Front - Public)
// ============================================================================

/**
 * Get a single product by ID
 * Only returns if the product is active and published
 */
export const getStoreProductById = createServerFn({ method: "GET" })
  .inputValidator(getProductByIdSchema)
  .handler(async ({ data }) => {
    const { id } = data;

    // Get product (only if active and published)
    const [product] = await db
      .select()
      .from(products)
      .where(
        and(
          eq(products.id, id),
          eq(products.status, "active"),
          eq(products.isActive, true),
        ),
      );

    if (!product) {
      throw new Error("Product not found.");
    }

    // Fetch with relations
    const normalizedProduct = await fetchProductWithRelations(product, {
      includeShopInfo: true,
      includeVendorInfo: false,
      excludeCostPrice: true,
    });

    // Get rating stats
    // TODO: Uncomment this when rating stats are implemented
    const ratingStats = await getProductRatingStats(product.id);

    return {
      product: toStoreProduct(normalizedProduct),
      ratingStats,
    };
  });

// ============================================================================
// Get Featured Products (Store Front - Public)
// ============================================================================

/**
 * Get featured products for homepage or promotional sections
 */
export const getFeaturedProducts = createServerFn({ method: "GET" })
  .inputValidator(getFeaturedProductsSchema)
  .handler(async ({ data }) => {
    const { limit } = data;

    const result = await executeProductQuery({
      baseConditions: [
        eq(products.status, "active"),
        eq(products.isActive, true),
        eq(products.isFeatured, true),
      ],
      limit,
      offset: 0,
      sortBy: "createdAt",
      sortDirection: "desc",
      includeShopInfo: true,
      excludeCostPrice: true,
    });

    return {
      products: result.data.map(toStoreProduct),
    };
  });

// ============================================================================
// Get Related Products (Store Front - Public)
// ============================================================================

/**
 * Get related products based on category and brand
 * Used on product detail pages for cross-selling
 */
export const getRelatedProducts = createServerFn({ method: "GET" })
  .inputValidator(getRelatedProductsSchema)
  .handler(async ({ data }) => {
    const { productId, limit } = data;

    // Get the source product
    const [sourceProduct] = await db
      .select()
      .from(products)
      .where(eq(products.id, productId));

    if (!sourceProduct) {
      return { products: [] };
    }

    // Build conditions for related products
    const baseConditions = [
      eq(products.status, "active"),
      eq(products.isActive, true),
    ];

    // Priority: same category
    if (sourceProduct.categoryId) {
      baseConditions.push(eq(products.categoryId, sourceProduct.categoryId));
    } else if (sourceProduct.brandId) {
      baseConditions.push(eq(products.brandId, sourceProduct.brandId));
    }

    const result = await executeProductQuery({
      baseConditions,
      limit: limit! + 1,
      offset: 0,
      sortBy: "createdAt",
      sortDirection: "desc",
      includeShopInfo: true,
      excludeCostPrice: true,
    });

    // Filter out the source product
    const relatedProducts = result.data
      .filter((p) => p.id !== productId)
      .slice(0, limit);

    return {
      products: relatedProducts.map(toStoreProduct),
    };
  });
