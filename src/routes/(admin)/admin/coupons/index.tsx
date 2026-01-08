import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import AdminCouponsTemplate from "@/components/templates/admin/admin-coupons-template";
import { mockCoupons } from "@/data/coupons";
import type { Coupon, CouponFormValues } from "@/types/coupon";

export const Route = createFileRoute("/(admin)/admin/coupons/")({
  component: AdminCouponsPage,
});

function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>(mockCoupons);

  const handleCouponStatusChange = (
    couponId: string,
    newStatus: "active" | "expired" | "inactive"
  ) => {
    setCoupons(
      coupons.map((coupon) =>
        coupon.id === couponId ? { ...coupon, status: newStatus } : coupon
      )
    );
  };

  const handleAddCoupon = (data: CouponFormValues) => {
    const newCoupon: Coupon = {
      id: Date.now().toString(),
      image: data.image
        ? URL.createObjectURL(data.image[0])
        : `https://placehold.co/100?text=${data.code}`,
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
    };
    setCoupons([...coupons, newCoupon]);
  };

  return (
    <AdminCouponsTemplate
      coupons={coupons}
      onCouponStatusChange={handleCouponStatusChange}
      onAddCoupon={handleAddCoupon}
    />
  );
}
