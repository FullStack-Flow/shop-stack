/**
 * Customer Address Server Functions
 *
 * Server functions for managing customer addresses.
 * Uses TanStack Start's createServerFn with authentication middleware.
 */

import { createServerFn } from "@tanstack/react-start";
import { and, eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { db } from "@/lib/db";
import { customerAddresses } from "@/lib/db/schema/address-schema";
import { authMiddleware } from "@/lib/middleware/auth";
import {
  createAddressSchema,
  deleteAddressSchema,
  updateAddressSchema,
} from "@/lib/validators/address";

// ============================================================================
// Get User's Addresses
// ============================================================================

export const getUserAddresses = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const userId = context.session?.user?.id;

    if (!userId) {
      throw new Error("Unauthorized: User not found");
    }

    const addresses = await db
      .select()
      .from(customerAddresses)
      .where(eq(customerAddresses.userId, userId))
      .orderBy(customerAddresses.createdAt);

    return { addresses };
  });

// ============================================================================
// Create Address
// ============================================================================

export const createAddress = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator(createAddressSchema)
  .handler(async ({ context, data }) => {
    const userId = context.session?.user?.id;

    if (!userId) {
      throw new Error("Unauthorized: User not found");
    }

    // If this is the first address or marked as default, update others
    if (data.isDefault) {
      await db
        .update(customerAddresses)
        .set({ isDefault: false })
        .where(
          and(
            eq(customerAddresses.userId, userId),
            eq(customerAddresses.type, data.type),
          ),
        );
    }

    // Check if this is the first address of this type
    const existingAddresses = await db
      .select()
      .from(customerAddresses)
      .where(
        and(
          eq(customerAddresses.userId, userId),
          eq(customerAddresses.type, data.type),
        ),
      );

    const isFirstAddress = existingAddresses.length === 0;

    const [newAddress] = await db
      .insert(customerAddresses)
      .values({
        id: uuidv4(),
        userId,
        type: data.type,
        title: data.title,
        firstName: data.firstName || null,
        lastName: data.lastName || null,
        phone: data.phone || null,
        street: data.street,
        city: data.city,
        state: data.state,
        zip: data.zip,
        country: data.country,
        isDefault: data.isDefault || isFirstAddress, // First address is default
      })
      .returning();

    return { address: newAddress };
  });

// ============================================================================
// Update Address
// ============================================================================

export const updateAddress = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator(updateAddressSchema)
  .handler(async ({ context, data }) => {
    const userId = context.session?.user?.id;

    if (!userId) {
      throw new Error("Unauthorized: User not found");
    }

    // Verify ownership
    const existingAddress = await db.query.customerAddresses.findFirst({
      where: and(
        eq(customerAddresses.id, data.id),
        eq(customerAddresses.userId, userId),
      ),
    });

    if (!existingAddress) {
      throw new Error("Address not found");
    }

    // If setting as default, unset other defaults of same type
    if (data.isDefault) {
      const addressType = data.type || existingAddress.type;
      await db
        .update(customerAddresses)
        .set({ isDefault: false })
        .where(
          and(
            eq(customerAddresses.userId, userId),
            eq(customerAddresses.type, addressType),
          ),
        );
    }

    const [updatedAddress] = await db
      .update(customerAddresses)
      .set({
        type: data.type ?? existingAddress.type,
        title: data.title ?? existingAddress.title,
        firstName: data.firstName ?? existingAddress.firstName,
        lastName: data.lastName ?? existingAddress.lastName,
        phone: data.phone ?? existingAddress.phone,
        street: data.street ?? existingAddress.street,
        city: data.city ?? existingAddress.city,
        state: data.state ?? existingAddress.state,
        zip: data.zip ?? existingAddress.zip,
        country: data.country ?? existingAddress.country,
        isDefault: data.isDefault ?? existingAddress.isDefault,
      })
      .where(eq(customerAddresses.id, data.id))
      .returning();

    return { address: updatedAddress };
  });

// ============================================================================
// Delete Address
// ============================================================================

export const deleteAddress = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator(deleteAddressSchema)
  .handler(async ({ context, data }) => {
    const userId = context.session?.user?.id;

    if (!userId) {
      throw new Error("Unauthorized: User not found");
    }

    // Verify ownership
    const existingAddress = await db.query.customerAddresses.findFirst({
      where: and(
        eq(customerAddresses.id, data.id),
        eq(customerAddresses.userId, userId),
      ),
    });

    if (!existingAddress) {
      throw new Error("Address not found");
    }

    await db.delete(customerAddresses).where(eq(customerAddresses.id, data.id));

    // If the deleted address was default, make another address of same type default
    if (existingAddress.isDefault) {
      const [nextAddress] = await db
        .select()
        .from(customerAddresses)
        .where(
          and(
            eq(customerAddresses.userId, userId),
            eq(customerAddresses.type, existingAddress.type),
          ),
        )
        .limit(1);

      if (nextAddress) {
        await db
          .update(customerAddresses)
          .set({ isDefault: true })
          .where(eq(customerAddresses.id, nextAddress.id));
      }
    }

    return { success: true };
  });

// ============================================================================
// Set Default Address
// ============================================================================

export const setDefaultAddress = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator(deleteAddressSchema) // Same schema - just needs ID
  .handler(async ({ context, data }) => {
    const userId = context.session?.user?.id;

    if (!userId) {
      throw new Error("Unauthorized: User not found");
    }

    // Verify ownership and get address type
    const existingAddress = await db.query.customerAddresses.findFirst({
      where: and(
        eq(customerAddresses.id, data.id),
        eq(customerAddresses.userId, userId),
      ),
    });

    if (!existingAddress) {
      throw new Error("Address not found");
    }

    // Unset other defaults of same type
    await db
      .update(customerAddresses)
      .set({ isDefault: false })
      .where(
        and(
          eq(customerAddresses.userId, userId),
          eq(customerAddresses.type, existingAddress.type),
        ),
      );

    // Set this address as default
    const [updatedAddress] = await db
      .update(customerAddresses)
      .set({ isDefault: true })
      .where(eq(customerAddresses.id, data.id))
      .returning();

    return { address: updatedAddress };
  });
