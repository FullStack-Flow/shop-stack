/**
 * Tax Rate Server Functions
 *
 * Server functions for tax rate management in the vendor dashboard.
 * Uses TanStack Start's createServerFn with Zod validation.
 */

import { createServerFn } from "@tanstack/react-start";
import { and, eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { z as zod } from "zod";
import { db } from "@/lib/db";
import { taxRates } from "@/lib/db/schema/tax-schema";
import {
  executeTaxRateQuery,
  fetchTaxRateWithRelations,
} from "@/lib/helper/tax-rate-query-helpers";
import { requireShopAccess } from "@/lib/helper/vendor";
import { authMiddleware } from "@/lib/middleware/auth";
import {
  createTaxRateSchema,
  updateTaxRateSchema,
  vendorTaxRatesQuerySchema,
} from "@/lib/validators/shared/tax-rate-query";
import type { TaxRateItem } from "@/types/taxes";

// ============================================================================
// Get Tax Rates (List with Pagination)
// ============================================================================

export const getTaxRates = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .inputValidator(vendorTaxRatesQuerySchema)
  .handler(async ({ context, data }) => {
    const userId = context.session.user.id;
    const {
      shopId,
      limit,
      offset,
      search,
      country,
      isActive,
      sortBy,
      sortDirection,
    } = data;

    // Verify shop access (vendor ownership or admin)
    await requireShopAccess(userId, shopId);

    // Use shared query helper
    return executeTaxRateQuery({
      baseConditions: [eq(taxRates.shopId, shopId)],
      search,
      country,
      isActive,
      limit,
      offset,
      sortBy,
      sortDirection,
      includeShopInfo: false,
    });
  });

// ============================================================================
// Get Tax Rate by ID
// ============================================================================

export const getTaxRateById = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .inputValidator(
    vendorTaxRatesQuerySchema
      .pick({ shopId: true })
      .extend({ id: zod.string().min(1, "Tax rate ID is required") }),
  )
  .handler(async ({ context, data }) => {
    const userId = context.session.user.id;
    const { id, shopId } = data as { id: string; shopId: string };

    // Verify shop access (vendor ownership or admin)
    await requireShopAccess(userId, shopId);

    // Get tax rate
    const taxRate = await db.query.taxRates.findFirst({
      where: and(eq(taxRates.id, id), eq(taxRates.shopId, shopId)),
    });

    if (!taxRate) {
      throw new Error("Tax rate not found.");
    }

    // Use shared helper for fetching with relations
    const normalizedTaxRate = await fetchTaxRateWithRelations(taxRate, {
      includeShopInfo: false,
    });

    return { taxRate: normalizedTaxRate };
  });

// ============================================================================
// Create Tax Rate
// ============================================================================

export const createTaxRate = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator(createTaxRateSchema)
  .handler(async ({ context, data }) => {
    const userId = context.session.user.id;
    const { shopId, ...taxRateData } = data;

    // Verify shop access (vendor ownership or admin)
    await requireShopAccess(userId, shopId);

    // Create the tax rate
    const taxRateId = uuidv4();

    await db.insert(taxRates).values({
      id: taxRateId,
      shopId,
      name: taxRateData.name,
      rate: String(taxRateData.rate),
      country: taxRateData.country,
      state: taxRateData.state || null,
      zip: taxRateData.zip || null,
      priority: String(taxRateData.priority),
      isActive: taxRateData.isActive,
      isCompound: taxRateData.isCompound,
    });

    // Fetch the created tax rate
    const newTaxRate = await db.query.taxRates.findFirst({
      where: eq(taxRates.id, taxRateId),
    });

    if (!newTaxRate) {
      throw new Error("Failed to create tax rate.");
    }

    const normalizedTaxRate = await fetchTaxRateWithRelations(newTaxRate, {
      includeShopInfo: false,
    });

    return {
      success: true,
      taxRate: normalizedTaxRate as TaxRateItem,
    };
  });

// ============================================================================
// Update Tax Rate
// ============================================================================

export const updateTaxRate = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator(updateTaxRateSchema)
  .handler(async ({ context, data }) => {
    const userId = context.session.user.id;
    const { id, shopId, ...updateData } = data;

    // Verify shop access (vendor ownership or admin)
    await requireShopAccess(userId, shopId);

    // Check if tax rate exists
    const existingTaxRate = await db.query.taxRates.findFirst({
      where: and(eq(taxRates.id, id), eq(taxRates.shopId, shopId)),
    });

    if (!existingTaxRate) {
      throw new Error("Tax rate not found.");
    }

    // Build update object
    const updateValues: Record<string, any> = {};
    if (updateData.name !== undefined) updateValues.name = updateData.name;
    if (updateData.rate !== undefined)
      updateValues.rate = String(updateData.rate);
    if (updateData.country !== undefined)
      updateValues.country = updateData.country;
    if (updateData.state !== undefined) updateValues.state = updateData.state;
    if (updateData.zip !== undefined) updateValues.zip = updateData.zip;
    if (updateData.priority !== undefined)
      updateValues.priority = String(updateData.priority);
    if (updateData.isActive !== undefined)
      updateValues.isActive = updateData.isActive;
    if (updateData.isCompound !== undefined)
      updateValues.isCompound = updateData.isCompound;

    // Update the tax rate
    if (Object.keys(updateValues).length > 0) {
      await db.update(taxRates).set(updateValues).where(eq(taxRates.id, id));
    }

    // Fetch updated tax rate
    const updatedTaxRate = await db.query.taxRates.findFirst({
      where: eq(taxRates.id, id),
    });

    if (!updatedTaxRate) {
      throw new Error("Failed to update tax rate.");
    }

    const normalizedTaxRate = await fetchTaxRateWithRelations(updatedTaxRate, {
      includeShopInfo: false,
    });

    return {
      success: true,
      taxRate: normalizedTaxRate as TaxRateItem,
    };
  });

// ============================================================================
// Delete Tax Rate
// ============================================================================

export const deleteTaxRate = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator(
    vendorTaxRatesQuerySchema
      .pick({ shopId: true })
      .extend({ id: zod.string().min(1, "Tax rate ID is required") }),
  )
  .handler(async ({ context, data }) => {
    const userId = context.session.user.id;
    const { id, shopId } = data as { id: string; shopId: string };

    // Verify shop access (vendor ownership or admin)
    await requireShopAccess(userId, shopId);

    // Check if tax rate exists
    const existingTaxRate = await db.query.taxRates.findFirst({
      where: and(eq(taxRates.id, id), eq(taxRates.shopId, shopId)),
    });

    if (!existingTaxRate) {
      throw new Error("Tax rate not found.");
    }

    // Delete the tax rate
    await db.delete(taxRates).where(eq(taxRates.id, id));

    return {
      success: true,
      message: "Tax rate deleted successfully",
    };
  });

// ============================================================================
// Toggle Tax Rate Active Status
// ============================================================================

export const toggleTaxRateActive = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator(
    vendorTaxRatesQuerySchema
      .pick({ shopId: true })
      .extend({ id: zod.string().min(1, "Tax rate ID is required") }),
  )
  .handler(async ({ context, data }) => {
    const userId = context.session.user.id;
    const { id, shopId } = data as { id: string; shopId: string };

    // Verify shop access (vendor ownership or admin)
    await requireShopAccess(userId, shopId);

    // Check if tax rate exists
    const existingTaxRate = await db.query.taxRates.findFirst({
      where: and(eq(taxRates.id, id), eq(taxRates.shopId, shopId)),
    });

    if (!existingTaxRate) {
      throw new Error("Tax rate not found.");
    }

    // Toggle active status
    const newActiveStatus = !existingTaxRate.isActive;
    await db
      .update(taxRates)
      .set({ isActive: newActiveStatus })
      .where(eq(taxRates.id, id));

    return {
      success: true,
      isActive: newActiveStatus,
      message: `Tax rate ${newActiveStatus ? "activated" : "deactivated"} successfully`,
    };
  });
