import { AddTagDialog } from "@/components/containers/vendors/tags/add-tag-dialog";
import ShopTagsTemplate from "@/components/templates/vendor/shop-tags-template";
import { mockTags } from "@/data/tags";
import { Tag } from "@/types/tags";
import { TagFormValues } from "@/types/tag-form";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/(vendor)/shop/$slug/tags")({
  component: TagsPage,
});

function TagsPage() {
  const [tags, setTags] = useState<Tag[]>(mockTags);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleAddTag = () => {
    setIsDialogOpen(true);
  };

  const handleTagSubmit = (data: TagFormValues) => {
    const newTag: Tag = {
      id: String(tags.length + 1),
      name: data.name,
      slug: data.name.toLowerCase().replace(/\s+/g, "-"),
      description: data.description,
      productCount: 0,
    };

    setTags([...tags, newTag]);
    console.log("Created tag:", newTag);
  };

  return (
    <>
      <ShopTagsTemplate tags={tags} onAddTag={handleAddTag} />

      <AddTagDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={handleTagSubmit}
      />
    </>
  );
}
