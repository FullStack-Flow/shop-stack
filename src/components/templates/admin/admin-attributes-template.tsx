import type {
  DataTableFetchParams,
  DataTableFetchResult,
} from "@/components/base/data-table/types";
import AttributeHeader from "@/components/containers/shared/attributes/attribute-header";
import AttributeTable from "@/components/containers/shared/attributes/attribute-table";
import type {
  AdminAttributeMutationState,
  AttributeItem,
} from "@/types/attributes";

interface AdminAttributesTemplateProps {
  fetcher: (
    params: DataTableFetchParams,
  ) => Promise<DataTableFetchResult<AttributeItem>>;
  onEditAttribute?: (attribute: AttributeItem) => void;
  onDeleteAttribute?: (attribute: AttributeItem) => void;
  onToggleActive?: (attribute: AttributeItem) => void;
  mutationState?: AdminAttributeMutationState;
  isAttributeMutating?: (id: string) => boolean;
}

export default function AdminAttributesTemplate({
  fetcher,
  onEditAttribute,
  onDeleteAttribute,
  onToggleActive,
  mutationState,
  isAttributeMutating,
}: AdminAttributesTemplateProps) {
  return (
    <div className="space-y-6">
      <AttributeHeader role="admin" />
      <AttributeTable
        fetcher={fetcher}
        onEdit={onEditAttribute}
        onDelete={onDeleteAttribute}
        onToggleActive={onToggleActive}
        mutationState={mutationState}
        isAttributeMutating={isAttributeMutating}
        mode="admin"
      />
    </div>
  );
}
