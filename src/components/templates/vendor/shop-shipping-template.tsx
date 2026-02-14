import type {
  DataTableFetchParams,
  DataTableFetchResult,
} from "@/components/base/data-table/types";
import ShippingHeader from "@/components/containers/shared/shipping/shipping-header";
import ShippingTable from "@/components/containers/shared/shipping/shipping-table";
import type { ShippingMutationState } from "@/components/containers/shared/shipping/shipping-table-columns";
import type { ShippingMethodItem } from "@/types/shipping";

interface ShopShippingTemplateProps {
  fetcher: (
    params: DataTableFetchParams,
  ) => Promise<DataTableFetchResult<ShippingMethodItem>>;
  onAddShipping?: () => void;
  onEdit?: (shipping: ShippingMethodItem) => void;
  onDelete?: (shipping: ShippingMethodItem) => void;
  mutationState?: ShippingMutationState;
  isShippingMutating?: (id: string) => boolean;
  showAddButton?: boolean;
}

export default function ShopShippingTemplate({
  fetcher,
  onAddShipping,
  onEdit,
  onDelete,
  mutationState,
  isShippingMutating,
  showAddButton = true,
}: ShopShippingTemplateProps) {
  return (
    <div className="space-y-6">
      <ShippingHeader
        role="vendor"
        onAdd={onAddShipping}
        showAddButton={showAddButton}
      />
      <ShippingTable
        fetcher={fetcher}
        onEdit={onEdit}
        onDelete={onDelete}
        mutationState={mutationState}
        isMutating={isShippingMutating}
        mode="vendor"
      />
    </div>
  );
}
