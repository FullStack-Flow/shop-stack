import { Plus } from "lucide-react";
import PageHeader from "@/components/base/common/page-header";
import { Button } from "@/components/ui/button";

interface CouponHeaderProps {
  onAddCoupon: () => void;
  className?: string;
}

export default function CouponHeader({
  onAddCoupon,
  className,
}: CouponHeaderProps) {
  return (
    <PageHeader
      title="Coupons"
      description="Manage your discount coupons and promotional codes"
      className={className}
    >
      <Button onClick={onAddCoupon}>
        <Plus className="mr-2 size-4" />
        Add Coupon
      </Button>
    </PageHeader>
  );
}
