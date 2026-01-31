import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { ConfirmDeleteDialog } from "@/components/base/common/confirm-delete-dialog";
import { PageSkeleton } from "@/components/base/common/page-skeleton";
import { AddBrandDialog } from "@/components/containers/shared/brands/add-brand-dialog";
import { ShopBrandsTemplate } from "@/components/templates/vendor/shop-brands-template";
import { useEntityCRUD } from "@/hooks/common/use-entity-crud";
import { useBrands } from "@/hooks/vendors/use-brands";
import { shopBySlugQueryOptions } from "@/hooks/vendors/use-shops";
import { createVendorBrandsFetcher } from "@/hooks/vendors/use-vendor-entity-fetchers";
import type { BrandFormValues, BrandItem } from "@/types/brands";

export const Route = createFileRoute("/(vendor)/shop/$slug/brands")({
  component: BrandsPage,
  pendingComponent: PageSkeleton,
});

function BrandsPage() {
  const { slug } = Route.useParams();

  const { data: shopData } = useSuspenseQuery(shopBySlugQueryOptions(slug));
  const shopId = shopData?.shop?.id ?? "";

  const fetcher = useMemo(() => createVendorBrandsFetcher(shopId), [shopId]);

  const {
    createBrand,
    isCreating,
    updateBrand,
    isUpdating,
    deleteBrand,
    mutationState,
    isBrandMutating,
  } = useBrands(shopId);

  const {
    isDialogOpen,
    setIsDialogOpen,
    editingItem: editingBrand,
    deletingItem: deletingBrand,
    setDeletingItem: setDeletingBrand,
    handleAdd: handleAddBrand,
    handleEdit: handleEditBrand,
    handleDelete: handleDeleteBrand,
    confirmDelete,
    handleDialogClose,
  } = useEntityCRUD<BrandItem>({
    onDelete: async (id) => {
      await deleteBrand(id);
    },
  });

  const handleBrandSubmit = async (data: BrandFormValues) => {
    try {
      if (editingBrand) {
        await updateBrand({
          id: editingBrand.id,
          name: data.name,
          slug: data.slug,
          description: data.description || undefined,
          website: data.website || undefined,
          logo: data.logo || undefined,
        });
      } else {
        await createBrand({
          name: data.name,
          slug: data.slug,
          description: data.description || undefined,
          website: data.website || undefined,
          logo: data.logo || undefined,
          sortOrder: 0,
          isActive: true,
        });
      }
      handleDialogClose();
    } catch (error) {
      console.error("Failed to save brand:", error);
    }
  };

  return (
    <>
      <ShopBrandsTemplate
        fetcher={fetcher}
        onAddBrand={handleAddBrand}
        onEditBrand={handleEditBrand}
        onDeleteBrand={handleDeleteBrand}
        mutationState={mutationState}
        isBrandMutating={isBrandMutating}
      />

      <AddBrandDialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) handleDialogClose();
        }}
        onSubmit={handleBrandSubmit}
        isSubmitting={isCreating || isUpdating}
        initialValues={
          editingBrand
            ? {
                name: editingBrand.name,
                slug: editingBrand.slug,
                description: editingBrand.description ?? "",
                logo: editingBrand.logo ?? null,
                website: editingBrand.website ?? "",
              }
            : null
        }
      />

      <ConfirmDeleteDialog
        open={!!deletingBrand}
        onOpenChange={(open) => !open && setDeletingBrand(null)}
        onConfirm={confirmDelete}
        itemName={deletingBrand?.name}
        entityType="brand"
      />
    </>
  );
}
