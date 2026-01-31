import {
  and,
  asc,
  count,
  desc,
  eq,
  gte,
  ilike,
  inArray,
  lte,
  or,
  type SQL,
} from "drizzle-orm";
import { db } from "@/lib/db";
import type {
  BatchedCouponRelations,
  CouponListResponse,
  CouponQueryOptions,
  NormalizedCoupon,
} from "@/types/coupons";
import { categories } from "../db/schema/category-schema";
import {
  type Coupon,
  couponCategories,
  couponProducts,
  coupons,
} from "../db/schema/coupon-schema";
import { products } from "../db/schema/products-schema";
import { shops, vendors } from "../db/schema/shop-schema";

// ============================================================================
// Execute Coupon Query
// ============================================================================

export function buildCouponFilterConditions(
  options: Omit<
    CouponQueryOptions,
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
        ilike(coupons.code, `%${options.search}%`),
        ilike(coupons.description, `%${options.search}%`),
      ) as any,
    );
  }

  // Type filter
  if (options.type) {
    conditions.push(eq(coupons.type, options.type));
  }

  // Status filter (DB column)
  if (options.status) {
    conditions.push(eq(coupons.status, options.status));
  }

  // Applicability filter
  if (options.applicableTo) {
    conditions.push(eq(coupons.applicableTo, options.applicableTo));
  }

  // Active filter
  if (options.isActive !== undefined) {
    conditions.push(eq(coupons.isActive, options.isActive));
  }

  // Date filters
  if (options.activeFrom) {
    conditions.push(gte(coupons.activeFrom, options.activeFrom));
  }

  if (options.activeTo) {
    conditions.push(lte(coupons.activeTo, options.activeTo));
  }

  // Derived status filters
  const now = new Date();

  if (options.isExpired) {
    conditions.push(lte(coupons.activeTo, now));
  }

  if (options.isScheduled) {
    conditions.push(gte(coupons.activeFrom, now));
  }

  return conditions;
}

export async function batchFetchCouponRelations(
  couponIds: string[],
  couponList: (typeof coupons.$inferSelect)[],
  options: {
    includeShopInfo?: boolean;
    includeVendorInfo?: boolean;
    includeLinkedItems?: boolean;
  } = {},
): Promise<BatchedCouponRelations> {
  if (couponIds.length === 0) {
    return {
      productsMap: new Map(),
      categoriesMap: new Map(),
      shopsMap: new Map(),
      vendorsMap: new Map(),
    };
  }

  const shopIds = [...new Set(couponList.map((c) => c.shopId))];

  // Build parallel queries
  const queries: Promise<any>[] = [];

  // 1. Fetch linked products and categories if requested
  if (options.includeLinkedItems) {
    // Linked Products
    queries.push(
      db
        .select({
          couponId: couponProducts.couponId,
          productId: couponProducts.productId,
          productName: products.name,
        })
        .from(couponProducts)
        .innerJoin(products, eq(couponProducts.productId, products.id))
        .where(inArray(couponProducts.couponId, couponIds)),
    );

    // Linked Categories
    queries.push(
      db
        .select({
          couponId: couponCategories.couponId,
          categoryId: couponCategories.categoryId,
          categoryName: categories.name,
        })
        .from(couponCategories)
        .innerJoin(categories, eq(couponCategories.categoryId, categories.id))
        .where(inArray(couponCategories.couponId, couponIds)),
    );
  } else {
    queries.push(Promise.resolve([]));
    queries.push(Promise.resolve([]));
  }

  // 3. Optionally fetch shop info
  if (options.includeShopInfo && shopIds.length > 0) {
    queries.push(
      db
        .select({
          id: shops.id,
          name: shops.name,
          slug: shops.slug,
          vendorId: shops.vendorId,
        })
        .from(shops)
        .where(inArray(shops.id, shopIds)),
    );
  } else {
    queries.push(Promise.resolve([]));
  }

  // Execute queries
  const [linkedProducts, linkedCategories, shopRecords] =
    await Promise.all(queries);

  // 4. Optionally fetch vendor info
  let vendorRecords: Array<{ id: string; businessName: string | null }> = [];
  if (options.includeVendorInfo && shopRecords.length > 0) {
    const vendorIds = [
      ...new Set(shopRecords.map((s: any) => s.vendorId).filter(Boolean)),
    ] as string[];
    if (vendorIds.length > 0) {
      vendorRecords = await db
        .select({ id: vendors.id, businessName: vendors.businessName })
        .from(vendors)
        .where(inArray(vendors.id, vendorIds));
    }
  }

  // Build lookup maps
  const productsMap = new Map<
    string,
    { productId: string; productName: string }[]
  >();
  for (const lp of linkedProducts) {
    const existing = productsMap.get(lp.couponId) || [];
    existing.push({ productId: lp.productId, productName: lp.productName });
    productsMap.set(lp.couponId, existing);
  }

  const categoriesMap = new Map<
    string,
    { categoryId: string; categoryName: string }[]
  >();
  for (const lc of linkedCategories) {
    const existing = categoriesMap.get(lc.couponId) || [];
    existing.push({ categoryId: lc.categoryId, categoryName: lc.categoryName });
    categoriesMap.set(lc.couponId, existing);
  }

  const shopsMap = new Map<
    string,
    { id: string; name: string; slug: string; vendorId?: string }
  >();
  for (const shop of shopRecords) {
    shopsMap.set(shop.id, shop);
  }

  const vendorsMap = new Map<
    string,
    { id: string; businessName: string | null }
  >();
  for (const vendor of vendorRecords) {
    vendorsMap.set(vendor.id, vendor);
  }

  return {
    productsMap,
    categoriesMap,
    shopsMap,
    vendorsMap,
  };
}

export function normalizeCoupon(
  coupon: typeof coupons.$inferSelect,
  relations: BatchedCouponRelations,
  options: {
    includeShopInfo?: boolean;
    includeVendorInfo?: boolean;
  } = {},
): NormalizedCoupon {
  // Get linked items
  const linkedProducts = relations.productsMap.get(coupon.id) || [];
  const linkedCategories = relations.categoriesMap.get(coupon.id) || [];

  // Get shop and vendor info
  let shopName: string | null = null;
  let shopSlug: string | null = null;
  let vendorId: string | null = null;
  let vendorName: string | null = null;

  if (options.includeShopInfo) {
    const shopInfo = relations.shopsMap.get(coupon.shopId);
    if (shopInfo) {
      shopName = shopInfo.name;
      shopSlug = shopInfo.slug;
      vendorId = shopInfo.vendorId || null;

      if (options.includeVendorInfo && vendorId) {
        const vendorInfo = relations.vendorsMap.get(vendorId);
        vendorName = vendorInfo?.businessName || null;
      }
    }
  }

  return {
    id: coupon.id,
    shopId: coupon.shopId,
    shopName,
    shopSlug,
    vendorId,
    vendorName,
    code: coupon.code,
    description: coupon.description,
    image: coupon.image,
    type: coupon.type,
    discountAmount: coupon.discountAmount,
    minimumCartAmount: coupon.minimumCartAmount,
    maximumDiscountAmount: coupon.maximumDiscountAmount,
    activeFrom: coupon.activeFrom.toISOString(),
    activeTo: coupon.activeTo.toISOString(),
    usageLimit: coupon.usageLimit,
    usageLimitPerUser: coupon.usageLimitPerUser ?? 1,
    usageCount: coupon.usageCount,
    isActive: coupon.isActive ?? true,
    status: coupon.status,
    applicableTo: coupon.applicableTo,
    productIds: linkedProducts.map((p) => p.productId),
    categoryIds: linkedCategories.map((c) => c.categoryId),
    createdAt: coupon.createdAt.toISOString(),
    updatedAt: coupon.updatedAt.toISOString(),
  };
}

export async function executeCouponQuery(
  options: CouponQueryOptions,
): Promise<CouponListResponse> {
  const limit = options.limit ?? 10;
  const offset = options.offset ?? 0;
  const sortDirection = options.sortDirection ?? "desc";

  // Build filter conditions
  const conditions = buildCouponFilterConditions(options);
  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  // Build order by clause
  const orderFn = sortDirection === "desc" ? desc : asc;
  const orderByClause = (() => {
    switch (options.sortBy) {
      case "code":
        return orderFn(coupons.code);
      case "discountAmount":
        return orderFn(coupons.discountAmount);
      case "usageCount":
        return orderFn(coupons.usageCount);
      case "activeFrom":
        return orderFn(coupons.activeFrom);
      case "activeTo":
        return orderFn(coupons.activeTo);
      default:
        return orderFn(coupons.createdAt);
    }
  })();

  // Parallel: Get count and paginated coupons
  const [countResult, couponList] = await Promise.all([
    db.select({ count: count() }).from(coupons).where(whereClause),
    db
      .select()
      .from(coupons)
      .where(whereClause)
      .orderBy(orderByClause)
      .limit(limit)
      .offset(offset),
  ]);

  const total = countResult[0]?.count ?? 0;

  // Batch fetch all relations
  const couponIds = couponList.map((c) => c.id);
  const relations = await batchFetchCouponRelations(couponIds, couponList, {
    includeShopInfo: options.includeShopInfo,
    includeVendorInfo: options.includeVendorInfo,
    includeLinkedItems: true, // Always include linked items for list view if needed, or make it optional
  });

  // Normalize all coupons
  const normalizedCoupons = couponList.map((coupon) =>
    normalizeCoupon(coupon, relations, {
      includeShopInfo: options.includeShopInfo,
      includeVendorInfo: options.includeVendorInfo,
    }),
  );

  return {
    data: normalizedCoupons,
    total,
    limit,
    offset,
  };
}

export async function fetchCouponWithRelations(
  coupon: Coupon,
  options: {
    includeShopInfo?: boolean;
    includeVendorInfo?: boolean;
    includeLinkedItems?: boolean;
  } = {},
): Promise<NormalizedCoupon> {
  const relations = await batchFetchCouponRelations([coupon.id], [coupon], {
    includeShopInfo: options.includeShopInfo,
    includeVendorInfo: options.includeVendorInfo,
    includeLinkedItems: options.includeLinkedItems ?? true,
  });

  return normalizeCoupon(coupon, relations, options);
}
