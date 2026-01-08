import TagHeader from "@/components/containers/shared/tags/tag-header";
import TagsTable from "@/components/containers/shared/tags/tag-table";
import { VENDOR_TAG_PERMISSIONS } from "@/lib/config/tag-permissions";
import type { Tag } from "@/types/tags";

interface ShopTagsTemplateProps {
  tags: Tag[];
  onAddTag?: (data: any) => void;
  onEditTag?: (tagId: string) => void;
  onDeleteTag?: (tagId: string) => void;
}

export default function ShopTagsTemplate({
  tags,
  onAddTag,
  onEditTag,
  onDeleteTag,
}: ShopTagsTemplateProps) {
  return (
    <div className="space-y-6">
      <TagHeader role="vendor" onAddTag={onAddTag} showAddButton={!!onAddTag} />
      <TagsTable
        tags={tags}
        permissions={VENDOR_TAG_PERMISSIONS}
        onEditTag={onEditTag}
        onDeleteTag={onDeleteTag}
      />
    </div>
  );
}
