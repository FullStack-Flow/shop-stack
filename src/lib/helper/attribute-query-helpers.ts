/**
 * Attribute Query Helpers
 *
 * Shared utilities for attribute queries across vendor, admin, and store contexts.
 * Centralizes batch fetching, normalization, and query building logic.
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
  AttributeItem,
  AttributeQueryOptions,
  AttributeQueryResult,
  AttributeValueItem,
  BatchedAttributeRelations,
} from "@/types/attributes";
import { db } from "../db";
import { attributes, attributeValues } from "../db/schema/attribute-schema";
import { shops } from "../db/schema/shop-schema";

/**
 * Batch fetch all related data for a list of attributes
 * Uses parallel queries for optimal performance
 */
export async function batchFetchAttributeRelations(
  attributeIds: string[],
  attributeList: (typeof attributes.$inferSelect)[],
  options: {
    includeShopInfo?: boolean;
    includeValues?: boolean;
  } = {},
): Promise<BatchedAttributeRelations> {
  if (attributeIds.length === 0) {
    return {
      productCountsMap: new Map(),
      valuesMap: new Map(),
      shopsMap: new Map(),
    };
  }

  // Collect unique shop IDs
  const shopIds = [...new Set(attributeList.map((a) => a.shopId))];

  // Build parallel queries
  const valueRecords =
    options.includeValues !== false
      ? await db
          .select()
          .from(attributeValues)
          .where(inArray(attributeValues.attributeId, attributeIds))
          .orderBy(asc(attributeValues.sortOrder))
      : [];

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

  // Build lookup maps
  const productCountsMap = new Map<string, number>();

  const valuesMap = new Map<string, AttributeValueItem[]>();
  for (const value of valueRecords) {
    const existing = valuesMap.get(value.attributeId) ?? [];
    existing.push({
      id: value.id,
      name: value.name,
      slug: value.slug,
      value: value.value,
      sortOrder: value.sortOrder ?? 0,
      createdAt: value.createdAt.toISOString(),
      updatedAt: value.updatedAt.toISOString(),
    });
    valuesMap.set(value.attributeId, existing);
  }

  const shopsMap = new Map<
    string,
    { id: string; name: string; slug: string }
  >();
  for (const shop of shopRecords) {
    shopsMap.set(shop.id, shop);
  }

  return {
    productCountsMap,
    valuesMap,
    shopsMap,
  };
}

/**
 * Transform a database attribute record into a normalized response object
 */
export function normalizeAttribute(
  attribute: typeof attributes.$inferSelect,
  relations: BatchedAttributeRelations,
  options: {
    includeShopInfo?: boolean;
  } = {},
): AttributeItem {
  // Get product count
  const productCount = relations.productCountsMap.get(attribute.id) ?? 0;

  // Get values
  const values = relations.valuesMap.get(attribute.id) ?? [];

  // Get shop info if requested
  let shopName: string | null = null;
  let shopSlug: string | null = null;

  if (options.includeShopInfo) {
    const shopInfo = relations.shopsMap.get(attribute.shopId);
    if (shopInfo) {
      shopName = shopInfo.name;
      shopSlug = shopInfo.slug;
    }
  }

  return {
    id: attribute.id,
    shopId: attribute.shopId,
    shopName,
    shopSlug,
    name: attribute.name,
    slug: attribute.slug,
    type: attribute.type as "select" | "color" | "image" | "label",
    values,
    sortOrder: attribute.sortOrder ?? 0,
    isActive: attribute.isActive ?? true,
    productCount,
    createdAt: attribute.createdAt.toISOString(),
    updatedAt: attribute.updatedAt.toISOString(),
  };
}

// ============================================================================
// Build Filter Conditions
// ============================================================================

/**
 * Build SQL WHERE conditions from filter parameters
 */
export function buildAttributeFilterConditions(
  options: Omit<
    AttributeQueryOptions,
    "limit" | "offset" | "sortBy" | "sortDirection"
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
        ilike(attributes.name, `%${options.search}%`),
        ilike(attributes.slug, `%${options.search}%`),
      ) as any,
    );
  }

  // Type filter
  if (options.type) {
    conditions.push(eq(attributes.type, options.type));
  }

  // Active filter
  if (options.isActive !== undefined) {
    conditions.push(eq(attributes.isActive, options.isActive));
  }

  return conditions;
}

// ============================================================================
// Execute Attribute Query
// ============================================================================

/**
 * Execute an attribute query with the given options
 * Handles filtering, pagination, sorting, and batch fetching relations
 */
export async function executeAttributeQuery(
  options: AttributeQueryOptions,
): Promise<AttributeQueryResult> {
  const limit = options.limit ?? 10;
  const offset = options.offset ?? 0;
  const sortDirection = options.sortDirection ?? "asc";

  // Build filter conditions
  const conditions = buildAttributeFilterConditions(options);
  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  // Build order by clause
  const orderFn = sortDirection === "desc" ? desc : asc;
  const orderByClause = (() => {
    switch (options.sortBy) {
      case "name":
        return orderFn(attributes.name);
      case "createdAt":
        return orderFn(attributes.createdAt);
      default:
        return orderFn(attributes.sortOrder);
    }
  })();

  // Parallel: Get count and paginated attributes
  const [countResult, attributeList] = await Promise.all([
    db.select({ count: count() }).from(attributes).where(whereClause),
    db
      .select()
      .from(attributes)
      .where(whereClause)
      .orderBy(orderByClause)
      .limit(limit)
      .offset(offset),
  ]);

  const total = countResult[0]?.count ?? 0;

  if (attributeList.length === 0) {
    return {
      data: [],
      total,
      limit,
      offset,
    };
  }

  // Batch fetch all relations
  const attributeIds = attributeList.map((a) => a.id);
  const relations = await batchFetchAttributeRelations(
    attributeIds,
    attributeList,
    {
      includeShopInfo: options.includeShopInfo,
      includeValues: options.includeValues !== false,
    },
  );

  // Normalize all attributes
  const normalizedAttributes = attributeList.map((attribute) =>
    normalizeAttribute(attribute, relations, {
      includeShopInfo: options.includeShopInfo,
    }),
  );

  return {
    data: normalizedAttributes,
    total,
    limit,
    offset,
  };
}

// ============================================================================
// Fetch Single Attribute with Relations
// ============================================================================

/**
 * Fetch a single attribute with all its relations
 */
export async function fetchAttributeWithRelations(
  attribute: typeof attributes.$inferSelect,
  options: {
    includeShopInfo?: boolean;
    includeValues?: boolean;
  } = {},
): Promise<AttributeItem> {
  const relations = await batchFetchAttributeRelations(
    [attribute.id],
    [attribute],
    {
      includeShopInfo: options.includeShopInfo,
      includeValues: options.includeValues ?? true,
    },
  );

  return normalizeAttribute(attribute, relations, options);
}
