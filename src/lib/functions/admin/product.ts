/**
 * Admin Product Server Functions
 *
 * Server functions for product management in the admin dashboard.
 * Admins can view and manage ALL products across all vendors and shops.
 */

import { createServerFn } from "@tanstack/react-start";
import { eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { products } from "@/lib/db/schema/products-schema";
import { shops } from "@/lib/db/schema/shop-schema";
import {
  executeProductQuery,
  fetchProductWithRelations,
} from "@/lib/helper/products-query-helpers";
import { adminMiddleware } from "@/lib/middleware/admin";
import {
  type AdminProductsQuery,
  adminProductsQuerySchema,
  deleteProductSchema,
  getProductByIdSchema,
  toggleProductFeaturedSchema,
  updateProductStatusSchema,
} from "@/lib/validators/shared/product-query";
import {
  createSuccessResponse,
  emptyPaginatedResponse,
} from "@/types/api-response";
import type { NormalizedProduct, ProductListResponse } from "@/types/products";

// ============================================================================
// Get All Products (Admin)
// ============================================================================

/**
 * Get all products with optional filtering by shop/vendor
 * Admins can see all products across all vendors
 */
export const getAdminProducts = createServerFn({ method: "GET" })
  .middleware([adminMiddleware])
  .inputValidator(adminProductsQuerySchema)
  .handler(async ({ data }): Promise<ProductListResponse> => {
    const {
      shopId,
      vendorId,
      limit,
      offset,
      search,
      status,
      productType,
      categoryId,
      brandId,
      tagId,
      attributeId,
      isFeatured,
      isActive,
      inStock,
      lowStock,
      minPrice,
      maxPrice,
      sortBy,
      sortDirection,
    } = data as AdminProductsQuery;

    // Build base conditions for admin scope
    const baseConditions = [];

    // Filter by specific shop if provided
    if (shopId) {
      baseConditions.push(eq(products.shopId, shopId));
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
            products.shopId,
            vendorShops.map((s) => s.id),
          ),
        );
      } else {
        return emptyPaginatedResponse<NormalizedProduct>(limit!, offset!);
      }
    }

    // Execute query using shared helper
    return executeProductQuery({
      baseConditions,
      search,
      status,
      productType,
      categoryId,
      brandId,
      tagId,
      attributeId,
      isFeatured,
      isActive,
      inStock,
      lowStock,
      minPrice,
      maxPrice,
      limit,
      offset,
      sortBy,
      sortDirection,
      includeShopInfo: true,
      includeVendorInfo: true,
      excludeCostPrice: false,
    });
  });

// ============================================================================
// Get Product by ID (Admin)
// ============================================================================

/**
 * Get a single product by ID (admin can view any product)
 */
export const getAdminProductById = createServerFn({ method: "GET" })
  .middleware([adminMiddleware])
  .inputValidator(getProductByIdSchema)
  .handler(async ({ data }) => {
    const { id } = data;

    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.id, id));

    if (!product) {
      throw new Error("Product not found.");
    }

    const normalizedProduct = await fetchProductWithRelations(product, {
      includeShopInfo: true,
      includeVendorInfo: true,
      excludeCostPrice: false,
    });

    return { product: normalizedProduct };
  });

// ============================================================================
// Update Product Status (Admin)
// ============================================================================

/**
 * Update product status (approve, archive, etc.)
 */
export const updateAdminProductStatus = createServerFn({ method: "POST" })
  .middleware([adminMiddleware])
  .inputValidator(updateProductStatusSchema)
  .handler(async ({ data }) => {
    const { id, status } = data;

    const [existingProduct] = await db
      .select()
      .from(products)
      .where(eq(products.id, id));

    if (!existingProduct) {
      throw new Error("Product not found.");
    }

    await db.update(products).set({ status }).where(eq(products.id, id));

    const [updatedProduct] = await db
      .select()
      .from(products)
      .where(eq(products.id, id));

    const normalizedProduct = await fetchProductWithRelations(updatedProduct, {
      includeShopInfo: true,
      includeVendorInfo: true,
    });

    return {
      ...createSuccessResponse(`Product status updated to "${status}"`),
      product: normalizedProduct,
    };
  });

// ============================================================================
// Toggle Featured Status (Admin)
// ============================================================================

/**
 * Toggle product featured status
 */
export const toggleAdminProductFeatured = createServerFn({ method: "POST" })
  .middleware([adminMiddleware])
  .inputValidator(toggleProductFeaturedSchema)
  .handler(async ({ data }) => {
    const { id, isFeatured } = data;

    const [existingProduct] = await db
      .select()
      .from(products)
      .where(eq(products.id, id));

    if (!existingProduct) {
      throw new Error("Product not found.");
    }

    await db.update(products).set({ isFeatured }).where(eq(products.id, id));

    return createSuccessResponse(
      isFeatured
        ? "Product marked as featured"
        : "Product removed from featured",
    );
  });

// ============================================================================
// Delete Product (Admin)
// ============================================================================

/**
 * Delete a product (admin can delete any product)
 */
export const deleteAdminProduct = createServerFn({ method: "POST" })
  .middleware([adminMiddleware])
  .inputValidator(deleteProductSchema)
  .handler(async ({ data }) => {
    const { id } = data;

    const [existingProduct] = await db
      .select()
      .from(products)
      .where(eq(products.id, id));

    if (!existingProduct) {
      throw new Error("Product not found.");
    }

    await db.delete(products).where(eq(products.id, id));

    return createSuccessResponse("Product deleted successfully");
  });
