import TagsHeader from "@/components/containers/vendors/tags/tags-header";
import TagsTable from "@/components/containers/vendors/tags/tags-table";
import { Tag } from "@/types/tags";

interface ShopTagsTemplateProps {
  tags: Tag[];
  onAddTag: () => void;
}

export default function ShopTagsTemplate({
  tags,
  onAddTag,
}: ShopTagsTemplateProps) {
  return (
    <div className="space-y-6">
      <TagsHeader onAddTag={onAddTag} />
      <TagsTable tags={tags} />
    </div>
  );
}