import type {
  DataTableFetchParams,
  DataTableFetchResult,
} from "@/components/base/data-table/types";
import BrandHeader from "@/components/containers/shared/brands/brand-header";
import { VendorBrandTable } from "@/components/containers/shared/brands/brand-table";
import type { BrandMutationState } from "@/components/containers/shared/brands/brand-table-columns";
import type { NormalizedBrand } from "@/types/brands";

interface ShopBrandsTemplateProps {
  fetcher: (
    params: DataTableFetchParams,
  ) => Promise<DataTableFetchResult<NormalizedBrand>>;
  onAddBrand: () => void;
  onEditBrand?: (brand: NormalizedBrand) => void;
  onDeleteBrand?: (brand: NormalizedBrand) => void;
  onToggleActive?: (brand: NormalizedBrand) => void;
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
      <BrandHeader onAddBrand={onAddBrand} />
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
