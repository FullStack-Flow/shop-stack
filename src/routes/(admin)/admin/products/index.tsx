import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { ConfirmDeleteDialog } from "@/components/base/common/confirm-delete-dialog";
import { PageSkeleton } from "@/components/base/common/page-skeleton";
import type { ProductMutationState } from "@/components/containers/vendors/products/product-table-columns";
import AdminProductsTemplate from "@/components/templates/admin/admin-products-template";
import { createAdminProductsFetcher } from "@/hooks/admin/use-admin-entity-fetchers";
import { useAdminProducts } from "@/hooks/admin/use-admin-products";
import { useEntityCRUD } from "@/hooks/common/use-entity-crud";
import type { ProductItem } from "@/types/products";

export const Route = createFileRoute("/(admin)/admin/products/")({
  component: AdminProductsPage,
  pendingComponent: PageSkeleton,
});

function AdminProductsPage() {
  const fetcher = createAdminProductsFetcher();
  const { deleteProduct, mutationState, isProductMutating } =
    useAdminProducts();

  const {
    deletingItem: deletingProduct,
    setDeletingItem: setDeletingProduct,
    handleDelete: handleDeleteProduct,
    confirmDelete,
  } = useEntityCRUD<ProductItem>({
    onDelete: async (id) => {
      await deleteProduct(id);
    },
  });

  const productMutationState: ProductMutationState = {
    deletingId: mutationState.deletingId,
    updatingId: mutationState.updatingId,
    togglingId: mutationState.togglingId,
  };

  const handleEditProduct = (product: ProductItem) => {
    toast.info(`Edit "${product.name}" is not available yet.`);
  };

  return (
    <>
      <AdminProductsTemplate
        fetcher={fetcher}
        onEdit={handleEditProduct}
        onDelete={handleDeleteProduct}
        mutationState={productMutationState}
        isProductMutating={isProductMutating}
      />

      <ConfirmDeleteDialog
        open={!!deletingProduct}
        onOpenChange={(open) => !open && setDeletingProduct(null)}
        onConfirm={confirmDelete}
        isDeleting={mutationState.deletingId === deletingProduct?.id}
        itemName={deletingProduct?.name}
        entityType="product"
      />
    </>
  );
}
