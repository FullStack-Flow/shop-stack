import { createServerFn } from "@tanstack/react-start";
import { and, count, eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { db } from "@/lib/db";
import { categories } from "@/lib/db/schema/category-schema";
import {
  executeCategoryQuery,
  fetchCategoryWithRelations,
} from "@/lib/helper/category-query-helpers";
import { requireShopAccess } from "@/lib/helper/vendor";
import { authMiddleware } from "@/lib/middleware/auth";
import { generateSlug } from "@/lib/utils/slug";
import {
  createCategorySchema,
  updateCategorySchema,
} from "@/lib/validators/category";
import {
  type VendorCategoriesQuery,
  vendorCategoriesQuerySchema,
} from "@/lib/validators/shared/category-query";
import { createSuccessResponse } from "@/types/api-response";
import type { CategoryListResponse } from "@/types/category-types";

// ============================================================================
// Get Categories (List with Pagination)
// ============================================================================
export const getCategories = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .inputValidator(vendorCategoriesQuerySchema)
  .handler(async ({ context, data }): Promise<CategoryListResponse> => {
    const userId = context.session.user.id;
    const {
      shopId,
      limit,
      offset,
      search,
      parentId,
      isActive,
      featured,
      sortBy,
      sortDirection,
    } = data as VendorCategoriesQuery;

    // Verify shop access (vendor ownership or admin)
    await requireShopAccess(userId, shopId);

    // Use shared query helper
    return executeCategoryQuery({
      baseConditions: [eq(categories.shopId, shopId)],
      search,
      parentId: parentId ?? undefined,
      isActive,
      featured,
      limit,
      offset,
      sortBy,
      sortDirection,
      includeShopInfo: false,
    });
  });

// ============================================================================
// Get Category by ID
// ============================================================================

export const getCategoryById = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .inputValidator(
    vendorCategoriesQuerySchema
      .pick({ shopId: true })
      .extend({ id: vendorCategoriesQuerySchema.shape.shopId })
  )
  .handler(async ({ context, data }) => {
    const userId = context.session.user.id;
    const { id, shopId } = data as { id: string; shopId: string };

    // Verify shop access (vendor ownership or admin)
    await requireShopAccess(userId, shopId);

    // Get category
    const [category] = await db
      .select()
      .from(categories)
      .where(and(eq(categories.id, id), eq(categories.shopId, shopId)));

    if (!category) {
      throw new Error("Category not found.");
    }

    // Use shared helper for fetching with relations
    const normalizedCategory = await fetchCategoryWithRelations(category, {
      includeShopInfo: false,
    });

    return { category: normalizedCategory };
  });

// ============================================================================
// Create Category
// ============================================================================

export const createCategory = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator(createCategorySchema)
  .handler(async ({ context, data }) => {
    const userId = context.session.user.id;
    const { shopId, ...categoryData } = data;

    // Verify shop access (vendor ownership or admin)
    await requireShopAccess(userId, shopId);

    // Generate slug if not provided
    let slug = categoryData.slug;
    if (!slug) {
      slug = generateSlug(categoryData.name);
    }

    // Check for duplicate slug within the shop
    const existingCategory = await db.query.categories.findFirst({
      where: and(eq(categories.shopId, shopId), eq(categories.slug, slug)),
    });

    if (existingCategory) {
      throw new Error(
        "A category with this slug already exists in this shop. Please choose a different name or slug."
      );
    }

    // Calculate level based on parent
    let level = 0;
    let parentName: string | null = null;
    if (categoryData.parentId) {
      const parent = await db.query.categories.findFirst({
        where: eq(categories.id, categoryData.parentId),
        columns: { level: true, name: true },
      });
      level = (parent?.level ?? 0) + 1;
      parentName = parent?.name ?? null;
    }

    // Create the category
    const categoryId = uuidv4();

    await db.insert(categories).values({
      id: categoryId,
      shopId: shopId,
      name: categoryData.name,
      slug: slug,
      description: categoryData.description || null,
      image: categoryData.image || null,
      icon: categoryData.icon || null,
      parentId: categoryData.parentId || null,
      level: level,
      sortOrder: categoryData.sortOrder ?? 0,
      isActive: categoryData.isActive ?? true,
      featured: categoryData.featured ?? false,
      productCount: 0,
    });

    // Fetch the created category
    const newCategory = await db.query.categories.findFirst({
      where: eq(categories.id, categoryId),
    });

    if (!newCategory) {
      throw new Error("Failed to create category.");
    }

    return {
      ...createSuccessResponse("Category created successfully"),
      category: {
        ...newCategory,
        parentName,
        productCount: 0,
        createdAt: newCategory.createdAt.toISOString(),
        updatedAt: newCategory.updatedAt.toISOString(),
      },
    };
  });

// ============================================================================
// Update Category
// ============================================================================

export const updateCategory = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator(updateCategorySchema)
  .handler(async ({ context, data }) => {
    const userId = context.session.user.id;
    const { id, shopId, ...updateData } = data;

    // Verify shop access (vendor ownership or admin)
    await requireShopAccess(userId, shopId);

    // Check if category exists
    const existingCategory = await db.query.categories.findFirst({
      where: and(eq(categories.id, id), eq(categories.shopId, shopId)),
    });

    if (!existingCategory) {
      throw new Error("Category not found.");
    }

    // Check for duplicate slug if slug is being updated
    if (updateData.slug && updateData.slug !== existingCategory.slug) {
      const slugExists = await db.query.categories.findFirst({
        where: and(
          eq(categories.shopId, shopId),
          eq(categories.slug, updateData.slug)
        ),
      });

      if (slugExists) {
        throw new Error(
          "A category with this slug already exists in this shop."
        );
      }
    }

    // Calculate new level if parent is changing
    let newLevel = existingCategory.level;
    if (
      updateData.parentId !== undefined &&
      updateData.parentId !== existingCategory.parentId
    ) {
      if (updateData.parentId) {
        // Prevent setting self as parent
        if (updateData.parentId === id) {
          throw new Error("A category cannot be its own parent.");
        }

        const parent = await db.query.categories.findFirst({
          where: eq(categories.id, updateData.parentId),
          columns: { level: true, id: true },
        });

        if (!parent) {
          throw new Error("Parent category not found.");
        }

        newLevel = (parent.level ?? 0) + 1;
      } else {
        newLevel = 0;
      }
    }

    // Build update object
    const updateValues: Record<string, any> = {};
    if (updateData.name !== undefined) updateValues.name = updateData.name;
    if (updateData.slug !== undefined) updateValues.slug = updateData.slug;
    if (updateData.description !== undefined)
      updateValues.description = updateData.description;
    if (updateData.image !== undefined)
      updateValues.image = updateData.image || null;
    if (updateData.icon !== undefined)
      updateValues.icon = updateData.icon || null;
    if (updateData.parentId !== undefined) {
      updateValues.parentId = updateData.parentId || null;
      updateValues.level = newLevel;
    }
    if (updateData.sortOrder !== undefined)
      updateValues.sortOrder = updateData.sortOrder;
    if (updateData.isActive !== undefined)
      updateValues.isActive = updateData.isActive;
    if (updateData.featured !== undefined)
      updateValues.featured = updateData.featured;

    // Update the category
    await db.update(categories).set(updateValues).where(eq(categories.id, id));

    // Fetch updated category with relations
    const [updatedCategory] = await db
      .select()
      .from(categories)
      .where(eq(categories.id, id));

    if (!updatedCategory) {
      throw new Error("Failed to update category.");
    }

    const normalizedCategory = await fetchCategoryWithRelations(
      updatedCategory,
      {
        includeShopInfo: false,
      }
    );

    return {
      ...createSuccessResponse("Category updated successfully"),
      category: normalizedCategory,
    };
  });

// ============================================================================
// Delete Category
// ============================================================================

export const deleteCategory = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator(
    vendorCategoriesQuerySchema
      .pick({ shopId: true })
      .extend({ id: vendorCategoriesQuerySchema.shape.shopId })
  )
  .handler(async ({ context, data }) => {
    const userId = context.session.user.id;
    const { id, shopId } = data as { id: string; shopId: string };

    // Verify shop access (vendor ownership or admin)
    await requireShopAccess(userId, shopId);

    const existingCategory = await db.query.categories.findFirst({
      where: and(eq(categories.id, id), eq(categories.shopId, shopId)),
    });

    if (!existingCategory) {
      throw new Error("Category not found.");
    }

    const productCount = existingCategory.productCount ?? 0;
    if (productCount > 0) {
      throw new Error(
        `Cannot delete category "${existingCategory.name}" with ${productCount} associated products. Please reassign products first.`
      );
    }

    const childrenCount = await db
      .select({ count: count() })
      .from(categories)
      .where(eq(categories.parentId, id));

    if (childrenCount[0]?.count > 0) {
      throw new Error(
        "Cannot delete a category that has subcategories. Please delete or reassign subcategories first."
      );
    }

    // Delete the category
    await db.delete(categories).where(eq(categories.id, id));

    return createSuccessResponse("Category deleted successfully");
  });
