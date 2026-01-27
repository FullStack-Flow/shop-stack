import { useState } from "react";
import PageHeader from "@/components/base/common/page-header";
import type { CouponFormValues } from "@/types/coupon";
import { AddCouponDialog } from "./add-coupon-dialog";

export interface CouponHeaderProps {
  onAddCoupon?: (data: CouponFormValues) => void;
  role?: "admin" | "vendor";
  showAddButton?: boolean;
  children?: React.ReactNode;
  className?: string;
}

export default function CouponHeader({
  onAddCoupon,
  role = "vendor",
  showAddButton = true,
  children,
  className,
}: CouponHeaderProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const handleAddCoupon = (data: CouponFormValues) => {
    onAddCoupon?.(data);
  };

  return (
    <PageHeader
      title="Coupons"
      description={
        role === "admin"
          ? "Manage platform-wide discount coupons and promotional offers"
          : "Manage your shop's discount coupons and promotional offers"
      }
      className={className}
    >
      {children}
      {showAddButton && (
        <AddCouponDialog
          open={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
          onSubmit={handleAddCoupon}
          role={role}
        />
      )}
    </PageHeader>
  );
}
