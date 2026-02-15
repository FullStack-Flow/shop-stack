import { createFileRoute } from "@tanstack/react-router";
import { ConfirmDeleteDialog } from "@/components/base/common/confirm-delete-dialog";
import { PageSkeleton } from "@/components/base/common/page-skeleton";
import { AddAttributeDialog } from "@/components/containers/shared/attributes/add-attribute-dialog";
import AdminAttributesTemplate from "@/components/templates/admin/admin-attributes-template";
import { useAdminAttributes } from "@/hooks/admin/use-admin-attributes";
import { createAdminAttributesFetcher } from "@/hooks/admin/use-admin-entity-fetchers";
import { useEntityCRUD } from "@/hooks/common/use-entity-crud";
import type { AttributeFormValues, AttributeItem } from "@/types/attributes";

export const Route = createFileRoute("/(admin)/admin/attributes/")({
  component: AdminAttributesPage,
  pendingComponent: PageSkeleton,
});

function AdminAttributesPage() {
  const fetcher = createAdminAttributesFetcher();

  const {
    toggleActive,
    deleteAttribute,
    updateAttribute,
    mutationState,
    isAttributeMutating,
    isUpdating,
  } = useAdminAttributes();

  const {
    isDialogOpen,
    setIsDialogOpen,
    editingItem: editingAttribute,
    deletingItem: deletingAttribute,
    setDeletingItem: setDeletingAttribute,
    handleEdit: handleEditAttribute,
    handleDelete: handleDeleteAttribute,
    confirmDelete,
    handleDialogClose,
  } = useEntityCRUD<AttributeItem>({
    onDelete: async (id) => {
      await deleteAttribute(id);
    },
  });

  const handleToggleActive = async (attribute: AttributeItem) => {
    await toggleActive({ id: attribute.id, isActive: !attribute.isActive });
  };

  const handleAttributeSubmit = async (data: AttributeFormValues) => {
    if (!editingAttribute) return;
    try {
      await updateAttribute({
        id: editingAttribute.id,
        name: data.name,
        slug: data.slug,
        type: data.type,
        values: data.values,
      });
      handleDialogClose();
    } catch (error) {
      console.error("Failed to update attribute:", error);
    }
  };

  return (
    <>
      <AdminAttributesTemplate
        fetcher={fetcher}
        onEditAttribute={handleEditAttribute}
        onDeleteAttribute={handleDeleteAttribute}
        onToggleActive={handleToggleActive}
        mutationState={mutationState}
        isAttributeMutating={isAttributeMutating}
      />

      <AddAttributeDialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) handleDialogClose();
        }}
        onSubmit={handleAttributeSubmit}
        isSubmitting={isUpdating}
        role="admin"
        initialValues={
          editingAttribute
            ? {
                name: editingAttribute.name,
                slug: editingAttribute.slug,
                type: editingAttribute.type,
                values: (editingAttribute.values || []).map((value) => ({
                  id: value.id,
                  name: value.name,
                  slug: value.slug,
                  value: value.value || "",
                })),
              }
            : null
        }
      />

      <ConfirmDeleteDialog
        open={!!deletingAttribute}
        onOpenChange={(open) => !open && setDeletingAttribute(null)}
        onConfirm={confirmDelete}
        isDeleting={mutationState.deletingId === deletingAttribute?.id}
        itemName={deletingAttribute?.name}
        entityType="attribute"
      />
    </>
  );
}
