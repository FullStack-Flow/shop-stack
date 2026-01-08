import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import AdminTagsTemplate from '@/components/templates/admin/admin-tags-template';
import { mockTags } from '@/data/tags';
import type { Tag } from '@/types/tags';

export const Route = createFileRoute('/(admin)/admin/tags/')({
  component: AdminTagsPage,
});

function AdminTagsPage() {
  const [tags, setTags] = useState<Tag[]>(mockTags);

  const handleAddTag = (newTagData: { name: string; description: string }) => {
    const newTag: Tag = {
      id: Date.now().toString(),
      name: newTagData.name,
      slug: newTagData.name.toLowerCase().replace(/\s+/g, '-'),
      description: newTagData.description,
      productCount: 0,
    };
    setTags([...tags, newTag]);
  };

  const handleDeleteTag = (tagId: string) => {
    setTags(tags.filter((tag) => tag.id !== tagId));
  };

  return (
    <AdminTagsTemplate
      tags={tags}
      onAddTag={handleAddTag}
      onDeleteTag={handleDeleteTag}
    />
  );
}
