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
  BatchedCategoryRelations,
  CategoryQueryOptions,
  CategoryQueryResult,
  NormalizedCategory,
} from "@/types/category-types";
import { db } from "../db";
import { categories } from "../db/schema/category-schema";
import { shops } from "../db/schema/shop-schema";

/**
 * Build SQL WHERE conditions from filter parameters
 */
export function buildCategoryFilterConditions(
  options: Omit<
    CategoryQueryOptions,
    "limit" | "offset" | "sortBy" | "sortDirection"
  >
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
        ilike(categories.name, `%${options.search}%`),
        ilike(categories.slug, `%${options.search}%`),
        ilike(categories.description, `%${options.search}%`)
      ) as any
    );
  }

  // Parent filter
  if (options.parentId !== undefined) {
    if (options.parentId === "" || options.parentId === "root") {
      // Root categories only (no parent)
      conditions.push(eq(categories.parentId, null as any));
    } else if (options.parentId) {
      conditions.push(eq(categories.parentId, options.parentId));
    }
  }

  // Active filter
  if (options.isActive !== undefined) {
    conditions.push(eq(categories.isActive, options.isActive));
  }

  // Featured filter
  if (options.featured !== undefined) {
    conditions.push(eq(categories.featured, options.featured));
  }

  return conditions;
}

export async function batchFetchCategoryRelations(
  categoryIds: string[],
  categoryList: (typeof categories.$inferSelect)[],
  options: {
    includeShopInfo?: boolean;
  } = {}
): Promise<BatchedCategoryRelations> {
  if (categoryIds.length === 0) {
    return {
      parentNamesMap: new Map(),
      productCountsMap: new Map(),
      shopsMap: new Map(),
    };
  }

  // Collect unique parent IDs and shop IDs
  const parentIds = [
    ...new Set(categoryList.map((c) => c.parentId).filter(Boolean)),
  ] as string[];
  const shopIds = [...new Set(categoryList.map((c) => c.shopId))];

  // Build parallel queries
  const queries: Promise<any>[] = [
    // 1. Fetch parent names
    parentIds.length > 0
      ? db
          .select({ id: categories.id, name: categories.name })
          .from(categories)
          .where(inArray(categories.id, parentIds))
      : Promise.resolve([]),

    // 2. Fetch product counts for all categories
    // db
    //   .select({
    //     categoryId: products.categoryId,
    //     count: count(),
    //   })
    //   .from(products)
    //   .where(inArray(products.categoryId, categoryIds))
    //   .groupBy(products.categoryId),
    Promise.resolve([]),
  ];

  // 3. Optionally fetch shop info
  if (options.includeShopInfo && shopIds.length > 0) {
    queries.push(
      db
        .select({
          id: shops.id,
          name: shops.name,
          slug: shops.slug,
        })
        .from(shops)
        .where(inArray(shops.id, shopIds))
    );
  } else {
    queries.push(Promise.resolve([]));
  }

  // Execute all queries in parallel
  const [parentRecords, productCountRecords, shopRecords] =
    await Promise.all(queries);

  // Build lookup maps
  const parentNamesMap = new Map<string, string>();
  for (const parent of parentRecords) {
    parentNamesMap.set(parent.id, parent.name);
  }

  const productCountsMap = new Map<string, number>();
  for (const pc of productCountRecords) {
    if (pc.categoryId) {
      productCountsMap.set(pc.categoryId, pc.count);
    }
  }

  const shopsMap = new Map<
    string,
    { id: string; name: string; slug: string }
  >();
  for (const shop of shopRecords) {
    shopsMap.set(shop.id, shop);
  }

  return {
    parentNamesMap,
    productCountsMap,
    shopsMap,
  };
}

export function normalizeCategory(
  category: typeof categories.$inferSelect,
  relations: BatchedCategoryRelations,
  options: {
    includeShopInfo?: boolean;
  } = {}
): NormalizedCategory {
  // Get parent name
  const parentName = category.parentId
    ? (relations.parentNamesMap.get(category.parentId) ?? null)
    : null;

  // Get product count
  const productCount = relations.productCountsMap.get(category.id) ?? 0;

  // Get shop info if requested
  let shopName: string | null = null;
  let shopSlug: string | null = null;

  if (options.includeShopInfo) {
    const shopInfo = relations.shopsMap.get(category.shopId);
    if (shopInfo) {
      shopName = shopInfo.name;
      shopSlug = shopInfo.slug;
    }
  }

  return {
    id: category.id,
    shopId: category.shopId,
    shopName,
    shopSlug,
    name: category.name,
    slug: category.slug,
    description: category.description,
    image: category.image,
    icon: category.icon,
    parentId: category.parentId,
    parentName,
    level: category.level ?? 0,
    sortOrder: category.sortOrder ?? 0,
    isActive: category.isActive ?? true,
    featured: category.featured ?? false,
    productCount,
    createdAt: category.createdAt.toISOString(),
    updatedAt: category.updatedAt.toISOString(),
  };
}

export async function executeCategoryQuery(
  options: CategoryQueryOptions
): Promise<CategoryQueryResult> {
  const limit = options.limit ?? 10;
  const offset = options.offset ?? 0;
  const sortDirection = options.sortDirection ?? "asc";

  // Build filter conditions
  const conditions = buildCategoryFilterConditions(options);
  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  // Build order by clause
  const orderFn = sortDirection === "desc" ? desc : asc;
  const orderByClause = (() => {
    switch (options.sortBy) {
      case "name":
        return orderFn(categories.name);
      case "createdAt":
        return orderFn(categories.createdAt);
      case "productCount":
        return orderFn(categories.productCount);
      default:
        return orderFn(categories.sortOrder);
    }
  })();

  // Parallel: Get count and paginated categories
  const [countResult, categoryList] = await Promise.all([
    db.select({ count: count() }).from(categories).where(whereClause),
    db
      .select()
      .from(categories)
      .where(whereClause)
      .orderBy(orderByClause)
      .limit(limit)
      .offset(offset),
  ]);

  const total = countResult[0]?.count ?? 0;

  if (categoryList.length === 0) {
    return {
      data: [],
      total,
      limit,
      offset,
    };
  }

  // Batch fetch all relations
  const categoryIds = categoryList.map((c) => c.id);
  const relations = await batchFetchCategoryRelations(
    categoryIds,
    categoryList,
    {
      includeShopInfo: options.includeShopInfo,
    }
  );

  // Normalize all categories
  const normalizedCategories = categoryList.map((category) =>
    normalizeCategory(category, relations, {
      includeShopInfo: options.includeShopInfo,
    })
  );

  return {
    data: normalizedCategories,
    total,
    limit,
    offset,
  };
}

export async function fetchCategoryWithRelations(
  category: typeof categories.$inferSelect,
  options: {
    includeShopInfo?: boolean;
  } = {}
): Promise<NormalizedCategory> {
  const relations = await batchFetchCategoryRelations(
    [category.id],
    [category],
    {
      includeShopInfo: options.includeShopInfo,
    }
  );

  return normalizeCategory(category, relations, options);
}
