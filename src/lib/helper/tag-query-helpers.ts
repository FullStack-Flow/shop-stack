/**
 * Tag Query Helpers
 *
 * Shared utilities for tag queries across vendor, admin, and store contexts.
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
import { shops } from "@/lib/db/schema/shop-schema";
import { tags } from "@/lib/db/schema/tags-schema";
import type {
  BatchedTagRelations,
  TagItem,
  TagQueryOptions,
  TagQueryResult,
} from "@/types/tags";
import { db } from "../db";

/**
 * Batch fetch all related data for a list of tags
 * Uses parallel queries for optimal performance
 */
export async function batchFetchTagRelations(
  tagIds: string[],
  tagList: (typeof tags.$inferSelect)[],
  options: {
    includeShopInfo?: boolean;
  } = {},
): Promise<BatchedTagRelations> {
  if (tagIds.length === 0) {
    return {
      shopsMap: new Map(),
    };
  }

  // Collect unique shop IDs
  const shopIds = [...new Set(tagList.map((t) => t.shopId))];

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

  // Build lookup maps
  const shopsMap = new Map<
    string,
    { id: string; name: string; slug: string }
  >();
  for (const shop of shopRecords) {
    shopsMap.set(shop.id, shop);
  }

  return {
    shopsMap,
  };
}

/**
 * Transform a database tag record into a normalized response object
 */
export function normalizeTag(
  tag: typeof tags.$inferSelect,
  relations: BatchedTagRelations,
  options: {
    includeShopInfo?: boolean;
  } = {},
): TagItem {
  // Get shop info if requested
  let shopName: string | null = null;
  let shopSlug: string | null = null;

  if (options.includeShopInfo) {
    const shopInfo = relations.shopsMap.get(tag.shopId);
    if (shopInfo) {
      shopName = shopInfo.name;
      shopSlug = shopInfo.slug;
    }
  }

  return {
    id: tag.id,
    shopId: tag.shopId,
    shopName,
    shopSlug,
    name: tag.name,
    slug: tag.slug,
    description: tag.description,
    sortOrder: tag.sortOrder ?? 0,
    isActive: tag.isActive ?? true,
    productCount: tag.productCount ?? 0,
    createdAt: tag.createdAt.toISOString(),
    updatedAt: tag.updatedAt.toISOString(),
  };
}

// ============================================================================
// Build Filter Conditions
// ============================================================================

/**
 * Build SQL WHERE conditions from filter parameters
 */
export function buildTagFilterConditions(
  options: Omit<
    TagQueryOptions,
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
        ilike(tags.name, `%${options.search}%`),
        ilike(tags.slug, `%${options.search}%`),
        ilike(tags.description, `%${options.search}%`),
      ) as any,
    );
  }

  // Active filter
  if (options.isActive !== undefined) {
    conditions.push(eq(tags.isActive, options.isActive));
  }

  return conditions;
}

// ============================================================================
// Execute Tag Query
// ============================================================================

/**
 * Execute a tag query with the given options
 * Handles filtering, pagination, sorting, and batch fetching relations
 */
export async function executeTagQuery(
  options: TagQueryOptions,
): Promise<TagQueryResult> {
  const limit = options.limit ?? 10;
  const offset = options.offset ?? 0;
  const sortDirection = options.sortDirection ?? "asc";

  // Build filter conditions
  const conditions = buildTagFilterConditions(options);
  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  // Build order by clause
  const orderFn = sortDirection === "desc" ? desc : asc;
  const orderByClause = (() => {
    switch (options.sortBy) {
      case "name":
        return orderFn(tags.name);
      case "createdAt":
        return orderFn(tags.createdAt);
      case "productCount":
        return orderFn(tags.productCount);
      default:
        return orderFn(tags.sortOrder);
    }
  })();

  // Parallel: Get count and paginated tags
  const [countResult, tagList] = await Promise.all([
    db.select({ count: count() }).from(tags).where(whereClause),
    db
      .select()
      .from(tags)
      .where(whereClause)
      .orderBy(orderByClause)
      .limit(limit)
      .offset(offset),
  ]);

  const total = countResult[0]?.count ?? 0;

  if (tagList.length === 0) {
    return {
      data: [],
      total,
      limit,
      offset,
    };
  }

  // Batch fetch all relations
  const tagIds = tagList.map((t) => t.id);
  const relations = await batchFetchTagRelations(tagIds, tagList, {
    includeShopInfo: options.includeShopInfo,
  });

  // Normalize all tags
  const normalizedTags = tagList.map((tag) =>
    normalizeTag(tag, relations, {
      includeShopInfo: options.includeShopInfo,
    }),
  );

  return {
    data: normalizedTags,
    total,
    limit,
    offset,
  };
}

// ============================================================================
// Fetch Single Tag with Relations
// ============================================================================

/**
 * Fetch a single tag with all its relations
 */
export async function fetchTagWithRelations(
  tag: typeof tags.$inferSelect,
  options: {
    includeShopInfo?: boolean;
  } = {},
): Promise<TagItem> {
  const relations = await batchFetchTagRelations([tag.id], [tag], {
    includeShopInfo: options.includeShopInfo,
  });

  return normalizeTag(tag, relations, options);
}
