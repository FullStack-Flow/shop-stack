import type {
  DataTableFetchParams,
  DataTableFetchResult,
} from "@/components/base/data-table/types";
import BrandHeader from "@/components/containers/shared/brands/brand-header";
import { VendorBrandTable } from "@/components/containers/shared/brands/brand-table";
import type { BrandMutationState } from "@/components/containers/shared/brands/brand-table-columns";
import type { BrandItem } from "@/types/brands";

interface ShopBrandsTemplateProps {
  fetcher: (
    params: DataTableFetchParams,
  ) => Promise<DataTableFetchResult<BrandItem>>;
  onAddBrand: () => void;
  onEditBrand?: (brand: BrandItem) => void;
  onDeleteBrand?: (brand: BrandItem) => void;
  onToggleActive?: (brand: BrandItem) => void;
  mutationState?: BrandMutationState;
  isBrandMutating?: (id: string) => boolean;
}

export function ShopBrandsTemplate({
  fetcher,
  onAddBrand,
  onEditBrand,
  onDeleteBrand,
  onToggleActive,
  mutationState,
  isBrandMutating,
}: ShopBrandsTemplateProps) {
  return (
    <div className="space-y-6">
      <BrandHeader onAdd={onAddBrand} />
      <VendorBrandTable
        fetcher={fetcher}
        onEdit={onEditBrand}
        onDelete={onDeleteBrand}
        onToggleActive={onToggleActive}
        mutationState={mutationState}
        isBrandMutating={isBrandMutating}
      />
    </div>
  );
}
