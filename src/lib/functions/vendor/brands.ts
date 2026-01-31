import { createServerFn } from "@tanstack/react-start";
import { and, eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { db } from "@/lib/db";
import { brands } from "@/lib/db/schema/brand-schema";
import {
  executeBrandQuery,
  fetchBrandWithRelations,
} from "@/lib/helper/brands-query-helpers";
import { requireShopAccess } from "@/lib/helper/vendor";
import { authMiddleware } from "@/lib/middleware/auth";
import { generateSlug } from "@/lib/utils/slug";
import { createBrandSchema, updateBrandSchema } from "@/lib/validators/brands";
import {
  type VendorBrandsQuery,
  vendorBrandsQuerySchema,
} from "@/lib/validators/shared/brand-query";
import { createSuccessResponse } from "@/types/api-response";
import type { BrandListResponse } from "@/types/brands";

export const getBrands = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .inputValidator(vendorBrandsQuerySchema)
  .handler(async ({ context, data }): Promise<BrandListResponse> => {
    const userId = context.session.user.id;
    const { shopId, limit, offset, search, isActive, sortBy, sortDirection } =
      data as VendorBrandsQuery;

    // Verify shop access (vendor ownership or admin)
    await requireShopAccess(userId, shopId);

    // Use shared query helper
    return executeBrandQuery({
      baseConditions: [eq(brands.shopId, shopId)],
      search,
      isActive,
      limit,
      offset,
      sortBy,
      sortDirection,
      includeShopInfo: false,
    });
  });

// ============================================================================
// Get Brand by ID
// ============================================================================

export const getBrandById = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .inputValidator(
    vendorBrandsQuerySchema
      .pick({ shopId: true })
      .extend({ id: vendorBrandsQuerySchema.shape.shopId })
  )
  .handler(async ({ context, data }) => {
    const userId = context.session.user.id;
    const { id, shopId } = data as { id: string; shopId: string };

    // Verify shop access (vendor ownership or admin)
    await requireShopAccess(userId, shopId);

    // Get brand
    const [brand] = await db
      .select()
      .from(brands)
      .where(and(eq(brands.id, id), eq(brands.shopId, shopId)));

    if (!brand) {
      throw new Error("Brand not found.");
    }

    // Use shared helper for fetching with relations
    const normalizedBrand = await fetchBrandWithRelations(brand, {
      includeShopInfo: false,
    });

    return { brand: normalizedBrand };
  });

// ============================================================================
// Create Brand
// ============================================================================

export const createBrand = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator(createBrandSchema)
  .handler(async ({ context, data }) => {
    const userId = context.session.user.id;
    const { shopId, ...brandData } = data;

    // Verify shop access (vendor ownership or admin)
    await requireShopAccess(userId, shopId);

    // Generate slug if not provided
    let slug = brandData.slug;
    if (!slug) {
      slug = generateSlug(brandData.name);
    }

    // Check for duplicate slug within the shop
    const existingBrand = await db.query.brands.findFirst({
      where: and(eq(brands.shopId, shopId), eq(brands.slug, slug)),
    });

    if (existingBrand) {
      throw new Error(
        "A brand with this slug already exists in this shop. Please choose a different name or slug."
      );
    }

    // Create the brand
    const brandId = uuidv4();

    await db.insert(brands).values({
      id: brandId,
      shopId: shopId,
      name: brandData.name,
      slug: slug,
      description: brandData.description || null,
      logo: brandData.logo || null,
      website: brandData.website || null,
      sortOrder: brandData.sortOrder ?? 0,
      isActive: brandData.isActive ?? true,
      productCount: 0,
    });

    // Fetch the created brand
    const newBrand = await db.query.brands.findFirst({
      where: eq(brands.id, brandId),
    });

    if (!newBrand) {
      throw new Error("Failed to create brand.");
    }

    return {
      ...createSuccessResponse("Brand created successfully"),
      brand: {
        ...newBrand,
        productCount: 0,
        createdAt: newBrand.createdAt.toISOString(),
        updatedAt: newBrand.updatedAt.toISOString(),
      },
    };
  });

// ============================================================================
// Update Brand
// ============================================================================

export const updateBrand = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator(updateBrandSchema)
  .handler(async ({ context, data }) => {
    const userId = context.session.user.id;
    const { id, shopId, ...updateData } = data;

    // Verify shop access (vendor ownership or admin)
    await requireShopAccess(userId, shopId);

    // Check if brand exists
    const existingBrand = await db.query.brands.findFirst({
      where: and(eq(brands.id, id), eq(brands.shopId, shopId)),
    });

    if (!existingBrand) {
      throw new Error("Brand not found.");
    }

    // Check for duplicate slug if slug is being updated
    if (updateData.slug && updateData.slug !== existingBrand.slug) {
      const slugExists = await db.query.brands.findFirst({
        where: and(eq(brands.shopId, shopId), eq(brands.slug, updateData.slug)),
      });

      if (slugExists) {
        throw new Error("A brand with this slug already exists in this shop.");
      }
    }

    // Build update object
    const updateValues: Record<string, any> = {};
    if (updateData.name !== undefined) updateValues.name = updateData.name;
    if (updateData.slug !== undefined) updateValues.slug = updateData.slug;
    if (updateData.description !== undefined)
      updateValues.description = updateData.description;
    if (updateData.logo !== undefined)
      updateValues.logo = updateData.logo || null;
    if (updateData.website !== undefined)
      updateValues.website = updateData.website || null;
    if (updateData.sortOrder !== undefined)
      updateValues.sortOrder = updateData.sortOrder;
    if (updateData.isActive !== undefined)
      updateValues.isActive = updateData.isActive;

    // Update the brand
    await db.update(brands).set(updateValues).where(eq(brands.id, id));

    // Fetch updated brand with relations
    const [updatedBrand] = await db
      .select()
      .from(brands)
      .where(eq(brands.id, id));

    if (!updatedBrand) {
      throw new Error("Failed to update brand.");
    }

    const normalizedBrand = await fetchBrandWithRelations(updatedBrand, {
      includeShopInfo: false,
    });

    return {
      ...createSuccessResponse("Brand updated successfully"),
      brand: normalizedBrand,
    };
  });

// ============================================================================
// Delete Brand
// ============================================================================

export const deleteBrand = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator(
    vendorBrandsQuerySchema
      .pick({ shopId: true })
      .extend({ id: vendorBrandsQuerySchema.shape.shopId })
  )
  .handler(async ({ context, data }) => {
    const userId = context.session.user.id;
    const { id, shopId } = data as { id: string; shopId: string };

    // Verify shop access (vendor ownership or admin)
    await requireShopAccess(userId, shopId);

    const existingBrand = await db.query.brands.findFirst({
      where: and(eq(brands.id, id), eq(brands.shopId, shopId)),
    });

    if (!existingBrand) {
      throw new Error("Brand not found.");
    }

    const productCount = existingBrand.productCount ?? 0;
    if (productCount > 0) {
      throw new Error(
        `Cannot delete brand "${existingBrand.name}" with ${productCount} associated products. Please reassign products first.`
      );
    }

    // Delete the brand
    await db.delete(brands).where(eq(brands.id, id));

    return createSuccessResponse("Brand deleted successfully");
  });
