import type {
  DataTableFetchParams,
  DataTableFetchResult,
} from "@/components/base/data-table/types";
import CategoryHeader from "@/components/containers/shared/categories/category-header";
import VendorCategoryTable from "@/components/containers/shared/categories/category-table";
import type { VendorCategoryMutationState } from "@/hooks/vendors/use-categories";
import type { NormalizedCategory } from "@/types/category-types";

interface ShopCategoriesTemplateProps {
  fetcher: (
    params: DataTableFetchParams,
  ) => Promise<DataTableFetchResult<NormalizedCategory>>;
  onAddCategory: () => void;
  onEditCategory: (category: NormalizedCategory) => void;
  onDeleteCategory: (category: NormalizedCategory) => void;
  mutationState?: VendorCategoryMutationState;
  isCategoryMutating?: (id: string) => boolean;
}

export default function ShopCategoriesTemplate({
  fetcher,
  onAddCategory,
  onEditCategory,
  onDeleteCategory,
  mutationState,
  isCategoryMutating,
}: ShopCategoriesTemplateProps) {
  return (
    <div className="space-y-6">
      <CategoryHeader onAdd={onAddCategory} />
      <VendorCategoryTable
        fetcher={fetcher}
        onEdit={onEditCategory}
        onDelete={onDeleteCategory}
        mutationState={mutationState}
        isCategoryMutating={isCategoryMutating}
      />
    </div>
  );
}
