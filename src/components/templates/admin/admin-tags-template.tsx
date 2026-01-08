import { useState } from "react";
import { AddTagDialog } from "@/components/containers/shared/tags/add-tag-dialog";
import TagHeader from "@/components/containers/shared/tags/tag-header";
import TagsTable from "@/components/containers/shared/tags/tag-table";
import { ADMIN_TAG_PERMISSIONS } from "@/lib/config/tag-permissions";
import type { Tag } from "@/types/tags";

interface AdminTagsTemplateProps {
  tags: Tag[];
  onAddTag: (data: { name: string; description: string }) => void;
  onDeleteTag: (tagId: string) => void;
}

export default function AdminTagsTemplate({
  tags,
  onAddTag,
  onDeleteTag,
}: AdminTagsTemplateProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  return (
    <div className="space-y-6">
      <TagHeader>
        <AddTagDialog
          open={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
          onSubmit={onAddTag}
        />
      </TagHeader>
      <TagsTable
        tags={tags}
        permissions={ADMIN_TAG_PERMISSIONS}
        onDeleteTag={onDeleteTag}
      />
    </div>
  );
}
