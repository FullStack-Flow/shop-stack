import CouponHeader from '@/components/containers/shared/coupons/coupon-header';
import CouponTable from '@/components/containers/shared/coupons/coupon-table';
import { VENDOR_COUPON_PERMISSIONS } from '@/lib/config/coupon-permissions';
import type { Coupon, CouponFormValues } from '@/types/coupon';

interface ShopCouponsTemplateProps {
  coupons: Coupon[];
  onAddCoupon?: (data: CouponFormValues) => void;
  onDeleteCoupon?: (couponId: string) => void;
  onEditCoupon?: (couponId: string) => void;
  onToggleStatus?: (couponId: string, currentStatus: string) => void;
}

export default function ShopCouponsTemplate({
  coupons,
  onAddCoupon,
  onDeleteCoupon,
  onEditCoupon,
  onToggleStatus,
}: ShopCouponsTemplateProps) {
  return (
    <div className="space-y-6">
      <CouponHeader
        onAddCoupon={onAddCoupon}
        role="vendor"
        showAddButton={!!onAddCoupon}
      />
      <CouponTable
        coupons={coupons}
        permissions={VENDOR_COUPON_PERMISSIONS}
        onDeleteCoupon={onDeleteCoupon}
        onEditCoupon={onEditCoupon}
        onToggleStatus={onToggleStatus}
      />
    </div>
  );
}
