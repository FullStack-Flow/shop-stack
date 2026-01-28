import type {
  DataTableFetchParams,
  DataTableFetchResult,
} from "@/components/base/data-table/types";
import TagHeader from "@/components/containers/shared/tags/tag-header";
import TagTable from "@/components/containers/shared/tags/tag-table";
import type {
  TagMutationState,
  TagTableActions,
} from "@/components/containers/shared/tags/tag-table-columns";
import type { TagItem } from "@/types/tags";

interface ShopTagsTemplateProps extends TagTableActions {
  fetcher: (
    params: DataTableFetchParams,
  ) => Promise<DataTableFetchResult<TagItem>>;
  mutationState?: TagMutationState;
  isTagMutating?: (id: string) => boolean;
  onAddTag?: () => void;
  showAddButton?: boolean;
}

export function ShopTagsTemplate({
  fetcher,
  onAddTag,
  onEdit,
  onDelete,
  onToggleActive,
  mutationState,
  isTagMutating,
  showAddButton = true,
}: ShopTagsTemplateProps) {
  return (
    <div className="space-y-6">
      <TagHeader onAdd={onAddTag} role="vendor" showAddButton={showAddButton} />
      <TagTable
        fetcher={fetcher}
        onEdit={onEdit}
        onDelete={onDelete}
        onToggleActive={onToggleActive}
        mutationState={mutationState}
        isTagMutating={isTagMutating}
        mode="vendor"
      />
    </div>
  );
}
