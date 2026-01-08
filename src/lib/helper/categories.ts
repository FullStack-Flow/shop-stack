import { mockCategories } from "@/data/categories";
import type { Category, CategoryWithChildren } from "@/types/category-types";

// Helper function to build category tree
export const buildCategoryTree = (
  categories: Category[]
): CategoryWithChildren[] => {
  const categoryMap = new Map<string, CategoryWithChildren>();
  const rootCategories: CategoryWithChildren[] = [];

  // First pass: create CategoryWithChildren objects for all categories
  categories.forEach((category) => {
    categoryMap.set(category.id, {
      ...category,
      subcategories: [],
      productCount: category.productCount,
    });
  });

  // Second pass: build the tree structure
  categories.forEach((category) => {
    const categoryWithChildren = categoryMap.get(category.id)!;

    if (category.parentId) {
      const parent = categoryMap.get(category.parentId);
      if (parent) {
        parent.subcategories.push(categoryWithChildren);
        // Update parent product count to include subcategories
        parent.productCount += category.productCount;
      }
    } else {
      rootCategories.push(categoryWithChildren);
    }
  });

  // Sort categories by sortOrder
  const sortCategories = (
    categories: CategoryWithChildren[]
  ): CategoryWithChildren[] => {
    return categories
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((category) => ({
        ...category,
        subcategories: sortCategories(category.subcategories),
      }));
  };

  return sortCategories(rootCategories);
};

// Helper function to get category by slug
export const getCategoryBySlug = (
  slug: string,
  categories: Category[] = mockCategories
): Category | undefined => {
  return categories.find((category) => category.slug === slug);
};

// Helper function to get subcategories by parent ID
export const getSubcategories = (
  parentId: string,
  categories: Category[] = mockCategories
): Category[] => {
  return categories.filter(
    (category) => category.parentId === parentId && category.isActive
  );
};

// Helper function to get root categories (level 0)
export const getRootCategories = (
  categories: Category[] = mockCategories
): Category[] => {
  return categories
    .filter((category) => !category.parentId && category.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder);
};

// Helper function to get featured categories
export const getFeaturedCategories = (
  categories: Category[] = mockCategories
): Category[] => {
  return categories
    .filter((category) => category.featured && category.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder);
};

// Helper function to get category breadcrumb
export const getCategoryBreadcrumb = (
  categoryId: string,
  categories: Category[] = mockCategories
): { id: string; name: string; slug: string }[] => {
  const breadcrumb: { id: string; name: string; slug: string }[] = [];
  let currentCategory = categories.find((cat) => cat.id === categoryId);

  while (currentCategory) {
    breadcrumb.unshift({
      id: currentCategory.id,
      name: currentCategory.name,
      slug: currentCategory.slug,
    });

    if (currentCategory.parentId) {
      currentCategory = categories.find(
        (cat) => cat.id === currentCategory!.parentId
      );
    } else {
      break;
    }
  }

  return breadcrumb;
};

// Export the built category tree
export const categoryTree = buildCategoryTree(mockCategories);
