import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useCallback } from "react";
import { ConfirmDeleteDialog } from "@/components/base/common/confirm-delete-dialog";
import { PageSkeleton } from "@/components/base/common/page-skeleton";
import type { DataTableFetchParams } from "@/components/base/data-table/types";
import { AddShippingDialog } from "@/components/containers/shared/shipping/add-shipping-dialog";
import ShopShippingTemplate from "@/components/templates/vendor/shop-shipping-template";
import { useEntityCRUD } from "@/hooks/common/use-entity-crud";
import { useShipping } from "@/hooks/common/use-shipping";
import { shopBySlugQueryOptions } from "@/hooks/vendors/use-shops";
import { getShippingMethods } from "@/lib/functions/shipping";
import type { CreateShippingMethodInput } from "@/lib/validators/shipping";
import type { ShippingMethodItem } from "@/types/shipping";

export const Route = createFileRoute("/(vendor)/shop/$slug/shipping")({
  component: ShippingPage,
  pendingComponent: PageSkeleton,
  loader: async ({ context: { queryClient }, params: { slug } }) => {
    await queryClient.ensureQueryData(shopBySlugQueryOptions(slug));
  },
});

function ShippingPage() {
  const { slug } = Route.useParams();
  const {
    data: { shop },
  } = useSuspenseQuery(shopBySlugQueryOptions(slug));

  const {
    createShipping,
    updateShipping,
    deleteShipping,
    mutationState,
    isShippingMutating,
  } = useShipping(shop.id);

  const fetcher = useCallback(
    async (params: DataTableFetchParams) => {
      const { pageIndex, pageSize, globalFilter, sorting, columnFilters } =
        params;
      const offset = pageIndex * pageSize;

      const sort = sorting?.[0];
      const sortBy = (sort?.id as any) || "createdAt";
      const sortDirection = sort?.desc ? "desc" : "asc";

      const isActiveFilter = columnFilters?.find((f) => f.id === "isActive");
      const isActive = isActiveFilter
        ? Array.isArray(isActiveFilter.value)
          ? isActiveFilter.value.includes("true")
          : isActiveFilter.value === "true"
        : undefined;

      const result = await getShippingMethods({
        data: {
          shopId: shop.id,
          limit: pageSize,
          offset,
          search: globalFilter,
          sortBy,
          sortDirection,
          isActive,
        },
      });

      return {
        rows: result.data,
        pageCount: Math.ceil(result.total / pageSize),
        total: result.total,
      };
    },
    [shop.id],
  );

  const {
    isDialogOpen,
    setIsDialogOpen,
    editingItem: editingShipping,
    deletingItem: deletingShipping,
    setDeletingItem: setDeletingShipping,
    handleAdd: handleAddShipping,
    handleEdit: handleEditShipping,
    handleDelete: handleDeleteShipping,
    confirmDelete,
    handleDialogClose,
  } = useEntityCRUD<ShippingMethodItem>({
    onDelete: async (id) => {
      await deleteShipping(id);
    },
  });

  const handleShippingSubmit = async (
    data: Omit<CreateShippingMethodInput, "shopId">,
  ) => {
    try {
      if (editingShipping) {
        await updateShipping({
          ...data,
          id: editingShipping.id,
        });
      } else {
        await createShipping(data);
      }
      handleDialogClose();
    } catch (error) {
      console.error("Failed to save shipping method:", error);
    }
  };

  return (
    <>
      <ShopShippingTemplate
        fetcher={fetcher}
        onAddShipping={handleAddShipping}
        onDelete={handleDeleteShipping}
        onEdit={handleEditShipping}
        mutationState={mutationState}
        isShippingMutating={isShippingMutating}
      />

      <AddShippingDialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) handleDialogClose();
        }}
        onSubmit={handleShippingSubmit}
        isSubmitting={mutationState.isAnyMutating}
        initialValues={
          editingShipping
            ? {
                name: editingShipping.name,
                price: Number(editingShipping.price),
                duration: editingShipping.duration,
                description: editingShipping.description || "",
                isActive: editingShipping.isActive,
              }
            : null
        }
      />

      <ConfirmDeleteDialog
        open={!!deletingShipping}
        onOpenChange={(open) => !open && setDeletingShipping(null)}
        onConfirm={confirmDelete}
        isDeleting={mutationState.deletingId === deletingShipping?.id}
        itemName={deletingShipping?.name}
        entityType="shipping method"
      />
    </>
  );
}
