export type {
  CouponFormValues,
  CouponItem as Coupon,
  CouponPermissions,
} from "./coupons";

export interface AppliedCoupon {
  shopId: string;
  code: string;
  discountAmount: number;
}
