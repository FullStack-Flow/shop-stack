import CategoryHeader from '@/components/containers/shared/categories/category-header';
import CategoryTable from '@/components/containers/shared/categories/category-table';
import { VENDOR_CATEGORY_PERMISSIONS } from '@/lib/config/category-permissions';
import type { Category } from '@/types/category-types';

interface ShopCategoriesTemplateProps {
  categories: Category[];
  onAddCategory: () => void;
  onDeleteCategory?: (categoryId: string) => void;
  onEditCategory?: (categoryId: string) => void;
  onToggleStatus?: (categoryId: string, currentStatus: boolean) => void;
}

export default function ShopCategoriesTemplate({
  categories,
  onAddCategory,
  onDeleteCategory,
  onEditCategory,
  onToggleStatus,
}: ShopCategoriesTemplateProps) {
  return (
    <div className="space-y-6">
      <CategoryHeader
        onAddCategory={onAddCategory}
        role="vendor"
        showAddButton={true}
      />
      <CategoryTable
        categories={categories}
        permissions={VENDOR_CATEGORY_PERMISSIONS}
        onDeleteCategory={onDeleteCategory}
        onEditCategory={onEditCategory}
        onToggleStatus={onToggleStatus}
      />
    </div>
  );
}
