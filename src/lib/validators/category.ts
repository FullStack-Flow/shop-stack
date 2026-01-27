// Re-export all category schemas from the shared file for backward compatibility
export {
  type Category,
  type CategorySortBy,
  type CreateCategoryInput,
  categoryFilterFields,
  categorySchema,
  categorySortByEnum,
  createCategorySchema,
  deleteCategorySchema,
  getCategoryByIdSchema,
  getCategoryBySlugSchema,
  type UpdateCategoryInput,
  updateCategorySchema,
  type VendorCategoriesQuery,
  type VendorCategoriesQuery as GetCategoriesQueryInput,
  vendorCategoriesQuerySchema,
  vendorCategoriesQuerySchema as getCategoriesQuerySchema,
} from "./shared/category-query";
