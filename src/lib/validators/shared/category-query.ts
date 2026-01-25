import z from "zod";
import {
  createDeleteSchema,
  createGetByIdSchema,
  createGetBySlugSchema,
  isActiveField,
  paginationFields,
  searchFields,
  shopScopeFields,
  sortDirectionEnum,
  VENDOR_DEFAULT_LIMIT,
} from "./base-query";

export const categorySortByEnum = z.enum([
  "name",
  "createdAt",
  "sortOrder",
  "productCount",
]);

export const categoryFilterFields = {
  parentId: z.string().optional(),
  ...isActiveField,
  featured: z.coerce.boolean().optional(),
};

const sortFields = {
  sortBy: categorySortByEnum.optional().default("sortOrder"),
  sortDirection: sortDirectionEnum.optional().default("asc"),
};

export const vendorCategoriesQuerySchema = z.object({
  ...shopScopeFields,
  ...paginationFields,
  limit: paginationFields.limit.default(VENDOR_DEFAULT_LIMIT),
  ...sortFields,
  ...searchFields,
  ...categoryFilterFields,
});

export const getCategoryByIdSchema = createGetByIdSchema("Category");

export const getCategoryBySlugSchema = createGetBySlugSchema("Category");

export const deleteCategorySchema = createDeleteSchema("Category");

export type CategorySortBy = z.infer<typeof categorySortByEnum>;
export type VendorCategoriesQuery = z.infer<typeof vendorCategoriesQuerySchema>;
