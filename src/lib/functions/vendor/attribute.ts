import { createServerFn } from "@tanstack/react-start";
import { and, count, eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { z as zod } from "zod";
import { db } from "@/lib/db";
import { attributes, attributeValues } from "@/lib/db/schema/attribute-schema";
import { productAttributes } from "@/lib/db/schema/products-schema";
import {
  executeAttributeQuery,
  fetchAttributeWithRelations,
} from "@/lib/helper/attribute-query-helpers";
import { requireShopAccess } from "@/lib/helper/vendor";
import { authMiddleware } from "@/lib/middleware/auth";
import { generateSlug } from "@/lib/utils/slug";
import {
  createAttributeSchema,
  updateAttributeSchema,
  vendorAttributesQuerySchema,
} from "@/lib/validators/shared/attribute-query";
import type { AttributeListResponse } from "@/types/attributes";

// ============================================================================
// Get Attributes (List with Pagination) - OPTIMIZED
// ============================================================================

export const getAttributes = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .inputValidator(vendorAttributesQuerySchema)
  .handler(async ({ context, data }): Promise<AttributeListResponse> => {
    const userId = context.session.user.id;
    const {
      shopId,
      limit,
      offset,
      search,
      type,
      isActive,
      sortBy,
      sortDirection,
    } = data;

    // Verify shop access (vendor ownership or admin)
    await requireShopAccess(userId, shopId);

    // Use shared query helper
    return executeAttributeQuery({
      baseConditions: [eq(attributes.shopId, shopId)],
      search,
      type,
      isActive,
      limit,
      offset,
      sortBy,
      sortDirection,
      includeShopInfo: false,
      includeValues: true,
    });
  });

// ============================================================================
// Get Attribute by ID - OPTIMIZED
// ============================================================================

export const getAttributeById = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .inputValidator(
    vendorAttributesQuerySchema
      .pick({ shopId: true })
      .extend({ id: zod.string().min(1, "Attribute ID is required") }),
  )
  .handler(async ({ context, data }) => {
    const userId = context.session.user.id;
    const { id, shopId } = data as { id: string; shopId: string };

    // Verify shop access (vendor ownership or admin)
    await requireShopAccess(userId, shopId);

    // Get attribute with values
    const attribute = await db.query.attributes.findFirst({
      where: and(eq(attributes.id, id), eq(attributes.shopId, shopId)),
    });

    if (!attribute) {
      throw new Error("Attribute not found.");
    }

    // Use shared helper for fetching with relations
    const normalizedAttribute = await fetchAttributeWithRelations(attribute, {
      includeShopInfo: false,
      includeValues: true,
    });

    return { attribute: normalizedAttribute };
  });

// ============================================================================
// Create Attribute
// ============================================================================

export const createAttribute = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator(createAttributeSchema)
  .handler(async ({ context, data }) => {
    const userId = context.session.user.id;
    const { shopId, values, ...attributeData } = data;

    // Verify shop access (vendor ownership or admin)
    await requireShopAccess(userId, shopId);

    // Generate slug if not provided
    let slug = attributeData.slug;
    if (!slug) {
      slug = generateSlug(attributeData.name);
    }

    // Check for duplicate slug within the shop
    const existingAttribute = await db.query.attributes.findFirst({
      where: and(eq(attributes.shopId, shopId), eq(attributes.slug, slug)),
    });

    if (existingAttribute) {
      throw new Error(
        "An attribute with this slug already exists in this shop. Please choose a different name or slug.",
      );
    }

    // Create the attribute
    const attributeId = uuidv4();

    await db.insert(attributes).values({
      id: attributeId,
      shopId: shopId,
      name: attributeData.name,
      slug: slug,
      type: attributeData.type,
      sortOrder: attributeData.sortOrder ?? 0,
      isActive: attributeData.isActive ?? true,
    });

    // Create attribute values
    if (values && values.length > 0) {
      const valueRecords = values.map((val, index) => ({
        id: uuidv4(),
        attributeId: attributeId,
        name: val.name,
        slug: val.slug || generateSlug(val.name),
        value: val.value,
        sortOrder: index,
      }));

      await db.insert(attributeValues).values(valueRecords);
    }

    // Fetch the created attribute with values
    const newAttribute = await db.query.attributes.findFirst({
      where: eq(attributes.id, attributeId),
    });

    if (!newAttribute) {
      throw new Error("Failed to create attribute.");
    }

    const normalizedAttribute = await fetchAttributeWithRelations(
      newAttribute,
      {
        includeShopInfo: false,
        includeValues: true,
      },
    );

    return {
      success: true,
      attribute: normalizedAttribute,
    };
  });

// ============================================================================
// Update Attribute
// ============================================================================

export const updateAttribute = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator(updateAttributeSchema)
  .handler(async ({ context, data }) => {
    const userId = context.session.user.id;
    const { id, shopId, values, ...updateData } = data;

    // Verify shop access (vendor ownership or admin)
    await requireShopAccess(userId, shopId);

    // Check if attribute exists
    const existingAttribute = await db.query.attributes.findFirst({
      where: and(eq(attributes.id, id), eq(attributes.shopId, shopId)),
    });

    if (!existingAttribute) {
      throw new Error("Attribute not found.");
    }

    // Check for duplicate slug if slug is being updated
    if (updateData.slug && updateData.slug !== existingAttribute.slug) {
      const slugExists = await db.query.attributes.findFirst({
        where: and(
          eq(attributes.shopId, shopId),
          eq(attributes.slug, updateData.slug),
        ),
      });

      if (slugExists) {
        throw new Error(
          "An attribute with this slug already exists in this shop.",
        );
      }
    }

    // Build update object
    const updateValues: Record<string, any> = {};
    if (updateData.name !== undefined) updateValues.name = updateData.name;
    if (updateData.slug !== undefined) updateValues.slug = updateData.slug;
    if (updateData.type !== undefined) updateValues.type = updateData.type;
    if (updateData.sortOrder !== undefined)
      updateValues.sortOrder = updateData.sortOrder;
    if (updateData.isActive !== undefined)
      updateValues.isActive = updateData.isActive;

    // Update the attribute
    if (Object.keys(updateValues).length > 0) {
      await db
        .update(attributes)
        .set(updateValues)
        .where(eq(attributes.id, id));
    }

    // Update values if provided
    if (values !== undefined) {
      // Delete existing values
      await db
        .delete(attributeValues)
        .where(eq(attributeValues.attributeId, id));

      // Insert new values
      if (values.length > 0) {
        const valueRecords = values.map((val, index) => ({
          id: uuidv4(),
          attributeId: id,
          name: val.name,
          slug: val.slug || generateSlug(val.name),
          value: val.value,
          sortOrder: index,
        }));

        await db.insert(attributeValues).values(valueRecords);
      }
    }

    // Fetch updated attribute with values
    const updatedAttribute = await db.query.attributes.findFirst({
      where: eq(attributes.id, id),
    });

    if (!updatedAttribute) {
      throw new Error("Failed to update attribute.");
    }

    const normalizedAttribute = await fetchAttributeWithRelations(
      updatedAttribute,
      {
        includeShopInfo: false,
        includeValues: true,
      },
    );

    return {
      success: true,
      attribute: normalizedAttribute,
    };
  });

// ============================================================================
// Delete Attribute - OPTIMIZED
// ============================================================================

export const deleteAttribute = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator(
    vendorAttributesQuerySchema
      .pick({ shopId: true })
      .extend({ id: zod.string().min(1, "Attribute ID is required") }),
  )
  .handler(async ({ context, data }) => {
    const userId = context.session.user.id;
    const { id, shopId } = data as { id: string; shopId: string };

    // Verify shop access (vendor ownership or admin)
    await requireShopAccess(userId, shopId);

    // Check attribute exists and get actual product count in parallel
    const [existingAttribute, productCountResult] = await Promise.all([
      db.query.attributes.findFirst({
        where: and(eq(attributes.id, id), eq(attributes.shopId, shopId)),
      }),
      db
        .select({ count: count() })
        .from(productAttributes)
        .where(eq(productAttributes.attributeId, id)),
    ]);

    if (!existingAttribute) {
      throw new Error("Attribute not found.");
    }

    // Check actual product count from productAttributes table
    const actualProductCount = productCountResult[0]?.count ?? 0;
    if (actualProductCount > 0) {
      throw new Error(
        "Cannot delete an attribute that is assigned to products. Please remove it from products first.",
      );
    }

    // Delete the attribute (values will cascade delete)
    await db.delete(attributes).where(eq(attributes.id, id));

    return {
      success: true,
      message: "Attribute deleted successfully",
    };
  });
