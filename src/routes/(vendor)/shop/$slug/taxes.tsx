import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { ConfirmDeleteDialog } from "@/components/base/common/confirm-delete-dialog";
import { PageSkeleton } from "@/components/base/common/page-skeleton";
import { AddTaxDialog } from "@/components/containers/shared/taxes/add-tax-dialog";
import { ShopTaxesTemplate } from "@/components/templates/vendor/shop-taxes-template";
import { useEntityCRUD } from "@/hooks/common/use-entity-crud";
import { shopBySlugQueryOptions } from "@/hooks/vendors/use-shops";
import { useTaxRates } from "@/hooks/vendors/use-tax-rates";
import { createVendorTaxRatesFetcher } from "@/hooks/vendors/use-vendor-entity-fetchers";
import type { TaxRateFormValues, TaxRateItem } from "@/types/taxes";

export const Route = createFileRoute("/(vendor)/shop/$slug/taxes")({
  component: TaxesPage,
  pendingComponent: PageSkeleton,
});

function TaxesPage() {
  const { slug } = Route.useParams();

  const { data: shopData } = useSuspenseQuery(shopBySlugQueryOptions(slug));
  const shopId = shopData?.shop?.id ?? "";

  const fetcher = useMemo(() => createVendorTaxRatesFetcher(shopId), [shopId]);

  const {
    createTaxRate,
    updateTaxRate,
    deleteTaxRate,
    toggleTaxRateActive,
    mutationState,
    isTaxRateMutating,
    isCreating,
    isUpdating,
  } = useTaxRates(shopId);

  const {
    isDialogOpen,
    setIsDialogOpen,
    editingItem: editingTax,
    deletingItem: deletingTax,
    setDeletingItem: setDeletingTax,
    handleAdd: handleAddTax,
    handleEdit: handleEditTax,
    handleDelete: handleDeleteTax,
    confirmDelete,
    handleDialogClose,
  } = useEntityCRUD<TaxRateItem>({
    onDelete: async (id) => {
      await deleteTaxRate(id);
    },
  });

  const handleTaxSubmit = async (data: TaxRateFormValues) => {
    try {
      if (editingTax) {
        await updateTaxRate({
          id: editingTax.id,
          name: data.name,
          rate: data.rate,
          country: data.country,
          state: data.state,
          zip: data.zip,
          priority: data.priority,
          isActive: data.isActive,
          isCompound: data.isCompound,
        });
      } else {
        await createTaxRate({
          name: data.name,
          rate: data.rate,
          country: data.country,
          state: data.state,
          zip: data.zip,
          priority: data.priority,
          isActive: data.isActive || false,
          isCompound: data.isCompound || false,
        });
      }
      handleDialogClose();
    } catch (error) {
      console.error("Failed to save tax rate:", error);
    }
  };

  return (
    <>
      <ShopTaxesTemplate
        fetcher={fetcher}
        onAddTax={handleAddTax}
        onEdit={handleEditTax}
        onDelete={handleDeleteTax}
        onToggleActive={toggleTaxRateActive}
        mutationState={mutationState}
        isTaxMutating={isTaxRateMutating}
      />

      <AddTaxDialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) handleDialogClose();
        }}
        onSubmit={handleTaxSubmit}
        isSubmitting={isCreating || isUpdating}
        initialValues={
          editingTax
            ? {
                name: editingTax.name,
                rate: Number(editingTax.rate),
                country: editingTax.country,
                state: editingTax.state,
                zip: editingTax.zip,
                priority: Number(editingTax.priority),
                isActive: editingTax.isActive,
                isCompound: editingTax.isCompound,
              }
            : undefined
        }
      />

      <ConfirmDeleteDialog
        open={!!deletingTax}
        onOpenChange={(open) => !open && setDeletingTax(null)}
        onConfirm={confirmDelete}
        itemName={deletingTax?.name}
        entityType="tax rate"
      />
    </>
  );
}
