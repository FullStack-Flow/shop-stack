import CategoryHeader from "@/components/containers/vendors/categories/category-header";
import CategoryTable from "@/components/containers/vendors/categories/category-table";
import { Category } from "@/types/category-types";

interface ShopCategoriesTemplateProps {
  categories: Category[];
  onAddCategory: () => void;
}

export default function ShopCategoriesTemplate({
  categories,
  onAddCategory,
}: ShopCategoriesTemplateProps) {
  return (
    <div className="space-y-6">
      <CategoryHeader onAddCategory={onAddCategory} />
      <CategoryTable categories={categories} />
    </div>
  );
}
