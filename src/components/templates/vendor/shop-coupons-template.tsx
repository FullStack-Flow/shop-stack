import CouponHeader from "@/components/containers/vendors/coupons/coupon-header";
import CouponTable from "@/components/containers/vendors/coupons/coupon-table";
import { Coupon } from "@/types/coupon";

interface ShopCouponsTemplateProps {
  coupons: Coupon[];
  onAddCoupon: () => void;
}

export default function ShopCouponsTemplate({
  coupons,
  onAddCoupon,
}: ShopCouponsTemplateProps) {
  return (
    <div className="space-y-6">
      <CouponHeader onAddCoupon={onAddCoupon} />
      <CouponTable coupons={coupons} />
    </div>
  );
}