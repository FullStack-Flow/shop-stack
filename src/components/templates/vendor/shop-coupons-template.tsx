import type {
  DataTableFetchParams,
  DataTableFetchResult,
} from "@/components/base/data-table/types";
import CouponHeader from "@/components/containers/shared/coupons/coupon-header";
import CouponTable from "@/components/containers/shared/coupons/coupon-table";
import type { CouponItem, CouponMutationState } from "@/types/coupons";

interface ShopCouponsTemplateProps {
  fetcher: (
    params: DataTableFetchParams,
  ) => Promise<DataTableFetchResult<CouponItem>>;
  onAddCoupon: () => void;
  onEditCoupon?: (coupon: CouponItem) => void;
  onDeleteCoupon?: (coupon: CouponItem) => void;
  mutationState?: CouponMutationState;
  isCouponMutating?: (id: string) => boolean;
}

export default function ShopCouponsTemplate({
  fetcher,
  onAddCoupon,
  onEditCoupon,
  onDeleteCoupon,
  mutationState,
  isCouponMutating,
}: ShopCouponsTemplateProps) {
  return (
    <div className="space-y-6">
      <CouponHeader onAdd={onAddCoupon} />
      <CouponTable
        fetcher={fetcher}
        onEdit={onEditCoupon}
        onDelete={onDeleteCoupon}
        mutationState={mutationState}
        isCouponMutating={isCouponMutating}
      />
    </div>
  );
}
