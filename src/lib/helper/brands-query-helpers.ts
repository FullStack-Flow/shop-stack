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
  BatchedBrandRelations,
  BrandItem,
  BrandQueryOptions,
  BrandQueryResult,
} from "@/types/brands";
import { db } from "../db";
import { brands } from "../db/schema/brand-schema";
import { shops } from "../db/schema/shop-schema";

/**
 * Batch fetch all related data for a list of brands
 * Uses parallel queries for optimal performance
 */
export async function batchFetchBrandRelations(
  brandIds: string[],
  brandList: (typeof brands.$inferSelect)[],
  options: {
    includeShopInfo?: boolean;
  } = {}
): Promise<BatchedBrandRelations> {
  if (brandIds.length === 0) {
    return {
      productCountsMap: new Map(),
      shopsMap: new Map(),
    };
  }

  const shopIds = [...new Set(brandList.map((b) => b.shopId))];

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

  const productCountsMap = new Map<string, number>();

  const shopsMap = new Map<
    string,
    { id: string; name: string; slug: string }
  >();
  for (const shop of shopRecords) {
    shopsMap.set(shop.id, shop);
  }

  return {
    productCountsMap,
    shopsMap,
  };
}

/**
 * Transform a database brand record into a normalized response object
 */
export function normalizeBrand(
  brand: typeof brands.$inferSelect,
  relations: BatchedBrandRelations,
  options: {
    includeShopInfo?: boolean;
  } = {}
): BrandItem {
  const productCount = relations.productCountsMap.get(brand.id) ?? 0;

  let shopName: string | null = null;
  let shopSlug: string | null = null;

  if (options.includeShopInfo) {
    const shopInfo = relations.shopsMap.get(brand.shopId);
    if (shopInfo) {
      shopName = shopInfo.name;
      shopSlug = shopInfo.slug;
    }
  }

  return {
    id: brand.id,
    shopId: brand.shopId,
    shopName,
    shopSlug,
    name: brand.name,
    slug: brand.slug,
    description: brand.description,
    logo: brand.logo,
    website: brand.website,
    sortOrder: brand.sortOrder ?? 0,
    isActive: brand.isActive ?? true,
    productCount,
    createdAt: brand.createdAt.toISOString(),
    updatedAt: brand.updatedAt.toISOString(),
  };
}

/**
 * Build SQL WHERE conditions from filter parameters
 */
export function buildBrandFilterConditions(
  options: Omit<
    BrandQueryOptions,
    "limit" | "offset" | "sortBy" | "sortDirection"
  >
): SQL[] {
  const conditions: SQL[] = [];

  if (options.baseConditions) {
    conditions.push(...options.baseConditions);
  }

  if (options.search) {
    const searchTerm = `%${options.search}%`;
    conditions.push(
      or(
        ilike(brands.name, searchTerm),
        ilike(brands.slug, searchTerm),
        ilike(brands.description, searchTerm)
      ) as any
    );
  }

  if (options.isActive !== undefined) {
    conditions.push(eq(brands.isActive, options.isActive));
  }

  return conditions;
}

export async function executeBrandQuery(
  options: BrandQueryOptions
): Promise<BrandQueryResult> {
  const limit = options.limit ?? 10;
  const offset = options.offset ?? 0;
  const sortDirection = options.sortDirection ?? "asc";

  // Build filter conditions
  const conditions = buildBrandFilterConditions(options);
  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  // Build order by clause
  const orderFn = sortDirection === "desc" ? desc : asc;
  const orderByClause = (() => {
    switch (options.sortBy) {
      case "name":
        return orderFn(brands.name);
      case "createdAt":
        return orderFn(brands.createdAt);
      case "productCount":
        return orderFn(brands.productCount);
      default:
        return orderFn(brands.sortOrder);
    }
  })();

  // Parallel: Get count and paginated brands
  const [countResult, brandList] = await Promise.all([
    db.select({ count: count() }).from(brands).where(whereClause),
    db
      .select()
      .from(brands)
      .where(whereClause)
      .orderBy(orderByClause)
      .limit(limit)
      .offset(offset),
  ]);

  const total = countResult[0]?.count ?? 0;

  if (brandList.length === 0) {
    return {
      data: [],
      total,
      limit,
      offset,
    };
  }

  // Batch fetch all relations
  const brandIds = brandList.map((b) => b.id);
  const relations = await batchFetchBrandRelations(brandIds, brandList, {
    includeShopInfo: options.includeShopInfo,
  });

  // Normalize all brands
  const normalizedBrands = brandList.map((brand) =>
    normalizeBrand(brand, relations, {
      includeShopInfo: options.includeShopInfo,
    })
  );

  return {
    data: normalizedBrands,
    total,
    limit,
    offset,
  };
}

/**
 * Fetch a single brand with all its relations
 */
export async function fetchBrandWithRelations(
  brand: typeof brands.$inferSelect,
  options: {
    includeShopInfo?: boolean;
  } = {}
): Promise<BrandItem> {
  const relations = await batchFetchBrandRelations([brand.id], [brand], {
    includeShopInfo: options.includeShopInfo,
  });

  return normalizeBrand(brand, relations, options);
}
