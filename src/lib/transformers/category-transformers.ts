/**
 * Category Transformers
 *
 * Shared utility functions for transforming API category types to UI types.
 * Used across category templates to prevent duplication.
 */

import type {
  Category,
  CategoryTreeNode,
  CategoryWithChildren,
  NormalizedCategory,
} from "@/types/category-types";

/**
 * Transform NormalizedCategory (API response) to Category (UI type)
 */
export function toUICategory(cat: NormalizedCategory): Category {
  return {
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    description: cat.description ?? undefined,
    image: cat.image ?? undefined,
    icon: cat.icon ?? undefined,
    parentId: cat.parentId ?? undefined,
    level: cat.level,
    productCount: cat.productCount,
    isActive: cat.isActive,
    featured: cat.featured,
    sortOrder: cat.sortOrder,
  };
}

/**
 * Transform CategoryTreeNode (API tree with `children`) to CategoryWithChildren (UI type with `subcategories`)
 */
export function toUICategoryTree(node: CategoryTreeNode): CategoryWithChildren {
  return {
    ...toUICategory(node),
    subcategories: node.children.map(toUICategoryTree),
  };
}

/**
 * Filter root categories from a list (level 0 or no parent)
 */
export function filterRootCategories(categories: Category[]): Category[] {
  return categories.filter((cat) => cat.level === 0 || !cat.parentId);
}
