import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import AdminTagsTemplate from "@/components/templates/admin/admin-tags-template";
import { mockTags } from "@/data/tags";
import type { TagFormValues, TagItem } from "@/types/tags";

export const Route = createFileRoute("/(admin)/admin/tags/")({
  component: AdminTagsPage,
});

function AdminTagsPage() {
  const [tags, setTags] = useState<TagItem[]>(mockTags);

  const handleAddTag = (newTagData: TagFormValues) => {
    const now = new Date().toISOString();
    const newTag: TagItem = {
      id: Date.now().toString(),
      shopId: "1",
      name: newTagData.name,
      slug: newTagData.slug || newTagData.name.toLowerCase().replace(/\s+/g, "-"),
      description: newTagData.description ?? null,
      sortOrder: tags.length,
      isActive: newTagData.isActive ?? true,
      productCount: 0,
      createdAt: now,
      updatedAt: now,
    };
    setTags([...tags, newTag]);
  };

  const handleDeleteTag = (tag: TagItem) => {
    setTags(tags.filter((t) => t.id !== tag.id));
  };

  return (
    <AdminTagsTemplate
      tags={tags}
      onAddTag={handleAddTag}
      onDeleteTag={handleDeleteTag}
    />
  );
}
