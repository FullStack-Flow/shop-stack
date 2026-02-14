import { createServerFn } from "@tanstack/react-start";
import { and, eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { db } from "@/lib/db";
import {
  productAttributes,
  productImages,
  productShippingMethods,
  products,
  productTags,
} from "@/lib/db/schema/products-schema";
import {
  executeProductQuery,
  fetchProductWithRelations,
} from "@/lib/helper/products-query-helpers";
import { requireShopAccess } from "@/lib/helper/vendor";
import { authMiddleware } from "@/lib/middleware/auth";
import { generateSlug } from "@/lib/utils/slug";
import {
  createProductSchema,
  deleteProductSchema,
  getProductByIdSchema,
  updateProductSchema,
  type VendorProductsQuery,
  vendorProductsQuerySchema,
} from "@/lib/validators/shared/product-query";
import { createSuccessResponse } from "@/types/api-response";
import type { ProductListResponse } from "@/types/products";

// ============================================================================
// Get Products (List with Pagination)
// ============================================================================
export const getProducts = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .inputValidator(vendorProductsQuerySchema)
  .handler(async ({ context, data }): Promise<ProductListResponse> => {
    const userId = context.session.user.id;
    const {
      shopId,
      limit,
      offset,
      search,
      status,
      productType,
      categoryId,
      brandId,
      tagId,
      attributeId,
      isFeatured,
      isActive,
      inStock,
      lowStock,
      minPrice,
      maxPrice,
      sortBy,
      sortDirection,
    } = data as VendorProductsQuery;

    // Verify shop access (vendor ownership or admin)
    await requireShopAccess(userId, shopId);

    // Use shared query helper
    return executeProductQuery({
      baseConditions: [eq(products.shopId, shopId)],
      search,
      status,
      productType,
      categoryId,
      brandId,
      tagId,
      attributeId,
      isFeatured,
      isActive,
      inStock,
      lowStock,
      minPrice,
      maxPrice,
      limit,
      offset,
      sortBy,
      sortDirection,
      // Vendor sees their own shop info
      includeShopInfo: false,
      includeVendorInfo: false,
      // Vendor can see cost price
      excludeCostPrice: false,
    });
  });

// ============================================================================
// Get Product by ID
// ============================================================================

export const getProductById = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .inputValidator(
    getProductByIdSchema
      .extend({
        shopId: getProductByIdSchema.shape.id, // Reuse the shape
      })
      .omit({ id: true })
      .extend({
        id: getProductByIdSchema.shape.id,
        shopId: getProductByIdSchema.shape.id,
      }),
  )
  .handler(async ({ context, data }) => {
    const userId = context.session.user.id;
    const { id, shopId } = data as { id: string; shopId: string };

    // Verify shop access (vendor ownership or admin)
    await requireShopAccess(userId, shopId);

    // Get product
    const [product] = await db
      .select()
      .from(products)
      .where(and(eq(products.id, id), eq(products.shopId, shopId)));

    if (!product) {
      throw new Error("Product not found.");
    }

    // Use shared helper for fetching with relations
    const normalizedProduct = await fetchProductWithRelations(product, {
      includeShopInfo: false,
      includeVendorInfo: false,
      excludeCostPrice: false,
    });

    return { product: normalizedProduct };
  });

// ============================================================================
// Create Product
// ============================================================================

export const createProduct = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator(createProductSchema)
  .handler(async ({ context, data }) => {
    const userId = context.session.user.id;
    const {
      shopId,
      images,
      tagIds,
      attributeIds,
      shippingMethodIds,
      attributeValues,
      variationPrices,
      ...productData
    } = data;

    // Verify shop access (vendor ownership or admin)
    await requireShopAccess(userId, shopId);

    // Generate slug if not provided
    let slug = productData.slug;
    if (!slug) {
      slug = generateSlug(productData.name);
    }

    // Check for duplicate slug within the shop
    const existingProduct = await db.query.products.findFirst({
      where: and(eq(products.shopId, shopId), eq(products.slug, slug)),
    });

    if (existingProduct) {
      throw new Error(
        "A product with this slug already exists in this shop. Please choose a different name or slug.",
      );
    }

    // Create the product
    const productId = uuidv4();

    await db.insert(products).values({
      id: productId,
      shopId: shopId,
      name: productData.name,
      slug: slug,
      sku: productData.sku || null,
      description: productData.description || null,
      shortDescription: productData.shortDescription || null,
      sellingPrice: productData.sellingPrice,
      regularPrice: productData.regularPrice || null,
      costPrice: productData.costPrice || null,
      stock: productData.stock ?? 0,
      lowStockThreshold: productData.lowStockThreshold ?? 5,
      trackInventory: productData.trackInventory ?? true,
      categoryId: productData.categoryId || null,
      brandId: productData.brandId || null,
      taxId: productData.taxId || null,
      status: productData.status || "draft",
      productType: productData.productType || "simple",
      isFeatured: productData.isFeatured ?? false,
      isActive: productData.isActive ?? true,
      metaTitle: productData.metaTitle || null,
      metaDescription: productData.metaDescription || null,
      variationPrices: variationPrices ? JSON.stringify(variationPrices) : null,
    });

    // Parallel: Create related records
    const insertPromises: Promise<any>[] = [];

    if (images && images.length > 0) {
      const imageRecords = images.map((img, index) => ({
        id: uuidv4(),
        productId: productId,
        url: img.url,
        alt: img.alt || null,
        sortOrder: img.sortOrder ?? index,
        isPrimary: img.isPrimary ?? index === 0,
      }));
      insertPromises.push(db.insert(productImages).values(imageRecords));
    }

    if (tagIds && tagIds.length > 0) {
      const tagRecords = tagIds.map((tagId) => ({
        productId: productId,
        tagId: tagId,
      }));
      insertPromises.push(db.insert(productTags).values(tagRecords));
    }

    if (attributeIds && attributeIds.length > 0) {
      const attrRecords = attributeIds.map((attrId) => ({
        productId: productId,
        attributeId: attrId,
        value: attributeValues?.[attrId]
          ? JSON.stringify(attributeValues[attrId])
          : null,
      }));
      insertPromises.push(db.insert(productAttributes).values(attrRecords));
    }

    if (shippingMethodIds && shippingMethodIds.length > 0) {
      const shippingRecords = shippingMethodIds.map((methodId) => ({
        productId: productId,
        shippingMethodId: methodId,
      }));
      insertPromises.push(
        db.insert(productShippingMethods).values(shippingRecords),
      );
    }

    await Promise.all(insertPromises);

    // Fetch the created product with relations
    const [newProduct] = await db
      .select()
      .from(products)
      .where(eq(products.id, productId));

    const normalizedProduct = await fetchProductWithRelations(newProduct, {
      excludeCostPrice: false,
    });

    return {
      ...createSuccessResponse("Product created successfully"),
      product: normalizedProduct,
    };
  });

// ============================================================================
// Update Product
// ============================================================================

export const updateProduct = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator(updateProductSchema)
  .handler(async ({ context, data }) => {
    const userId = context.session.user.id;
    const {
      id,
      shopId,
      images,
      tagIds,
      attributeIds,
      shippingMethodIds,
      attributeValues,
      variationPrices,
      ...updateData
    } = data;

    // Verify shop access (vendor ownership or admin)
    await requireShopAccess(userId, shopId);

    // Check if product exists
    const [existingProduct] = await db
      .select()
      .from(products)
      .where(and(eq(products.id, id), eq(products.shopId, shopId)));

    if (!existingProduct) {
      throw new Error("Product not found.");
    }

    // Check for duplicate slug if slug is being updated
    if (updateData.slug && updateData.slug !== existingProduct.slug) {
      const slugExists = await db.query.products.findFirst({
        where: and(
          eq(products.shopId, shopId),
          eq(products.slug, updateData.slug),
        ),
      });

      if (slugExists) {
        throw new Error(
          "A product with this slug already exists in this shop.",
        );
      }
    }

    // Build update object
    const updateValues: Record<string, any> = {};
    if (updateData.name !== undefined) updateValues.name = updateData.name;
    if (updateData.slug !== undefined) updateValues.slug = updateData.slug;
    if (updateData.sku !== undefined) updateValues.sku = updateData.sku;
    if (updateData.description !== undefined)
      updateValues.description = updateData.description;
    if (updateData.shortDescription !== undefined)
      updateValues.shortDescription = updateData.shortDescription;
    if (updateData.sellingPrice !== undefined)
      updateValues.sellingPrice = updateData.sellingPrice;
    if (updateData.regularPrice !== undefined)
      updateValues.regularPrice = updateData.regularPrice;
    if (updateData.costPrice !== undefined)
      updateValues.costPrice = updateData.costPrice;
    if (updateData.stock !== undefined) updateValues.stock = updateData.stock;
    if (updateData.lowStockThreshold !== undefined)
      updateValues.lowStockThreshold = updateData.lowStockThreshold;
    if (updateData.trackInventory !== undefined)
      updateValues.trackInventory = updateData.trackInventory;
    if (updateData.categoryId !== undefined)
      updateValues.categoryId = updateData.categoryId;
    if (updateData.brandId !== undefined)
      updateValues.brandId = updateData.brandId;
    if (updateData.taxId !== undefined) updateValues.taxId = updateData.taxId;
    if (updateData.status !== undefined)
      updateValues.status = updateData.status;
    if (updateData.productType !== undefined)
      updateValues.productType = updateData.productType;
    if (updateData.isFeatured !== undefined)
      updateValues.isFeatured = updateData.isFeatured;
    if (updateData.isActive !== undefined)
      updateValues.isActive = updateData.isActive;
    if (updateData.metaTitle !== undefined)
      updateValues.metaTitle = updateData.metaTitle;
    if (updateData.metaDescription !== undefined)
      updateValues.metaDescription = updateData.metaDescription;
    if (variationPrices !== undefined)
      updateValues.variationPrices = variationPrices
        ? JSON.stringify(variationPrices)
        : null;

    // Parallel: Update product and delete old relations
    const updatePromises: Promise<any>[] = [];

    if (Object.keys(updateValues).length > 0) {
      updatePromises.push(
        db.update(products).set(updateValues).where(eq(products.id, id)),
      );
    }

    if (images !== undefined) {
      updatePromises.push(
        db.delete(productImages).where(eq(productImages.productId, id)),
      );
    }

    if (tagIds !== undefined) {
      updatePromises.push(
        db.delete(productTags).where(eq(productTags.productId, id)),
      );
    }

    if (attributeIds !== undefined) {
      updatePromises.push(
        db.delete(productAttributes).where(eq(productAttributes.productId, id)),
      );
    }

    if (shippingMethodIds !== undefined) {
      updatePromises.push(
        db
          .delete(productShippingMethods)
          .where(eq(productShippingMethods.productId, id)),
      );
    }

    await Promise.all(updatePromises);

    // Parallel: Insert new relations
    const insertPromises: Promise<any>[] = [];

    if (images !== undefined && images.length > 0) {
      const imageRecords = images.map((img, index) => ({
        id: uuidv4(),
        productId: id,
        url: img.url,
        alt: img.alt || null,
        sortOrder: img.sortOrder ?? index,
        isPrimary: img.isPrimary ?? index === 0,
      }));
      insertPromises.push(db.insert(productImages).values(imageRecords));
    }

    if (tagIds !== undefined && tagIds.length > 0) {
      const tagRecords = tagIds.map((tagId) => ({
        productId: id,
        tagId: tagId,
      }));
      insertPromises.push(db.insert(productTags).values(tagRecords));
    }

    if (attributeIds !== undefined && attributeIds.length > 0) {
      const attrRecords = attributeIds.map((attrId) => ({
        productId: id,
        attributeId: attrId,
        value: attributeValues?.[attrId]
          ? JSON.stringify(attributeValues[attrId])
          : null,
      }));
      insertPromises.push(db.insert(productAttributes).values(attrRecords));
    }

    if (shippingMethodIds !== undefined && shippingMethodIds.length > 0) {
      const shippingRecords = shippingMethodIds.map((methodId) => ({
        productId: id,
        shippingMethodId: methodId,
      }));
      insertPromises.push(
        db.insert(productShippingMethods).values(shippingRecords),
      );
    }

    await Promise.all(insertPromises);

    // Fetch updated product with relations
    const [updatedProduct] = await db
      .select()
      .from(products)
      .where(eq(products.id, id));

    const normalizedProduct = await fetchProductWithRelations(updatedProduct, {
      excludeCostPrice: false,
    });

    return {
      ...createSuccessResponse("Product updated successfully"),
      product: normalizedProduct,
    };
  });

export const deleteProduct = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator(
    deleteProductSchema.extend({
      shopId: deleteProductSchema.shape.id,
    }),
  )
  .handler(async ({ context, data }) => {
    const userId = context.session.user.id;
    const { id, shopId } = data as { id: string; shopId: string };

    // Verify shop access (vendor ownership or admin)
    await requireShopAccess(userId, shopId);

    // Check if product exists
    const [existingProduct] = await db
      .select()
      .from(products)
      .where(and(eq(products.id, id), eq(products.shopId, shopId)));

    if (!existingProduct) {
      throw new Error("Product not found.");
    }

    // Delete the product (images, tags, attributes will cascade delete)
    await db.delete(products).where(eq(products.id, id));

    return createSuccessResponse("Product deleted successfully");
  });
