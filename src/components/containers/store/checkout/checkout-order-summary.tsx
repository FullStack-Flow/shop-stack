import { Link } from "@tanstack/react-router";
import { ArrowRight, Loader2, ShoppingBag, Tag } from "lucide-react";
import { useState } from "react";
import EmptyState from "@/components/base/empty/empty-state";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useCart } from "@/hooks/store/use-cart";
import { useCartStore } from "@/lib/store/cart-store";

interface CheckoutOrderSummaryProps {
  onProceedToPayment?: () => void;
  canProceed?: boolean;
  isProcessing?: boolean;
  onCouponsChange?: (code: string | null) => void;
}

export default function CheckoutOrderSummary({
  onProceedToPayment,
  canProceed = true,
  isProcessing = false,
  onCouponsChange,
}: CheckoutOrderSummaryProps) {
  const { items, subtotal, isLoading: isCartLoading } = useCart();
  const { shippingCost, shippingAddress, shippingMethod } = useCartStore();
  const [couponCode, setCouponCode] = useState("");

  const estimatedTaxes = 5.0; // Mock value
  const total = subtotal + shippingCost + estimatedTaxes;

  // Derive readiness from store state + props
  // If parent controls 'canProceed', respect it.
  // Also check local store requirements.
  const isReady =
    canProceed && !!shippingAddress && !!shippingMethod && items.length > 0;

  if (isCartLoading) {
    return (
      <div className="rounded-lg border bg-background p-6 shadow-sm space-y-4">
        <Skeleton className="h-8 w-1/3 mb-6" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
        <Separator className="my-6" />
        <Skeleton className="h-10 w-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </div>
        <Skeleton className="h-12 w-full mt-4" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-lg border bg-background p-6 shadow-sm">
        <h2 className="mb-6 font-semibold text-xl">Your Cart</h2>
        <EmptyState
          icon={<ShoppingBag className="h-10 w-10 text-muted-foreground" />}
          title="No items yet"
          description="Add items to your cart to continue with checkout."
          action={
            <Link to="/product">
              <Button variant="outline" className="rounded-full">
                Browse Products
              </Button>
            </Link>
          }
          className="py-8"
        />
      </div>
    );
  }
  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-background p-6 shadow-sm">
        <h2 className="mb-6 font-semibold text-xl">Your Cart</h2>

        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="flex gap-4">
              <div className="relative h-20 w-20 rounded-md border bg-muted">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-full w-full rounded-md object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-secondary">
                    <ShoppingBag className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                <div className="-right-2 -top-2 absolute flex h-6 w-6 items-center justify-center rounded-full bg-foreground font-semibold text-background text-xs">
                  {item.quantity}
                </div>
              </div>
              <div className="flex flex-1 items-center justify-between">
                <div className="space-y-1">
                  <h3 className="font-medium text-base leading-tight">
                    {item.name}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {item.variantOptions
                      ? Object.values(item.variantOptions).join(" / ")
                      : ""}
                  </p>
                </div>
                <p className="font-semibold text-lg">
                  ${Number(item.price).toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>

        <Separator className="my-6" />

        <div className="space-y-4">
          <InputGroup>
            <InputGroupAddon align="inline-start">
              <Tag className="h-4 w-4" />
            </InputGroupAddon>
            <InputGroupInput
              placeholder="Add promo code"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
            />
            <InputGroupAddon align="inline-end">
              <InputGroupButton
                variant="ghost"
                onClick={() => onCouponsChange?.(couponCode)}
                disabled={!couponCode}
              >
                Apply
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span className="font-medium">${shippingCost.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Estimated taxes</span>
              <span className="font-medium">${estimatedTaxes.toFixed(2)}</span>
            </div>
          </div>

          <Separator />

          <div className="flex justify-between font-semibold text-lg">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>

          <Button
            className="w-full rounded-full"
            size="lg"
            disabled={!isReady || isProcessing}
            onClick={onProceedToPayment}
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                Continue to Payment
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
