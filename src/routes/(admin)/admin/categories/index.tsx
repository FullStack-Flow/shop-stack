import { createFileRoute } from "@tanstack/react-router";
import { ConfirmDeleteDialog } from "@/components/base/common/confirm-delete-dialog";
import { PageSkeleton } from "@/components/base/common/page-skeleton";
import AdminCategoriesTemplate from "@/components/templates/admin/admin-categories-template";
import { useAdminCategories } from "@/hooks/admin/use-admin-categories";
import { createAdminCategoriesFetcher } from "@/hooks/admin/use-admin-entity-fetchers";
import { useEntityCRUD } from "@/hooks/common/use-entity-crud";
import type { NormalizedCategory } from "@/types/category-types";

export const Route = createFileRoute("/(admin)/admin/categories/")({
  component: AdminCategoriesPage,
  pendingComponent: PageSkeleton,
});

function AdminCategoriesPage() {
  const fetcher = createAdminCategoriesFetcher();

  const {
    toggleActive,
    toggleFeatured,
    deleteCategory,
    mutationState,
    isCategoryMutating,
  } = useAdminCategories();

  const {
    deletingItem: deletingCategory,
    setDeletingItem: setDeletingCategory,
    handleDelete: handleDeleteCategory,
    confirmDelete,
  } = useEntityCRUD<NormalizedCategory>({
    onDelete: async (id) => {
      await deleteCategory(id);
    },
  });

  const _handleToggleActive = async (category: NormalizedCategory) => {
    await toggleActive({ id: category.id, isActive: !category.isActive });
  };

  const _handleToggleFeatured = async (category: NormalizedCategory) => {
    await toggleFeatured({ id: category.id, featured: !category.featured });
  };

  return (
    <>
      <AdminCategoriesTemplate
        fetcher={fetcher}
        onEditCategory={undefined}
        onDeleteCategory={handleDeleteCategory}
        onToggleActive={_handleToggleActive}
        onToggleFeatured={_handleToggleFeatured}
        mutationState={mutationState}
        isCategoryMutating={isCategoryMutating}
      />

      <ConfirmDeleteDialog
        open={!!deletingCategory}
        onOpenChange={(open) => !open && setDeletingCategory(null)}
        onConfirm={confirmDelete}
        isDeleting={mutationState.deletingId === deletingCategory?.id}
        itemName={deletingCategory?.name}
        entityType="category"
      />
    </>
  );
}
