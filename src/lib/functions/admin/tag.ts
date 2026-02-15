/**
 * Admin Tag Server Functions
 *
 * Server functions for tag management in the admin dashboard.
 * Admins can view and manage ALL tags across all vendors and shops.
 */

import { createServerFn } from "@tanstack/react-start";
import { count, eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { productTags } from "@/lib/db/schema/products-schema";
import { shops } from "@/lib/db/schema/shop-schema";
import { tags } from "@/lib/db/schema/tags-schema";
import {
  executeTagQuery,
  fetchTagWithRelations,
} from "@/lib/helper/tag-query-helpers";
import { adminMiddleware } from "@/lib/middleware/admin";
import {
  type AdminTagsQuery,
  adminTagsQuerySchema,
  deleteTagSchema,
  getTagByIdSchema,
  toggleTagActiveSchema,
} from "@/lib/validators/shared/tag-query";
import {
  createSuccessResponse,
  emptyPaginatedResponse,
} from "@/types/api-response";
import type { TagItem, TagListResponse } from "@/types/tags";

// ============================================================================
// Get All Tags (Admin)
// ============================================================================

/**
 * Get all tags with optional filtering by shop/vendor
 * Admins can see all tags across all vendors
 */
export const getAdminTags = createServerFn({ method: "GET" })
  .middleware([adminMiddleware])
  .inputValidator(adminTagsQuerySchema)
  .handler(async ({ data }): Promise<TagListResponse> => {
    const {
      shopId,
      vendorId,
      limit,
      offset,
      search,
      isActive,
      sortBy,
      sortDirection,
    } = data as AdminTagsQuery;

    // Build base conditions for admin scope
    const baseConditions = [];

    // Filter by specific shop if provided
    if (shopId) {
      baseConditions.push(eq(tags.shopId, shopId));
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
            tags.shopId,
            vendorShops.map((s) => s.id),
          ),
        );
      } else {
        return emptyPaginatedResponse<TagItem>(limit!, offset!);
      }
    }

    // Execute query using shared helper
    return executeTagQuery({
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
// Get Tag by ID (Admin)
// ============================================================================

/**
 * Get a single tag by ID (admin can view any tag)
 */
export const getAdminTagById = createServerFn({ method: "GET" })
  .middleware([adminMiddleware])
  .inputValidator(getTagByIdSchema)
  .handler(async ({ data }) => {
    const { id } = data;

    const [tag] = await db.select().from(tags).where(eq(tags.id, id));

    if (!tag) {
      throw new Error("Tag not found.");
    }

    const normalizedTag = await fetchTagWithRelations(tag, {
      includeShopInfo: true,
    });

    return { tag: normalizedTag };
  });

// ============================================================================
// Toggle Active Status (Admin)
// ============================================================================

/**
 * Toggle tag active status
 */
export const toggleAdminTagActive = createServerFn({ method: "POST" })
  .middleware([adminMiddleware])
  .inputValidator(toggleTagActiveSchema)
  .handler(async ({ data }) => {
    const { id, isActive } = data;

    const [existingTag] = await db.select().from(tags).where(eq(tags.id, id));

    if (!existingTag) {
      throw new Error("Tag not found.");
    }

    await db.update(tags).set({ isActive }).where(eq(tags.id, id));

    return createSuccessResponse(
      isActive ? "Tag activated" : "Tag deactivated",
    );
  });

// ============================================================================
// Delete Tag (Admin)
// ============================================================================

/**
 * Delete a tag (admin can delete any tag)
 */
export const deleteAdminTag = createServerFn({ method: "POST" })
  .middleware([adminMiddleware])
  .inputValidator(deleteTagSchema)
  .handler(async ({ data }) => {
    const { id } = data;

    const [existingTag] = await db.select().from(tags).where(eq(tags.id, id));

    if (!existingTag) {
      throw new Error("Tag not found.");
    }

    // Check for products using this tag
    const [productCount] = await db
      .select({ count: count() })
      .from(productTags)
      .where(eq(productTags.tagId, id));

    if ((productCount?.count ?? 0) > 0) {
      throw new Error(
        "Cannot delete a tag that has products. Please remove products from this tag first.",
      );
    }

    await db.delete(tags).where(eq(tags.id, id));

    return createSuccessResponse("Tag deleted successfully");
  });
