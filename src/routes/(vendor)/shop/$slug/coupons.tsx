import { AddCouponDialog } from "@/components/containers/vendors/coupons/add-coupon-dialog";
import ShopCouponsTemplate from "@/components/templates/vendor/shop-coupons-template";
import { mockCoupons } from "@/data/coupons";
import { Coupon, CouponFormValues } from "@/types/coupon";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/(vendor)/shop/$slug/coupons")({
  component: CouponsPage,
});

function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>(mockCoupons);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleAddCoupon = () => {
    setIsDialogOpen(true);
  };

  const handleCouponSubmit = (data: CouponFormValues) => {
    const newCoupon: Coupon = {
      id: String(coupons.length + 1),
      code: data.code,
      description: data.description,
      type: data.type,
      discountAmount: data.discountAmount,
      minimumCartAmount: data.minimumCartAmount,
      activeFrom: data.activeFrom,
      activeTo: data.activeTo,
      status: data.status,
      usageLimit: data.usageLimit,
      usageCount: 0,
      image: data.image
        ? URL.createObjectURL(data.image[0])
        : `https://placehold.co/100?text=${data.code}`,
    };

    setCoupons([...coupons, newCoupon]);
    console.log("Created coupon:", newCoupon);
  };

  return (
    <>
      <ShopCouponsTemplate coupons={coupons} onAddCoupon={handleAddCoupon} />

      <AddCouponDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={handleCouponSubmit}
      />
    </>
  );
}
