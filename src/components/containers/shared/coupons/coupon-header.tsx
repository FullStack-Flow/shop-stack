import { createEntityHeader } from "@/components/base/common/entity-header";

export const CouponHeader = createEntityHeader({
  entityName: "Coupon",
  entityNamePlural: "Coupons",
  adminDescription: "Manage coupons across the platform",
  vendorDescription: "Manage your coupons and organization",
});

export default CouponHeader;
export type { EntityHeaderProps as CouponHeaderProps } from "@/components/base/common/entity-header";
