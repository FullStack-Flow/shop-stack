import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { ConfirmDeleteDialog } from "@/components/base/common/confirm-delete-dialog";
import { PageSkeleton } from "@/components/base/common/page-skeleton";
import { AddCouponDialog } from "@/components/containers/shared/coupons/add-coupon-dialog";
import ShopCouponsTemplate from "@/components/templates/vendor/shop-coupons-template";
import { useEntityCRUD } from "@/hooks/common/use-entity-crud";
import { useCouponMutations } from "@/hooks/vendors/use-coupons";
import { shopBySlugQueryOptions } from "@/hooks/vendors/use-shops";
import { createVendorCouponsFetcher } from "@/hooks/vendors/use-vendor-entity-fetchers";
import type { CouponFormValues } from "@/lib/validators/shared/coupon-query";
import type { CouponItem } from "@/types/coupons";

export const Route = createFileRoute("/(vendor)/shop/$slug/coupons")({
  component: CouponsPage,
  pendingComponent: PageSkeleton,
});

function CouponsPage() {
  const { slug } = Route.useParams();

  // Get shop data to retrieve shopId
  const { data: shopData } = useSuspenseQuery(shopBySlugQueryOptions(slug));
  const shopId = shopData?.shop?.id ?? "";

  // Create fetcher for server-side pagination
  const fetcher = useMemo(() => createVendorCouponsFetcher(shopId), [shopId]);

  // Get coupon mutations
  const {
    createCoupon,
    updateCoupon,
    deleteCoupon,
    mutationState,
    isCouponMutating,
  } = useCouponMutations(shopId);

  // Use shared CRUD hook
  const {
    isDialogOpen: isAddCouponDialogOpen,
    setIsDialogOpen: setIsAddCouponDialogOpen,
    editingItem: editingCoupon,
    deletingItem: deletingCoupon,
    setDeletingItem: setDeletingCoupon,
    handleAdd: handleAddCoupon,
    handleEdit: handleEditCoupon,
    handleDelete: handleDeleteCoupon,
    confirmDelete,
    handleDialogClose,
  } = useEntityCRUD<CouponItem>({
    onDelete: async (id) => {
      await deleteCoupon(id);
    },
  });

  const handleCouponSubmit = async (data: CouponFormValues) => {
    try {
      if (editingCoupon) {
        await updateCoupon({
          id: editingCoupon.id,
          code: data.code,
          description: data.description || undefined,
          type: data.type,
          discountAmount: data.discountAmount,
          minimumCartAmount: data.minimumCartAmount,
          maximumDiscountAmount: data.maximumDiscountAmount || undefined,
          activeFrom: data.activeFrom,
          activeTo: data.activeTo,
          usageLimit: data.usageLimit || undefined,
          usageLimitPerUser: data.usageLimitPerUser,
          isActive: data.isActive,
          applicableTo: data.applicableTo,
          productIds: data.productIds,
          categoryIds: data.categoryIds,
        });
      } else {
        await createCoupon({
          code: data.code,
          description: data.description || undefined,
          type: data.type,
          discountAmount: data.discountAmount,
          minimumCartAmount: data.minimumCartAmount,
          maximumDiscountAmount: data.maximumDiscountAmount || undefined,
          activeFrom: data.activeFrom,
          activeTo: data.activeTo,
          usageLimit: data.usageLimit || undefined,
          usageLimitPerUser: data.usageLimitPerUser,
          isActive: data.isActive,
          applicableTo: data.applicableTo,
          productIds: data.productIds,
          categoryIds: data.categoryIds,
        });
      }
      handleDialogClose();
    } catch (error) {
      // Error is handled by the mutation's onError callback
      console.error("Failed to save coupon:", error);
    }
  };

  return (
    <>
      <ShopCouponsTemplate
        fetcher={fetcher}
        onAddCoupon={handleAddCoupon}
        onEditCoupon={handleEditCoupon}
        onDeleteCoupon={handleDeleteCoupon}
        mutationState={mutationState}
        isCouponMutating={isCouponMutating}
      />

      <AddCouponDialog
        open={isAddCouponDialogOpen}
        onOpenChange={(open) => {
          if (!open) handleDialogClose();
          else setIsAddCouponDialogOpen(open);
        }}
        onSubmit={handleCouponSubmit}
        isSubmitting={mutationState.isAnyMutating}
        initialValues={editingCoupon}
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
