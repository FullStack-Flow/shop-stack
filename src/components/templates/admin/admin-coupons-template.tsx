import type {
  DataTableFetchParams,
  DataTableFetchResult,
} from "@/components/base/data-table/types";
import CouponHeader from "@/components/containers/shared/coupons/coupon-header";
import { AdminCouponTable } from "@/components/containers/shared/coupons/coupon-table";
import type { AdminCouponMutationState } from "@/hooks/admin/use-admin-coupons";
import { ADMIN_COUPON_PERMISSIONS } from "@/lib/config/coupon-permissions";
import type { CouponItem } from "@/types/coupons";

interface AdminCouponsTemplateProps {
  fetcher: (
    params: DataTableFetchParams,
  ) => Promise<DataTableFetchResult<CouponItem>>;
  onDeleteCoupon?: (coupon: CouponItem) => void;
  onToggleStatus?: (coupon: CouponItem) => void;
  mutationState?: AdminCouponMutationState;
  isCouponMutating?: (id: string) => boolean;
}

export default function AdminCouponsTemplate({
  fetcher,
  onDeleteCoupon,
  onToggleStatus,
  mutationState,
  isCouponMutating,
}: AdminCouponsTemplateProps) {
  return (
    <>
      <CouponHeader role="admin" showAddButton={false} />
      <AdminCouponTable
        fetcher={fetcher}
        permissions={ADMIN_COUPON_PERMISSIONS}
        onDelete={onDeleteCoupon}
        onToggleStatus={onToggleStatus}
        mutationState={mutationState}
        isCouponMutating={isCouponMutating}
      />
    </>
  );
}
