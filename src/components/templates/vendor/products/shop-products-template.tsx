import type {
  DataTableFetchParams,
  DataTableFetchResult,
} from "@/components/base/data-table/types";
import ProductHeader from "@/components/containers/vendors/products/product-header";
import { ProductTable } from "@/components/containers/vendors/products/product-table";
import type { ProductMutationState } from "@/components/containers/vendors/products/product-table-columns";
import type { ProductItem } from "@/types/products";

interface ShopProductsTemplateProps {
  fetcher: (
    params: DataTableFetchParams,
  ) => Promise<DataTableFetchResult<ProductItem>>;
  onAddProduct?: () => void;
  onEdit?: (product: ProductItem) => void;
  onDelete?: (product: ProductItem) => void;
  onToggleActive?: (id: string) => void;
  mutationState?: ProductMutationState;
  isProductMutating?: (id: string) => boolean;
  showAddButton?: boolean;
}

export function ShopProductsTemplate({
  fetcher,
  onAddProduct,
  onEdit,
  onDelete,
  onToggleActive,
  mutationState,
  isProductMutating,
  showAddButton = true,
}: ShopProductsTemplateProps) {
  return (
    <div className="space-y-6">
      <ProductHeader
        onAdd={onAddProduct}
        role="vendor"
        showAddButton={showAddButton}
      />
      <ProductTable
        fetcher={fetcher}
        onEdit={onEdit}
        onDelete={onDelete}
        onToggleActive={
          onToggleActive ? (product) => onToggleActive(product.id) : undefined
        }
        mutationState={mutationState}
        isMutating={isProductMutating}
        mode="vendor"
      />
    </div>
  );
}

export default ShopProductsTemplate;
