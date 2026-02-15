import { createFileRoute } from "@tanstack/react-router";
import { ConfirmDeleteDialog } from "@/components/base/common/confirm-delete-dialog";
import { PageSkeleton } from "@/components/base/common/page-skeleton";
import AdminTagsTemplate from "@/components/templates/admin/admin-tags-template";
import { createAdminTagsFetcher } from "@/hooks/admin/use-admin-entity-fetchers";
import { useAdminTags } from "@/hooks/admin/use-admin-tags";
import { useEntityCRUD } from "@/hooks/common/use-entity-crud";
import type { TagItem } from "@/types/tags";

export const Route = createFileRoute("/(admin)/admin/tags/")({
  component: AdminTagsPage,
  pendingComponent: PageSkeleton,
});

function AdminTagsPage() {
  const fetcher = createAdminTagsFetcher();
  const { toggleActive, deleteTag, mutationState, isTagMutating } =
    useAdminTags();

  const {
    deletingItem: deletingTag,
    setDeletingItem: setDeletingTag,
    handleDelete,
    confirmDelete,
  } = useEntityCRUD<TagItem>({
    onDelete: async (id) => {
      await deleteTag(id);
    },
  });

  const handleToggleActive = async (tag: TagItem) => {
    await toggleActive({ id: tag.id, isActive: !tag.isActive });
  };

  return (
    <>
      <AdminTagsTemplate
        fetcher={fetcher}
        onDelete={handleDelete}
        onToggleActive={handleToggleActive}
        mutationState={mutationState}
        isTagMutating={isTagMutating}
      />

      <ConfirmDeleteDialog
        open={!!deletingTag}
        onOpenChange={(open) => !open && setDeletingTag(null)}
        onConfirm={confirmDelete}
        isDeleting={mutationState.deletingId === deletingTag?.id}
        itemName={deletingTag?.name}
        entityType="tag"
      />
    </>
  );
}
