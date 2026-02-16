import type {
  DataTableFetchParams,
  DataTableFetchResult,
} from "@/components/base/data-table/types";
import ProductHeader from "@/components/containers/vendors/products/product-header";
import { ProductTable } from "@/components/containers/vendors/products/product-table";
import type { ProductMutationState } from "@/components/containers/vendors/products/product-table-columns";
import type { ProductItem } from "@/types/products";

interface AdminProductsTemplateProps {
  fetcher: (
    params: DataTableFetchParams,
  ) => Promise<DataTableFetchResult<ProductItem>>;
  onEdit?: (product: ProductItem) => void;
  onDelete?: (product: ProductItem) => void;
  mutationState?: ProductMutationState;
  isProductMutating?: (id: string) => boolean;
}

export default function AdminProductsTemplate({
  fetcher,
  onEdit,
  onDelete,
  mutationState,
  isProductMutating,
}: AdminProductsTemplateProps) {
  return (
    <div className="space-y-6">
      <ProductHeader role="admin" showAddButton={false} />
      <ProductTable
        fetcher={fetcher}
        onEdit={onEdit}
        onDelete={onDelete}
        mutationState={mutationState}
        isMutating={isProductMutating}
        mode="vendor"
      />
    </div>
  );
}
