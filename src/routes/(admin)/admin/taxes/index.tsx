import { createFileRoute } from "@tanstack/react-router";
import { ConfirmDeleteDialog } from "@/components/base/common/confirm-delete-dialog";
import { PageSkeleton } from "@/components/base/common/page-skeleton";
import AdminTaxesTemplate from "@/components/templates/admin/admin-taxes-template";
import { createAdminTaxRatesFetcher } from "@/hooks/admin/use-admin-entity-fetchers";
import { useAdminTaxRates } from "@/hooks/admin/use-admin-taxes";
import { useEntityCRUD } from "@/hooks/common/use-entity-crud";
import type { TaxRateItem } from "@/types/taxes";

export const Route = createFileRoute("/(admin)/admin/taxes/")({
  component: AdminTaxesPage,
  pendingComponent: PageSkeleton,
});

function AdminTaxesPage() {
  const fetcher = createAdminTaxRatesFetcher();
  const { toggleActive, deleteTaxRate, mutationState, isTaxRateMutating } =
    useAdminTaxRates();

  const {
    deletingItem: deletingTaxRate,
    setDeletingItem: setDeletingTaxRate,
    handleDelete,
    confirmDelete,
  } = useEntityCRUD<TaxRateItem>({
    onDelete: async (id) => {
      await deleteTaxRate(id);
    },
  });

  const handleToggleActive = async (taxRate: TaxRateItem) => {
    await toggleActive({ id: taxRate.id, isActive: !taxRate.isActive });
  };

  return (
    <>
      <AdminTaxesTemplate
        fetcher={fetcher}
        onDeleteTax={handleDelete}
        onToggleActive={handleToggleActive}
        mutationState={mutationState}
        isTaxMutating={isTaxRateMutating}
      />

      <ConfirmDeleteDialog
        open={!!deletingTaxRate}
        onOpenChange={(open) => !open && setDeletingTaxRate(null)}
        onConfirm={confirmDelete}
        isDeleting={mutationState.deletingId === deletingTaxRate?.id}
        itemName={deletingTaxRate?.name}
        entityType="tax rate"
      />
    </>
  );
}
