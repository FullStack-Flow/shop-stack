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
    params: DataTableFetchParams
  ) => Promise<DataTableFetchResult<AttributeItem>>;
  mutationState?: AttributeMutationState;
  isAttributeMutating?: (id: string) => boolean;
  onAddAttribute?: () => void;
  showAddButton?: boolean;
}

export function ShopAttributesTemplate({
  fetcher,
  onAddAttribute,
  onEdit,
  onDelete,
  onToggleActive,
  mutationState,
  isAttributeMutating,
  showAddButton = true,
}: ShopAttributesTemplateProps) {
  return (
    <div className="space-y-6">
      <AttributeHeader
        onAddAttribute={onAddAttribute}
        role="vendor"
        showAddButton={showAddButton}
      />
      <AttributeTable
        fetcher={fetcher}
        onEdit={onEdit}
        onDelete={onDelete}
        onToggleActive={onToggleActive}
        mutationState={mutationState}
        isAttributeMutating={isAttributeMutating}
        mode="vendor"
      />
    </div>
  );
}
