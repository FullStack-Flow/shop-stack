import { createFileRoute } from "@tanstack/react-router";
import { ConfirmDeleteDialog } from "@/components/base/common/confirm-delete-dialog";
import { PageSkeleton } from "@/components/base/common/page-skeleton";
import AdminCouponsTemplate from "@/components/templates/admin/admin-coupons-template";
import { useAdminCoupons } from "@/hooks/admin/use-admin-coupons";
import { createAdminCouponsFetcher } from "@/hooks/admin/use-admin-entity-fetchers";
import { useEntityCRUD } from "@/hooks/common/use-entity-crud";
import type { CouponItem } from "@/types/coupons";

export const Route = createFileRoute("/(admin)/admin/coupons/")({
  component: AdminCouponsPage,
  pendingComponent: PageSkeleton,
});

function AdminCouponsPage() {
  const fetcher = createAdminCouponsFetcher();

  const { toggleActive, deleteCoupon, mutationState, isCouponMutating } =
    useAdminCoupons();

  const {
    deletingItem: deletingCoupon,
    setDeletingItem: setDeletingCoupon,
    handleDelete: handleDeleteCoupon,
    confirmDelete,
  } = useEntityCRUD<CouponItem>({
    onDelete: async (id) => {
      await deleteCoupon(id);
    },
  });

  const handleToggleStatus = async (coupon: CouponItem) => {
    await toggleActive({ id: coupon.id, isActive: !coupon.isActive });
  };

  return (
    <>
      <AdminCouponsTemplate
        fetcher={fetcher}
        onDeleteCoupon={handleDeleteCoupon}
        onToggleStatus={handleToggleStatus}
        mutationState={mutationState}
        isCouponMutating={isCouponMutating}
      />

      <ConfirmDeleteDialog
        open={!!deletingCoupon}
        onOpenChange={(open) => !open && setDeletingCoupon(null)}
        onConfirm={confirmDelete}
        isDeleting={mutationState.deletingId === deletingCoupon?.id}
        itemName={deletingCoupon?.code}
        entityType="coupon"
      />
    </>
  );
}
