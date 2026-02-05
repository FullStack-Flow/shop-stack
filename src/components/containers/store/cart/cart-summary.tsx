import { Link } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, Loader2, Tag, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { type CartItemResponse, useCart } from "@/hooks/store/use-cart";
import { validateStoreCoupon } from "@/lib/functions/store/coupon";
import type { ValidateCouponResponse } from "@/types/coupons";

interface AppliedCoupon {
  shopId: string;
  shopName: string;
  code: string;
  discountAmount: number;
  type: "percentage" | "fixed" | "free_shipping";
  discountValue: number;
}

interface ShopItemGroup {
  shopId: string;
  shopName: string;
  items: CartItemResponse[];
  subtotal: number;
}

export default function CartSummary() {
  const { items, subtotal, isLoading, clearCart, isClearing } = useCart();
  const [couponCode, setCouponCode] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [appliedCoupons, setAppliedCoupons] = useState<AppliedCoupon[]>([]);

  // Group items by shop for coupon validation
  const itemsByShop = items.reduce<Record<string, ShopItemGroup>>(
    (acc, item) => {
      if (!acc[item.shopId]) {
        acc[item.shopId] = {
          shopId: item.shopId,
          shopName: item.shopName,
          items: [],
          subtotal: 0,
        };
      }
      acc[item.shopId].items.push(item);
      acc[item.shopId].subtotal += item.price * item.quantity;
      return acc;
    },
    {},
  );

  const shopIds = Object.keys(itemsByShop);

  // Calculate total discount from all applied coupons
  const totalDiscount = appliedCoupons.reduce(
    (sum, coupon) => sum + coupon.discountAmount,
    0,
  );

  // Calculate delivery fee (could be more sophisticated based on shipping options)
  const deliveryFee = items.length > 0 ? 15 : 0;

  // Check if free shipping coupon is applied
  const hasFreeShipping = appliedCoupons.some(
    (coupon) => coupon.type === "free_shipping",
  );
  const finalDeliveryFee = hasFreeShipping ? 0 : deliveryFee;

  // Calculate final total
  const total = subtotal - totalDiscount + finalDeliveryFee;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }

    // Check if this coupon is already applied to any shop
    const alreadyApplied = appliedCoupons.some(
      (c) => c.code.toLowerCase() === couponCode.toLowerCase(),
    );
    if (alreadyApplied) {
      toast.error("This coupon is already applied");
      return;
    }

    setIsValidating(true);

    try {
      // Try to validate coupon for each shop until we find a match
      let validationResult: ValidateCouponResponse | null = null;
      let validShopId: string | null = null;
      let validShopName: string | null = null;

      for (const shopId of shopIds) {
        const shopData = itemsByShop[shopId];

        // Check if this shop already has a coupon applied
        const shopHasCoupon = appliedCoupons.some((c) => c.shopId === shopId);
        if (shopHasCoupon) {
          continue;
        }

        try {
          const result = await validateStoreCoupon({
            data: {
              code: couponCode,
              shopId: shopId,
              cartAmount: shopData.subtotal.toString(),
              cartItems: shopData.items.map((item) => ({
                productId: item.productId,
                quantity: item.quantity,
                price: item.price.toString(),
              })),
            },
          });

          if (result.valid) {
            validationResult = result;
            validShopId = shopId;
            validShopName = shopData.shopName;
            break;
          }
        } catch {}
      }

      if (validationResult?.valid && validShopId) {
        const newCoupon: AppliedCoupon = {
          shopId: validShopId,
          shopName: validShopName || "Unknown Store",
          code: couponCode.toUpperCase(),
          discountAmount: validationResult.discountAmount || 0,
          type: validationResult.coupon?.type || "percentage",
          discountValue: parseFloat(
            validationResult.coupon?.discountAmount || "0",
          ),
        };

        setAppliedCoupons((prev) => [...prev, newCoupon]);
        setCouponCode("");
        toast.success(validationResult.message || "Coupon applied!");
      } else {
        // Find the most helpful error message
        let errorMessage = "Invalid coupon code";
        if (shopIds.length === 0) {
          errorMessage = "Your cart is empty";
        } else if (
          appliedCoupons.length === shopIds.length &&
          shopIds.length > 0
        ) {
          errorMessage = "All shops already have a coupon applied";
        }
        toast.error(errorMessage);
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to validate coupon";
      toast.error(message);
    } finally {
      setIsValidating(false);
    }
  };

  const handleRemoveCoupon = (couponCode: string) => {
    setAppliedCoupons((prev) => prev.filter((c) => c.code !== couponCode));
    toast.success("Coupon removed");
  };

  if (isLoading) {
    return (
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <Skeleton className="mb-6 h-6 w-32" />
        <div className="space-y-4">
          <div className="flex justify-between">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-16" />
          </div>
          <div className="flex justify-between">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-16" />
          </div>
          <div className="flex justify-between">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-16" />
          </div>
          <Skeleton className="my-4 h-px w-full" />
          <div className="flex justify-between">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-20" />
          </div>
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-12 w-full rounded-full" />
        </div>
      </div>
    );
  }

  if (items.length === 0) return null;

  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm">
      <h2 className="mb-6 font-semibold text-lg">Order Summary</h2>

      <div className="space-y-4">
        <div className="flex justify-between">
          <span className="text-muted-foreground">
            Subtotal ({items.length} {items.length === 1 ? "item" : "items"})
          </span>
          <span className="font-medium">${subtotal.toFixed(2)}</span>
        </div>

        {/* Applied Coupons */}
        {appliedCoupons.length > 0 && (
          <div className="space-y-2">
            {appliedCoupons.map((coupon) => (
              <div
                key={coupon.code}
                className="flex items-center justify-between rounded-md bg-green-50 p-2 text-green-700 dark:bg-green-950/30 dark:text-green-400"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="font-medium text-sm">{coupon.code}</span>
                  <span className="text-muted-foreground text-xs">
                    ({coupon.shopName})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">
                    -${coupon.discountAmount.toFixed(2)}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground hover:text-destructive"
                    onClick={() => handleRemoveCoupon(coupon.code)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {totalDiscount > 0 && (
          <div className="flex justify-between text-green-600">
            <span className="text-muted-foreground">Discount</span>
            <span className="font-medium">-${totalDiscount.toFixed(2)}</span>
          </div>
        )}

        <div className="flex justify-between">
          <span className="text-muted-foreground">Delivery Fee</span>
          <span className="font-medium">
            {finalDeliveryFee === 0 ? (
              <span className="text-green-600">Free</span>
            ) : (
              `$${finalDeliveryFee.toFixed(2)}`
            )}
          </span>
        </div>

        <Separator />

        <div className="flex justify-between font-bold text-lg">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>

        {/* Coupon Input */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <InputGroup>
              <InputGroupAddon align="inline-start">
                <Tag className="h-4 w-4" />
              </InputGroupAddon>
              <InputGroupInput
                placeholder="Enter coupon code..."
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleApplyCoupon();
                  }
                }}
                disabled={isValidating}
              />
              <InputGroupAddon align="inline-end">
                <InputGroupButton
                  variant="ghost"
                  disabled={!couponCode.trim() || isValidating}
                  onClick={handleApplyCoupon}
                >
                  {isValidating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Apply"
                  )}
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
          </div>
          {shopIds.length > 1 && (
            <p className="text-muted-foreground text-xs">
              💡 Coupons are shop-specific. You can apply one coupon per shop.
            </p>
          )}
        </div>

        <Link to="/checkout">
          <Button className="w-full rounded-full" size="lg">
            Go to Checkout
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>

        <Button
          variant="outline"
          className="mt-4 w-full rounded-full"
          size="lg"
          onClick={() => {
            clearCart();
            setAppliedCoupons([]);
          }}
          disabled={isClearing}
        >
          {isClearing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Clearing...
            </>
          ) : (
            "Clear Cart"
          )}
        </Button>
      </div>
    </div>
  );
}
