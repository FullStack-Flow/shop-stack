import CategoryHeader from "@/components/containers/shared/categories/category-header";
import { AdminCategoryTable } from "@/components/containers/shared/categories/category-table";
import type {
  CategoryFormValues,
  NormalizedCategory,
} from "@/types/category-types";

interface AdminCategoriesTemplateProps {
  categories: NormalizedCategory[];
  onCategoryStatusChange: (categoryId: string, newStatus: boolean) => void;
  onAddCategory: (category: CategoryFormValues) => void;
  onEditCategory?: (category: NormalizedCategory) => void;
  onDeleteCategory?: (category: NormalizedCategory) => void;
  onToggleFeatured?: (category: NormalizedCategory) => void;
  onOpenAddDialog?: () => void;
}

export default function AdminCategoriesTemplate({
  categories,
  onCategoryStatusChange,
  onEditCategory,
  onDeleteCategory,
  onToggleFeatured,
  onOpenAddDialog,
}: AdminCategoriesTemplateProps) {
  return (
    <div className="space-y-6">
      <CategoryHeader onAdd={onOpenAddDialog} role="admin" />
      <AdminCategoryTable
        categories={categories}
        onToggleActive={(category) =>
          onCategoryStatusChange(category.id, !category.isActive)
        }
        onEdit={onEditCategory}
        onDelete={onDeleteCategory}
        onToggleFeatured={onToggleFeatured}
      />
    </div>
  );
}
