/**
 * Shipping Server Functions
 *
 * Server functions for shipping management in the vendor dashboard.
 */

import { createServerFn } from "@tanstack/react-start";
import { and, asc, count, desc, eq, ilike } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { db } from "../db";
import { shippingMethods } from "../db/schema/shipping-schema";
import { requireShopAccess } from "../helper/vendor";
import { authMiddleware } from "../middleware/auth";
import {
  createShippingMethodSchema,
  deleteShippingMethodSchema,
  getShippingMethodByIdSchema,
  getShippingMethodsQuerySchema,
  updateShippingMethodSchema,
} from "../validators/shipping";

// ============================================================================
// Get Shipping Methods (List with Pagination)
// ============================================================================

export const getShippingMethods = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .inputValidator(getShippingMethodsQuerySchema)
  .handler(async ({ context, data }) => {
    const userId = context.session.user.id;
    const { shopId, limit, offset, search, isActive, sortBy, sortDirection } =
      data;

    // Verify shop access
    await requireShopAccess(userId, shopId);

    // Build where conditions
    const conditions = [eq(shippingMethods.shopId, shopId)];

    if (search) {
      conditions.push(ilike(shippingMethods.name, `%${search}%`));
    }

    if (isActive !== undefined) {
      conditions.push(eq(shippingMethods.isActive, isActive));
    }

    const whereClause = and(...conditions);

    // Build order by clause
    const orderFn = sortDirection === "desc" ? desc : asc;
    const orderByClause = (() => {
      switch (sortBy) {
        case "name":
          return orderFn(shippingMethods.name);
        case "price":
          return orderFn(shippingMethods.price);
        default:
          return orderFn(shippingMethods.createdAt);
      }
    })();

    // Parallel queries for count and list
    const [countResult, shippingList] = await Promise.all([
      db.select({ count: count() }).from(shippingMethods).where(whereClause),
      db
        .select()
        .from(shippingMethods)
        .where(whereClause)
        .orderBy(orderByClause)
        .limit(limit)
        .offset(offset),
    ]);

    const total = countResult[0]?.count ?? 0;

    return {
      data: shippingList.map((item) => ({
        ...item,
        isActive: item.isActive ?? true,
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString(),
      })),
      total,
      limit,
      offset,
    };
  });

// ============================================================================
// Get Shipping Method by ID
// ============================================================================

export const getShippingMethodById = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .inputValidator(getShippingMethodByIdSchema)
  .handler(async ({ context, data }) => {
    const userId = context.session.user.id;
    const { id, shopId } = data;

    await requireShopAccess(userId, shopId);

    const [shippingMethod] = await db
      .select()
      .from(shippingMethods)
      .where(
        and(eq(shippingMethods.id, id), eq(shippingMethods.shopId, shopId)),
      )
      .limit(1);

    if (!shippingMethod) {
      throw new Error("Shipping method not found.");
    }

    return {
      shippingMethod: {
        ...shippingMethod,
        createdAt: shippingMethod.createdAt.toISOString(),
        updatedAt: shippingMethod.updatedAt.toISOString(),
      },
    };
  });

// ============================================================================
// Create Shipping Method
// ============================================================================

export const createShippingMethod = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator(createShippingMethodSchema)
  .handler(async ({ context, data }) => {
    const userId = context.session.user.id;
    const { shopId, ...methodData } = data;

    await requireShopAccess(userId, shopId);

    const id = uuidv4();

    const [newMethod] = await db
      .insert(shippingMethods)
      .values({
        id,
        shopId,
        name: methodData.name,
        description: methodData.description,
        price: methodData.price.toString(),
        duration: methodData.duration,
        isActive: methodData.isActive,
      })
      .returning();

    return {
      success: true,
      shippingMethod: {
        ...newMethod,
        createdAt: newMethod.createdAt.toISOString(),
        updatedAt: newMethod.updatedAt.toISOString(),
      },
    };
  });

// ============================================================================
// Update Shipping Method
// ============================================================================

export const updateShippingMethod = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator(updateShippingMethodSchema)
  .handler(async ({ context, data }) => {
    const userId = context.session.user.id;
    const { id, shopId, ...updates } = data;

    await requireShopAccess(userId, shopId);

    // Prepare update data
    const updateData: any = { ...updates };
    if (updates.price !== undefined) {
      updateData.price = updates.price.toString();
    }

    const [updatedMethod] = await db
      .update(shippingMethods)
      .set(updateData)
      .where(
        and(eq(shippingMethods.id, id), eq(shippingMethods.shopId, shopId)),
      )
      .returning();

    if (!updatedMethod) {
      throw new Error("Shipping method not found or update failed.");
    }

    return {
      success: true,
      shippingMethod: {
        ...updatedMethod,
        createdAt: updatedMethod.createdAt.toISOString(),
        updatedAt: updatedMethod.updatedAt.toISOString(),
      },
    };
  });

// ============================================================================
// Delete Shipping Method
// ============================================================================

export const deleteShippingMethod = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator(deleteShippingMethodSchema)
  .handler(async ({ context, data }) => {
    const userId = context.session.user.id;
    const { id, shopId } = data;

    await requireShopAccess(userId, shopId);

    const [deletedMethod] = await db
      .delete(shippingMethods)
      .where(
        and(eq(shippingMethods.id, id), eq(shippingMethods.shopId, shopId)),
      )
      .returning();

    if (!deletedMethod) {
      throw new Error("Shipping method not found or delete failed.");
    }

    return {
      success: true,
      id,
    };
  });
