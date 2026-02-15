/**
 * Tax Rate Query Helpers
 *
 * Shared utilities for tax rate queries across vendor, admin, and store contexts.
 * Centralizes normalization and query building logic.
 */

import {
  and,
  asc,
  count,
  desc,
  eq,
  ilike,
  inArray,
  or,
  type SQL,
} from "drizzle-orm";
import type {
  NormalizedTaxRate,
  TaxRateQueryOptions,
  TaxRateQueryResult,
} from "@/types/taxes";
import { db } from "../db";
import { products } from "../db/schema/products-schema";
import { shops } from "../db/schema/shop-schema";
import { taxRates } from "../db/schema/tax-schema";

/**
 * Batch fetch all related data for a list of tax rates
 */
export async function batchFetchTaxRateRelations(
  taxRateIds: string[],
  taxRateList: (typeof taxRates.$inferSelect)[],
  options: {
    includeShopInfo?: boolean;
  } = {},
): Promise<{
  shopsMap: Map<string, { id: string; name: string; slug: string }>;
  productCountsMap: Map<string, number>;
}> {
  if (taxRateIds.length === 0) {
    return {
      shopsMap: new Map(),
      productCountsMap: new Map(),
    };
  }

  // Collect unique shop IDs
  const shopIds = [...new Set(taxRateList.map((tr) => tr.shopId))];

  // Build parallel queries
  const shopRecords =
    options.includeShopInfo && shopIds.length > 0
      ? await db
          .select({
            id: shops.id,
            name: shops.name,
            slug: shops.slug,
          })
          .from(shops)
          .where(inArray(shops.id, shopIds))
      : [];

  const productCounts = await db
    .select({
      taxId: products.taxId,
      count: count(),
    })
    .from(products)
    .where(inArray(products.taxId, taxRateIds))
    .groupBy(products.taxId);

  // Build lookup maps
  const shopsMap = new Map<
    string,
    { id: string; name: string; slug: string }
  >();
  for (const shop of shopRecords) {
    shopsMap.set(shop.id, shop);
  }

  const productCountsMap = new Map<string, number>();
  for (const productCount of productCounts) {
    if (!productCount.taxId) {
      continue;
    }
    productCountsMap.set(productCount.taxId, productCount.count);
  }

  return {
    shopsMap,
    productCountsMap,
  };
}

/**
 * Transform a database tax rate record into a normalized response object
 */
export function normalizeTaxRate(
  taxRate: typeof taxRates.$inferSelect,
  relations: {
    shopsMap: Map<string, { id: string; name: string; slug: string }>;
    productCountsMap: Map<string, number>;
  },
  options: {
    includeShopInfo?: boolean;
  } = {},
): NormalizedTaxRate {
  let shopName: string | null = null;
  let shopSlug: string | null = null;

  if (options.includeShopInfo) {
    const shopInfo = relations.shopsMap.get(taxRate.shopId);
    if (shopInfo) {
      shopName = shopInfo.name;
      shopSlug = shopInfo.slug;
    }
  }

  const productCount = relations.productCountsMap.get(taxRate.id) ?? 0;

  return {
    id: taxRate.id,
    shopId: taxRate.shopId,
    shopName,
    shopSlug,
    name: taxRate.name,
    rate: taxRate.rate,
    country: taxRate.country,
    state: taxRate.state || undefined,
    zip: taxRate.zip || undefined,
    priority: taxRate.priority || "",
    isActive: taxRate.isActive || true,
    isCompound: taxRate.isCompound || false,
    productCount,
    createdAt: taxRate.createdAt.toISOString(),
    updatedAt: taxRate.updatedAt.toISOString(),
  };
}

// ============================================================================
// Build Filter Conditions
// ============================================================================

/**
 * Build SQL WHERE conditions from filter parameters
 */
export function buildTaxRateFilterConditions(
  options: Omit<
    TaxRateQueryOptions,
    "limit" | "offset" | "sortBy" | "sortDirection" | "includeShopInfo"
  >,
): SQL[] {
  const conditions: SQL[] = [];

  // Add base conditions
  if (options.baseConditions) {
    conditions.push(...options.baseConditions);
  }

  // Search filter
  if (options.search) {
    conditions.push(
      or(
        ilike(taxRates.name, `%${options.search}%`),
        ilike(taxRates.country, `%${options.search}%`),
        ilike(taxRates.state, `%${options.search}%`),
      ) as any,
    );
  }

  // Country filter
  if (options.country) {
    conditions.push(eq(taxRates.country, options.country));
  }

  // Active filter
  if (options.isActive !== undefined) {
    conditions.push(eq(taxRates.isActive, options.isActive));
  }

  return conditions;
}

// ============================================================================
// Execute Tax Rate Query
// ============================================================================

/**
 * Execute a tax rate query with the given options
 * Handles filtering, pagination, sorting, and batch fetching relations
 */
export async function executeTaxRateQuery(
  options: TaxRateQueryOptions,
): Promise<TaxRateQueryResult> {
  const limit = options.limit ?? 10;
  const offset = options.offset ?? 0;
  const sortDirection = options.sortDirection ?? "asc";

  // Build filter conditions
  const conditions = buildTaxRateFilterConditions(options);
  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  // Build order by clause
  const orderFn = sortDirection === "desc" ? desc : asc;
  const orderByClause = (() => {
    switch (options.sortBy) {
      case "name":
        return orderFn(taxRates.name);
      case "rate":
        return orderFn(taxRates.rate);
      case "priority":
        return orderFn(taxRates.priority);
      case "createdAt":
        return orderFn(taxRates.createdAt);
      default:
        return orderFn(taxRates.priority);
    }
  })();

  // Parallel: Get count and paginated tax rates
  const [countResult, taxRateList] = await Promise.all([
    db.select({ count: count() }).from(taxRates).where(whereClause),
    db
      .select()
      .from(taxRates)
      .where(whereClause)
      .orderBy(orderByClause)
      .limit(limit)
      .offset(offset),
  ]);

  const total = countResult[0]?.count ?? 0;

  if (taxRateList.length === 0) {
    return {
      data: [],
      total,
      limit,
      offset,
    };
  }

  // Batch fetch all relations
  const taxRateIds = taxRateList.map((tr) => tr.id);
  const relations = await batchFetchTaxRateRelations(taxRateIds, taxRateList, {
    includeShopInfo: options.includeShopInfo,
  });

  // Normalize all tax rates
  const normalizedTaxRates = taxRateList.map((taxRate) =>
    normalizeTaxRate(taxRate, relations, {
      includeShopInfo: options.includeShopInfo,
    }),
  );

  return {
    data: normalizedTaxRates,
    total,
    limit,
    offset,
  };
}

// ============================================================================
// Fetch Single Tax Rate with Relations
// ============================================================================

/**
 * Fetch a single tax rate with all its relations
 */
export async function fetchTaxRateWithRelations(
  taxRate: typeof taxRates.$inferSelect,
  options: {
    includeShopInfo?: boolean;
  } = {},
): Promise<NormalizedTaxRate> {
  const relations = await batchFetchTaxRateRelations([taxRate.id], [taxRate], {
    includeShopInfo: options.includeShopInfo,
  });

  return normalizeTaxRate(taxRate, relations, options);
}
