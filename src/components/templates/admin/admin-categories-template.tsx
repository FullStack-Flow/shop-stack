import CategoryHeader from '@/components/containers/shared/categories/category-header';
import CategoryTable from '@/components/containers/shared/categories/category-table';
import { ADMIN_CATEGORY_PERMISSIONS } from '@/lib/config/category-permissions';
import type { Category, CategoryFormValues } from '@/types/category-types';

interface AdminCategoriesTemplateProps {
  categories: Category[];
  onCategoryStatusChange: (categoryId: string, newStatus: boolean) => void;
  onAddCategory: (category: CategoryFormValues) => void;
}

export default function AdminCategoriesTemplate({
  categories,
  onCategoryStatusChange,
  onAddCategory,
}: AdminCategoriesTemplateProps) {
  return (
    <div className="space-y-6">
      <CategoryHeader onAddCategory={onAddCategory} role="admin" />
      <CategoryTable
        categories={categories}
        permissions={ADMIN_CATEGORY_PERMISSIONS}
        onToggleStatus={onCategoryStatusChange}
      />
    </div>
  );
}
