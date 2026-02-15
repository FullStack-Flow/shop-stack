/**
 * Admin Tax Rate Server Functions
 *
 * Server functions for tax rate management in the admin dashboard.
 * Admins can view and manage ALL tax rates across all vendors and shops.
 */

import { createServerFn } from "@tanstack/react-start";
import { count, eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { products } from "@/lib/db/schema/products-schema";
import { shops } from "@/lib/db/schema/shop-schema";
import { taxRates } from "@/lib/db/schema/tax-schema";
import {
  executeTaxRateQuery,
  fetchTaxRateWithRelations,
} from "@/lib/helper/tax-rate-query-helpers";
import { adminMiddleware } from "@/lib/middleware/admin";
import {
  type AdminTaxRatesQuery,
  adminTaxRatesQuerySchema,
  deleteTaxRateSchema,
  getTaxRateByIdSchema,
  toggleTaxRateActiveSchema,
} from "@/lib/validators/shared/tax-rate-query";
import {
  createSuccessResponse,
  emptyPaginatedResponse,
} from "@/types/api-response";
import type { NormalizedTaxRate, TaxRateListResponse } from "@/types/taxes";

// ============================================================================
// Get All Tax Rates (Admin)
// ============================================================================

/**
 * Get all tax rates with optional filtering by shop/vendor
 * Admins can see all tax rates across all vendors
 */
export const getAdminTaxRates = createServerFn({ method: "GET" })
  .middleware([adminMiddleware])
  .inputValidator(adminTaxRatesQuerySchema)
  .handler(async ({ data }): Promise<TaxRateListResponse> => {
    const {
      shopId,
      vendorId,
      limit,
      offset,
      search,
      country,
      isActive,
      sortBy,
      sortDirection,
    } = data as AdminTaxRatesQuery;

    // Build base conditions for admin scope
    const baseConditions = [];

    // Filter by specific shop if provided
    if (shopId) {
      baseConditions.push(eq(taxRates.shopId, shopId));
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
            taxRates.shopId,
            vendorShops.map((s) => s.id),
          ),
        );
      } else {
        return emptyPaginatedResponse<NormalizedTaxRate>(limit!, offset!);
      }
    }

    // Execute query using shared helper
    return executeTaxRateQuery({
      baseConditions,
      search,
      country,
      isActive,
      limit,
      offset,
      sortBy,
      sortDirection,
      includeShopInfo: true,
    });
  });

// ============================================================================
// Get Tax Rate by ID (Admin)
// ============================================================================

/**
 * Get a single tax rate by ID (admin can view any tax rate)
 */
export const getAdminTaxRateById = createServerFn({ method: "GET" })
  .middleware([adminMiddleware])
  .inputValidator(getTaxRateByIdSchema)
  .handler(async ({ data }) => {
    const { id } = data;

    const [taxRate] = await db
      .select()
      .from(taxRates)
      .where(eq(taxRates.id, id));

    if (!taxRate) {
      throw new Error("Tax rate not found.");
    }

    const normalizedTaxRate = await fetchTaxRateWithRelations(taxRate, {
      includeShopInfo: true,
    });

    return { taxRate: normalizedTaxRate };
  });

// ============================================================================
// Toggle Active Status (Admin)
// ============================================================================

/**
 * Toggle tax rate active status
 */
export const toggleAdminTaxRateActive = createServerFn({ method: "POST" })
  .middleware([adminMiddleware])
  .inputValidator(toggleTaxRateActiveSchema)
  .handler(async ({ data }) => {
    const { id, isActive } = data;

    const [existingTaxRate] = await db
      .select()
      .from(taxRates)
      .where(eq(taxRates.id, id));

    if (!existingTaxRate) {
      throw new Error("Tax rate not found.");
    }

    await db.update(taxRates).set({ isActive }).where(eq(taxRates.id, id));

    return createSuccessResponse(
      isActive ? "Tax rate activated" : "Tax rate deactivated",
    );
  });

// ============================================================================
// Delete Tax Rate (Admin)
// ============================================================================

/**
 * Delete a tax rate (admin can delete any tax rate)
 */
export const deleteAdminTaxRate = createServerFn({ method: "POST" })
  .middleware([adminMiddleware])
  .inputValidator(deleteTaxRateSchema)
  .handler(async ({ data }) => {
    const { id } = data;

    const [existingTaxRate] = await db
      .select()
      .from(taxRates)
      .where(eq(taxRates.id, id));

    if (!existingTaxRate) {
      throw new Error("Tax rate not found.");
    }

    // Check for products using this tax rate
    const [productCount] = await db
      .select({ count: count() })
      .from(products)
      .where(eq(products.taxId, id));

    if ((productCount?.count ?? 0) > 0) {
      throw new Error(
        "Cannot delete a tax rate that is assigned to products. Please reassign products first.",
      );
    }

    await db.delete(taxRates).where(eq(taxRates.id, id));

    return createSuccessResponse("Tax rate deleted successfully");
  });
