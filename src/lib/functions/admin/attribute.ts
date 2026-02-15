/**
 * Admin Attribute Server Functions
 *
 * Server functions for attribute management in the admin dashboard.
 * Admins can view and manage ALL attributes across all vendors and shops.
 */

import { createServerFn } from "@tanstack/react-start";
import { and, count, eq, inArray } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { db } from "@/lib/db";
import { attributes, attributeValues } from "@/lib/db/schema/attribute-schema";
import { productAttributes } from "@/lib/db/schema/products-schema";
import { shops } from "@/lib/db/schema/shop-schema";
import {
  executeAttributeQuery,
  fetchAttributeWithRelations,
} from "@/lib/helper/attribute-query-helpers";
import { adminMiddleware } from "@/lib/middleware/admin";
import { generateSlug } from "@/lib/utils/slug";
import {
  type AdminAttributesQuery,
  adminAttributesQuerySchema,
  deleteAttributeSchema,
  getAttributeByIdSchema,
  toggleAttributeActiveSchema,
  updateAdminAttributeSchema,
} from "@/lib/validators/shared/attribute-query";
import {
  createSuccessResponse,
  emptyPaginatedResponse,
} from "@/types/api-response";
import type { AttributeItem, AttributeListResponse } from "@/types/attributes";

// ============================================================================
// Get All Attributes (Admin)
// ============================================================================

export const getAdminAttributes = createServerFn({ method: "GET" })
  .middleware([adminMiddleware])
  .inputValidator(adminAttributesQuerySchema)
  .handler(async ({ data }): Promise<AttributeListResponse> => {
    const {
      shopId,
      vendorId,
      limit,
      offset,
      search,
      type,
      isActive,
      sortBy,
      sortDirection,
    } = data as AdminAttributesQuery;

    const baseConditions = [];

    if (shopId) {
      baseConditions.push(eq(attributes.shopId, shopId));
    }

    if (vendorId) {
      const vendorShops = await db
        .select({ id: shops.id })
        .from(shops)
        .where(eq(shops.vendorId, vendorId));

      if (vendorShops.length > 0) {
        baseConditions.push(
          inArray(
            attributes.shopId,
            vendorShops.map((s) => s.id),
          ),
        );
      } else {
        return emptyPaginatedResponse<AttributeItem>(limit!, offset!);
      }
    }

    return executeAttributeQuery({
      baseConditions,
      search,
      type,
      isActive,
      limit,
      offset,
      sortBy,
      sortDirection,
      includeShopInfo: true,
      includeValues: true,
    });
  });

// ============================================================================
// Get Attribute by ID (Admin)
// ============================================================================

export const getAdminAttributeById = createServerFn({ method: "GET" })
  .middleware([adminMiddleware])
  .inputValidator(getAttributeByIdSchema)
  .handler(async ({ data }) => {
    const { id } = data;

    const [attribute] = await db
      .select()
      .from(attributes)
      .where(eq(attributes.id, id));

    if (!attribute) {
      throw new Error("Attribute not found.");
    }

    const normalizedAttribute = await fetchAttributeWithRelations(attribute, {
      includeShopInfo: true,
      includeValues: true,
    });

    return { attribute: normalizedAttribute };
  });

// ============================================================================
// Toggle Active Status (Admin)
// ============================================================================

export const toggleAdminAttributeActive = createServerFn({ method: "POST" })
  .middleware([adminMiddleware])
  .inputValidator(toggleAttributeActiveSchema)
  .handler(async ({ data }) => {
    const { id, isActive } = data;

    const [existingAttribute] = await db
      .select()
      .from(attributes)
      .where(eq(attributes.id, id));

    if (!existingAttribute) {
      throw new Error("Attribute not found.");
    }

    await db.update(attributes).set({ isActive }).where(eq(attributes.id, id));

    return createSuccessResponse(
      isActive ? "Attribute activated" : "Attribute deactivated",
    );
  });

// ============================================================================
// Update Attribute (Admin)
// ============================================================================

export const updateAdminAttribute = createServerFn({ method: "POST" })
  .middleware([adminMiddleware])
  .inputValidator(updateAdminAttributeSchema)
  .handler(async ({ data }) => {
    const { id, values, ...updateData } = data;

    const [existingAttribute] = await db
      .select()
      .from(attributes)
      .where(eq(attributes.id, id));

    if (!existingAttribute) {
      throw new Error("Attribute not found.");
    }

    if (updateData.slug && updateData.slug !== existingAttribute.slug) {
      const [slugExists] = await db
        .select({ id: attributes.id })
        .from(attributes)
        .where(
          and(
            eq(attributes.shopId, existingAttribute.shopId),
            eq(attributes.slug, updateData.slug),
          ),
        );

      if (slugExists) {
        throw new Error(
          "An attribute with this slug already exists in this shop.",
        );
      }
    }

    const updateValues: Record<string, any> = {};
    if (updateData.name !== undefined) updateValues.name = updateData.name;
    if (updateData.slug !== undefined) updateValues.slug = updateData.slug;
    if (updateData.type !== undefined) updateValues.type = updateData.type;
    if (updateData.sortOrder !== undefined)
      updateValues.sortOrder = updateData.sortOrder;
    if (updateData.isActive !== undefined)
      updateValues.isActive = updateData.isActive;

    if (Object.keys(updateValues).length > 0) {
      await db
        .update(attributes)
        .set(updateValues)
        .where(eq(attributes.id, id));
    }

    if (values !== undefined) {
      await db
        .delete(attributeValues)
        .where(eq(attributeValues.attributeId, id));

      if (values.length > 0) {
        const valueRecords = values.map((val, index) => ({
          id: uuidv4(),
          attributeId: id,
          name: val.name,
          slug: val.slug || generateSlug(val.name, { unique: false }),
          value: val.value,
          sortOrder: index,
        }));

        await db.insert(attributeValues).values(valueRecords);
      }
    }

    return createSuccessResponse("Attribute updated successfully");
  });

// ============================================================================
// Delete Attribute (Admin)
// ============================================================================

export const deleteAdminAttribute = createServerFn({ method: "POST" })
  .middleware([adminMiddleware])
  .inputValidator(deleteAttributeSchema)
  .handler(async ({ data }) => {
    const { id } = data;

    const [existingAttribute] = await db
      .select()
      .from(attributes)
      .where(eq(attributes.id, id));

    if (!existingAttribute) {
      throw new Error("Attribute not found.");
    }

    const [productCount] = await db
      .select({ count: count() })
      .from(productAttributes)
      .where(eq(productAttributes.attributeId, id));

    if ((productCount?.count ?? 0) > 0) {
      throw new Error(
        "Cannot delete an attribute that is assigned to products. Please remove it from products first.",
      );
    }

    await db.delete(attributes).where(eq(attributes.id, id));

    return createSuccessResponse("Attribute deleted successfully");
  });
