import type {
  DataTableFetchParams,
  DataTableFetchResult,
} from "@/components/base/data-table/types";
import AttributeHeader from "@/components/containers/shared/attributes/attribute-header";
import AttributeTable from "@/components/containers/shared/attributes/attribute-table";
import type {
  AttributeMutationState,
  AttributeTableActions,
} from "@/components/containers/shared/attributes/attribute-table-columns";
import type { AttributeItem } from "@/types/attributes";

interface ShopAttributesTemplateProps extends AttributeTableActions {
  fetcher: (
    params: DataTableFetchParams,
  ) => Promise<DataTableFetchResult<AttributeItem>>;
  onAddAttribute: () => void;
  onEditAttribute?: (attribute: AttributeItem) => void;
  onDeleteAttribute?: (attribute: AttributeItem) => void;
  onToggleActive?: (attribute: AttributeItem) => void;
  mutationState?: AttributeMutationState;
  isAttributeMutating?: (id: string) => boolean;
}

export function ShopAttributesTemplate({
  fetcher,
  onAddAttribute,
  onEditAttribute,
  onDeleteAttribute,
  onToggleActive,
  mutationState,
  isAttributeMutating,
}: ShopAttributesTemplateProps) {
  return (
    <div className="space-y-6">
      <AttributeHeader
        onAdd={onAddAttribute}
        role="vendor"
        showAddButton={true}
      />
      <AttributeTable
        fetcher={fetcher}
        onEdit={onEditAttribute}
        onDelete={onDeleteAttribute}
        onToggleActive={onToggleActive}
        mutationState={mutationState}
        isAttributeMutating={isAttributeMutating}
        mode="vendor"
      />
    </div>
  );
}
