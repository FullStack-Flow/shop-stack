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
  BatchedProductRelations,
  ListProductsResponse,
  NormalizedProduct,
  ProductQueryOptions,
} from "@/types/products";
import { attributes, attributeValues } from "../db/schema/attribute-schema";
import { brands } from "../db/schema/brand-schema";
import { categories } from "../db/schema/category-schema";
import {
  type Product,
  productAttributes,
  productImages,
  products,
  productTags,
} from "../db/schema/products-schema";
import { shops, vendors } from "../db/schema/shop-schema";
import { tags } from "../db/schema/tags-schema";
import { taxRates } from "../db/schema/tax-schema";
// ============================================================================
// Execute Product Query
// ============================================================================
export function buildProductFilterConditions(
  options: Omit<
    ProductQueryOptions,
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
        ilike(products.name, `%${options.search}%`),
        ilike(products.slug, `%${options.search}%`),
        ilike(products.sku, `%${options.search}%`),
        ilike(products.description, `%${options.search}%`),
      ) as any,
    );
  }

  // Status filter
  if (options.status) {
    conditions.push(eq(products.status, options.status));
  }

  // Product type filter
  if (options.productType) {
    conditions.push(eq(products.productType, options.productType));
  }

  // Category filter
  if (options.categoryId) {
    conditions.push(eq(products.categoryId, options.categoryId));
  }

  // Brand filter
  if (options.brandId) {
    conditions.push(eq(products.brandId, options.brandId));
  }

  // Featured filter
  if (options.isFeatured !== undefined) {
    conditions.push(eq(products.isFeatured, options.isFeatured));
  }

  // Active filter
  if (options.isActive !== undefined) {
    conditions.push(eq(products.isActive, options.isActive));
  }

  // Stock filters
  if (options.inStock) {
    conditions.push(gte(products.stock, 1));
  }

  if (options.lowStock) {
    conditions.push(lte(products.stock, products.lowStockThreshold));
  }

  // Price filters
  if (options.minPrice !== undefined) {
    conditions.push(gte(products.sellingPrice, String(options.minPrice)));
  }

  if (options.maxPrice !== undefined) {
    conditions.push(lte(products.sellingPrice, String(options.maxPrice)));
  }

  return conditions;
}

export async function batchFetchProductRelations(
  productIds: string[],
  productList: (typeof products.$inferSelect)[],
  options: {
    includeShopInfo?: boolean;
    includeVendorInfo?: boolean;
  } = {},
): Promise<BatchedProductRelations> {
  if (productIds.length === 0) {
    return {
      imagesMap: new Map(),
      tagsMap: new Map(),
      attributesMap: new Map(),
      attributeValuesMap: new Map(),
      categoriesMap: new Map(),
      brandsMap: new Map(),
      taxRatesMap: new Map(),
      shopsMap: new Map(),
      vendorsMap: new Map(),
    };
  }

  // Collect unique IDs
  const categoryIds = [
    ...new Set(productList.map((p) => p.categoryId).filter(Boolean)),
  ] as string[];
  const brandIds = [
    ...new Set(productList.map((p) => p.brandId).filter(Boolean)),
  ] as string[];
  const taxIds = [
    ...new Set(productList.map((p) => p.taxId).filter(Boolean)),
  ] as string[];
  const shopIds = [...new Set(productList.map((p) => p.shopId))];

  // Build parallel queries
  const queries: Promise<any>[] = [
    // 1. Fetch all images
    db
      .select()
      .from(productImages)
      .where(inArray(productImages.productId, productIds))
      .orderBy(asc(productImages.sortOrder)),

    // 2. Fetch all product-tag associations with tag names
    db
      .select({
        productId: productTags.productId,
        tagId: productTags.tagId,
        tagName: tags.name,
      })
      .from(productTags)
      .innerJoin(tags, eq(productTags.tagId, tags.id))
      .where(inArray(productTags.productId, productIds)),

    // 3. Fetch all product-attribute associations with attribute names
    db
      .select({
        productId: productAttributes.productId,
        attributeId: productAttributes.attributeId,
        attributeName: attributes.name,
        value: productAttributes.value,
      })
      .from(productAttributes)
      .innerJoin(attributes, eq(productAttributes.attributeId, attributes.id))
      .where(inArray(productAttributes.productId, productIds)),

    // 4. Fetch category names
    categoryIds.length > 0
      ? db
          .select({ id: categories.id, name: categories.name })
          .from(categories)
          .where(inArray(categories.id, categoryIds))
      : Promise.resolve([]),

    // 5. Fetch brand names
    brandIds.length > 0
      ? db
          .select({ id: brands.id, name: brands.name })
          .from(brands)
          .where(inArray(brands.id, brandIds))
      : Promise.resolve([]),

    // 6. Fetch tax names
    taxIds.length > 0
      ? db
          .select({ id: taxRates.id, name: taxRates.name })
          .from(taxRates)
          .where(inArray(taxRates.id, taxIds))
      : Promise.resolve([]),
  ];

  // 7. Optionally fetch shop info
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

  // Execute all queries in parallel
  const [
    allImages,
    allProductTags,
    allProductAttrs,
    categoryRecords,
    brandRecords,
    taxRecords,
    shopRecords,
  ] = await Promise.all(queries);

  // 8. Optionally fetch vendor info (needs shop vendorIds first)
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

  // 9. Fetch attribute values for all attributes we found
  let allAttributeValues: Array<{ id: string; name: string; value: string }> =
    [];
  const attributeIds = [
    ...new Set(allProductAttrs.map((pa: any) => pa.attributeId)),
  ] as string[];
  if (attributeIds.length > 0) {
    allAttributeValues = await db
      .select({
        id: attributeValues.id,
        name: attributeValues.name,
        value: attributeValues.value,
      })
      .from(attributeValues)
      .where(inArray(attributeValues.attributeId, attributeIds));
  }

  // Build lookup maps
  const imagesMap = new Map<string, (typeof productImages.$inferSelect)[]>();
  for (const img of allImages) {
    const existing = imagesMap.get(img.productId) || [];
    existing.push(img);
    imagesMap.set(img.productId, existing);
  }

  const tagsMap = new Map<string, { tagId: string; tagName: string }[]>();
  for (const pt of allProductTags) {
    const existing = tagsMap.get(pt.productId) || [];
    existing.push({ tagId: pt.tagId, tagName: pt.tagName });
    tagsMap.set(pt.productId, existing);
  }

  const attributesMap = new Map<
    string,
    { attributeId: string; attributeName: string; value: string | null }[]
  >();
  for (const pa of allProductAttrs) {
    const existing = attributesMap.get(pa.productId) || [];
    existing.push({
      attributeId: pa.attributeId,
      attributeName: pa.attributeName,
      value: pa.value,
    });
    attributesMap.set(pa.productId, existing);
  }

  // Build attribute values map (valueId → { name, value })
  const attributeValuesMap = new Map<string, { name: string; value: string }>();
  for (const av of allAttributeValues) {
    attributeValuesMap.set(av.id, { name: av.name, value: av.value });
  }

  const categoriesMap = new Map<string, string>();
  for (const cat of categoryRecords) {
    categoriesMap.set(cat.id, cat.name);
  }

  const brandsMap = new Map<string, string>();
  for (const brand of brandRecords) {
    brandsMap.set(brand.id, brand.name);
  }

  const taxRatesMap = new Map<string, string>();
  for (const tax of taxRecords) {
    taxRatesMap.set(tax.id, tax.name);
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
    imagesMap,
    tagsMap,
    attributesMap,
    attributeValuesMap,
    categoriesMap,
    brandsMap,
    taxRatesMap,
    shopsMap,
    vendorsMap,
  };
}

export function normalizeProduct(
  product: typeof products.$inferSelect,
  relations: BatchedProductRelations,
  options: {
    includeShopInfo?: boolean;
    includeVendorInfo?: boolean;
    excludeCostPrice?: boolean;
  } = {},
): NormalizedProduct {
  const imagesList = relations.imagesMap.get(product.id) || [];
  const tagsList = relations.tagsMap.get(product.id) || [];
  const attrsList = relations.attributesMap.get(product.id) || [];

  // Get category and brand names
  const categoryName = product.categoryId
    ? (relations.categoriesMap.get(product.categoryId) ?? null)
    : null;
  const brandName = product.brandId
    ? (relations.brandsMap.get(product.brandId) ?? null)
    : null;
  const taxName = product.taxId
    ? (relations.taxRatesMap.get(product.taxId) ?? null)
    : null;

  // Get shop and vendor info if requested
  let shopName: string | null = null;
  let shopSlug: string | null = null;
  let vendorId: string | null = null;
  let vendorName: string | null = null;

  if (options.includeShopInfo) {
    const shopInfo = relations.shopsMap.get(product.shopId);
    if (shopInfo) {
      shopName = shopInfo.name;
      shopSlug = shopInfo.slug;
      vendorId = (shopInfo as any).vendorId || null;

      if (options.includeVendorInfo && vendorId) {
        const vendorInfo = relations.vendorsMap.get(vendorId);
        vendorName = vendorInfo?.businessName || null;
      }
    }
  }

  // Build attributeValues map
  const attributeValues: Record<string, string[]> = {};
  for (const pa of attrsList) {
    if (pa.value) {
      try {
        attributeValues[pa.attributeId] = JSON.parse(pa.value);
      } catch {
        attributeValues[pa.attributeId] = [pa.value];
      }
    } else {
      attributeValues[pa.attributeId] = [];
    }
  }

  // Parse variationPrices
  let variationPrices: Record<
    string,
    { regularPrice?: string; sellingPrice?: string; image?: string }
  > = {};
  if (product.variationPrices) {
    try {
      variationPrices = JSON.parse(product.variationPrices);
    } catch {
      variationPrices = {};
    }
  }

  // Build attributeValueNames map from attributeValuesMap
  // This maps valueId → valueName for UI display
  const attributeValueNames: Record<string, string> = {};

  // Collect all value IDs from attributeValues
  for (const valueIds of Object.values(attributeValues)) {
    for (const valueId of valueIds) {
      const valueInfo = relations.attributeValuesMap.get(valueId);
      if (valueInfo) {
        attributeValueNames[valueId] = valueInfo.name;
      }
    }
  }

  // Also collect from variationPrices keys
  for (const valueId of Object.keys(variationPrices)) {
    if (!attributeValueNames[valueId]) {
      const valueInfo = relations.attributeValuesMap.get(valueId);
      if (valueInfo) {
        attributeValueNames[valueId] = valueInfo.name;
      }
    }
  }

  return {
    id: product.id,
    shopId: product.shopId,
    shopName,
    shopSlug,
    vendorId,
    vendorName,
    name: product.name,
    slug: product.slug,
    sku: product.sku,
    description: product.description,
    shortDescription: product.shortDescription,
    sellingPrice: product.sellingPrice,
    regularPrice: product.regularPrice,
    costPrice: options.excludeCostPrice ? null : product.costPrice,
    stock: product.stock ?? 0,
    lowStockThreshold: product.lowStockThreshold ?? 5,
    trackInventory: product.trackInventory ?? true,
    categoryId: product.categoryId,
    categoryName,
    brandId: product.brandId,
    brandName,
    taxId: product.taxId,
    taxName,
    status: product.status,
    productType: product.productType,
    isFeatured: product.isFeatured ?? false,
    isActive: product.isActive ?? true,
    averageRating: product.averageRating?.toString() || "0",
    reviewCount: product.reviewCount ?? 0,
    metaTitle: product.metaTitle,
    metaDescription: product.metaDescription,
    images: imagesList.map((img) => ({
      id: img.id,
      productId: img.productId,
      url: img.url,
      alt: img.alt,
      sortOrder: img.sortOrder ?? 0,
      isPrimary: img.isPrimary ?? false,
      createdAt: img.createdAt,
    })),
    thumbnailImage:
      imagesList.find((img) => img.isPrimary)?.url ||
      imagesList[0]?.url ||
      null,
    galleryImages: imagesList
      .filter((img) => !img.isPrimary)
      .map((img) => img.url),
    tagIds: tagsList.map((t) => t.tagId),
    tagNames: tagsList.map((t) => t.tagName),
    attributeIds: attrsList.map((a) => a.attributeId),
    attributeNames: attrsList.map((a) => a.attributeName),
    attributeValues,
    attributeValueNames,
    variationPrices,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
  };
}

export async function executeProductQuery(
  options: ProductQueryOptions,
): Promise<ListProductsResponse> {
  const limit = options.limit ?? 10;
  const offset = options.offset ?? 0;
  const sortDirection = options.sortDirection ?? "desc";

  // Build filter conditions
  const conditions = buildProductFilterConditions(options);
  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  // Build order by clause
  const orderFn = sortDirection === "desc" ? desc : asc;
  const orderByClause = (() => {
    switch (options.sortBy) {
      case "name":
        return orderFn(products.name);
      case "sellingPrice":
        return orderFn(products.sellingPrice);
      case "stock":
        return orderFn(products.stock);
      case "averageRating":
        return orderFn(products.averageRating);
      case "reviewCount":
        return orderFn(products.reviewCount);
      case "updatedAt":
        return orderFn(products.updatedAt);
      default:
        return orderFn(products.createdAt);
    }
  })();

  // Parallel: Get count and paginated products
  const [countResult, productList] = await Promise.all([
    db.select({ count: count() }).from(products).where(whereClause),
    db
      .select()
      .from(products)
      .where(whereClause)
      .orderBy(orderByClause)
      .limit(limit)
      .offset(offset),
  ]);

  const total = countResult[0]?.count ?? 0;

  // Apply tag/attribute filters if needed (post-filter)
  let filteredProducts = productList;

  if (options.tagId || options.attributeId) {
    const [tagAssociations, attrAssociations] = await Promise.all([
      options.tagId
        ? db
            .select({ productId: productTags.productId })
            .from(productTags)
            .where(eq(productTags.tagId, options.tagId))
        : Promise.resolve(null),
      options.attributeId
        ? db
            .select({ productId: productAttributes.productId })
            .from(productAttributes)
            .where(eq(productAttributes.attributeId, options.attributeId))
        : Promise.resolve(null),
    ]);

    if (tagAssociations) {
      const tagProductIds = new Set(tagAssociations.map((p) => p.productId));
      filteredProducts = filteredProducts.filter((p) =>
        tagProductIds.has(p.id),
      );
    }

    if (attrAssociations) {
      const attrProductIds = new Set(attrAssociations.map((p) => p.productId));
      filteredProducts = filteredProducts.filter((p) =>
        attrProductIds.has(p.id),
      );
    }
  }

  // Batch fetch all relations
  const productIds = filteredProducts.map((p) => p.id);
  const relations = await batchFetchProductRelations(
    productIds,
    filteredProducts,
    {
      includeShopInfo: options.includeShopInfo,
      includeVendorInfo: options.includeVendorInfo,
    },
  );

  // Normalize all products
  const normalizedProducts = filteredProducts.map((product) =>
    normalizeProduct(product, relations, {
      includeShopInfo: options.includeShopInfo,
      includeVendorInfo: options.includeVendorInfo,
      excludeCostPrice: options.excludeCostPrice,
    }),
  );

  return {
    data: normalizedProducts,
    total,
    limit,
    offset,
  };
}

// ============================================================================
// Fetch Single Product with Relations
// ============================================================================

export async function fetchProductWithRelations(
  product: Product,
  options: {
    includeShopInfo?: boolean;
    includeVendorInfo?: boolean;
    excludeCostPrice?: boolean;
  } = {},
): Promise<NormalizedProduct> {
  const relations = await batchFetchProductRelations([product.id], [product], {
    includeShopInfo: options.includeShopInfo,
    includeVendorInfo: options.includeVendorInfo,
  });

  return normalizeProduct(product, relations, options);
}
