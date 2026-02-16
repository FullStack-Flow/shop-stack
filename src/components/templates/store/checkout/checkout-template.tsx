import { Link } from "@tanstack/react-router";
import { ShoppingBag } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { BreadcrumbNav } from "@/components/base/common/breadcrumb-nav";
import NotFound from "@/components/base/empty/notfound";
import { StripePaymentDialog } from "@/components/base/store/checkout/stripe-payment-dialog";
import { CheckoutAddressSection } from "@/components/containers/store/checkout/checkout-address-section";
import CheckoutOrderSummary from "@/components/containers/store/checkout/checkout-order-summary";
import ShippingMethodSelector from "@/components/containers/store/checkout/shipping-method-selector";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useCart } from "@/hooks/store/use-cart";
import { useCreateCheckoutSession } from "@/hooks/store/use-checkout";
import { useSession } from "@/lib/auth/auth-client";
import { validateStoreCoupon } from "@/lib/functions/store/coupon";
import { useCartStore } from "@/lib/store/cart-store";
import type { ShippingAddressInput } from "@/lib/validators/shipping-address";
import type { CartItemResponse } from "@/types/cart";
import type { AppliedCoupon } from "@/types/coupon";
import type { ValidateCouponResponse } from "@/types/coupons";
import type { CheckoutSessionData } from "@/types/orders";

type ShopItemGroup = {
  shopId: string;
  items: CartItemResponse[];
  subtotal: number;
};

export default function CheckoutTemplate() {
  const { data: session, isPending: isSessionLoading } = useSession();
  const isAuthenticated = !!session;
  const { shippingMethod, setShippingAddress } = useCartStore();
  const { items, isLoading: isCartLoading } = useCart();

  const [selectedShippingAddress, setSelectedShippingAddress] =
    useState<ShippingAddressInput | null>(null);
  const [selectedBillingAddress, setSelectedBillingAddress] =
    useState<ShippingAddressInput | null>(null);
  const [appliedCoupons, setAppliedCoupons] = useState<AppliedCoupon[]>([]);
  const [useSameForBilling, setUseSameForBilling] = useState(true);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [checkoutSession, setCheckoutSession] =
    useState<CheckoutSessionData | null>(null);

  const isLoading = isSessionLoading || isCartLoading;

  const createCheckoutSession = useCreateCheckoutSession({
    onSuccess: (data) => {
      setCheckoutSession(data);
      setShowPaymentDialog(true);
    },
  });

  const getGuestSessionId = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("cart-guest-session-id") || undefined;
    }
    return undefined;
  };

  // Sync with store when selection changes
  const handleShippingAddressSelect = (address: ShippingAddressInput) => {
    setSelectedShippingAddress(address);
    setShippingAddress(address);
  };

  const checkoutSteps = [
    { label: "Cart", href: "/cart" },
    { label: "Shipping", href: "#", isActive: true },
  ];

  const sessionEmail = session?.user?.email?.trim() || "";
  const mapAddress = (address: ShippingAddressInput) => ({
    firstName: address.firstName,
    lastName: address.lastName,
    email: address.email?.trim() || sessionEmail,
    phone: address.phone,
    street: address.street,
    city: address.city,
    state: address.state,
    zip: address.zipCode,
    country: address.countryCode,
  });

  const handleProceedToPayment = async () => {
    if (!selectedShippingAddress) {
      toast.error("Please select or enter a shipping address");
      return;
    }

    if (!useSameForBilling && !selectedBillingAddress) {
      toast.error("Please select or enter a billing address");
      return;
    }

    if (!shippingMethod) {
      toast.error("Please select a shipping method");
      return;
    }

    const shippingAddress = mapAddress(selectedShippingAddress);
    const billingAddress =
      useSameForBilling || !selectedBillingAddress
        ? undefined
        : mapAddress(selectedBillingAddress);

    // Create checkout session
    createCheckoutSession.mutate({
      sessionId: getGuestSessionId(),
      shippingAddress,
      billingAddress,
      useSameBillingAddress: useSameForBilling,
      shippingMethod: shippingMethod.id,
      couponCodes: appliedCoupons.length > 0 ? appliedCoupons : undefined,
    });
  };

  const handleCouponsChange = async (code: string | null) => {
    const couponCode = code?.trim();
    if (!couponCode) {
      toast.error("Please enter a coupon code");
      return;
    }

    if (
      appliedCoupons.some(
        (coupon) => coupon.code.toLowerCase() === couponCode.toLowerCase(),
      )
    ) {
      toast.error("This coupon is already applied");
      return;
    }

    const itemsByShop = items.reduce<Record<string, ShopItemGroup>>(
      (acc, item: CartItemResponse) => {
        if (!acc[item.shopId]) {
          acc[item.shopId] = {
            shopId: item.shopId,
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
    let validationResult: ValidateCouponResponse | null = null;
    let validShopId: string | null = null;

    for (const shopId of shopIds) {
      const shopData = itemsByShop[shopId];

      const shopHasCoupon = appliedCoupons.some(
        (coupon) => coupon.shopId === shopId,
      );
      if (shopHasCoupon) {
        continue;
      }

      try {
        const result = await validateStoreCoupon({
          data: {
            code: couponCode,
            shopId,
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
          break;
        }
      } catch {}
    }

    if (validationResult?.valid && validShopId) {
      const newCoupon: AppliedCoupon = {
        shopId: validShopId,
        code: couponCode.toUpperCase(),
        discountAmount: validationResult.discountAmount || 0,
      };

      setAppliedCoupons((prev) => [...prev, newCoupon]);
      toast.success(validationResult.message || "Coupon applied!");
      return;
    }

    let errorMessage = "Invalid coupon code";
    if (shopIds.length === 0) {
      errorMessage = "Your cart is empty";
    } else if (appliedCoupons.length === shopIds.length && shopIds.length > 0) {
      errorMessage = "All shops already have a coupon applied";
    }
    toast.error(errorMessage);
  };

  const handleRemoveCoupon = (code: string) => {
    setAppliedCoupons((prev) => prev.filter((c) => c.code !== code));
    toast.success("Coupon removed");
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="@container container mx-auto px-4 py-8">
        <div className="mb-8">
          <Skeleton className="h-6 w-48" />
        </div>
        <div className="grid @5xl:grid-cols-12 gap-8">
          <div className="@5xl:col-span-7 space-y-8">
            <div className="rounded-lg border p-6">
              <Skeleton className="mb-6 h-6 w-40" />
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <Skeleton className="h-10 w-full" />
                <div className="grid grid-cols-3 gap-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            </div>
            <div className="rounded-lg border p-6">
              <Skeleton className="mb-4 h-6 w-32" />
              <div className="space-y-3">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            </div>
          </div>
          <div className="@5xl:col-span-5">
            <div className="rounded-lg border p-6">
              <Skeleton className="mb-6 h-6 w-24" />
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-4">
                    <Skeleton className="h-20 w-20" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Empty cart state
  if (items.length === 0) {
    return (
      <div className="@container container mx-auto px-4 py-8">
        <NotFound
          icon={<ShoppingBag className="h-12 w-12 text-muted-foreground" />}
          title="Your cart is empty"
          description="Add some items to your cart before proceeding to checkout."
        >
          <Link to="/product">
            <Button size="lg" className="rounded-full">
              Continue Shopping
            </Button>
          </Link>
        </NotFound>
      </div>
    );
  }

  return (
    <>
      <div className="@container container mx-auto px-4 py-8">
        <BreadcrumbNav items={checkoutSteps} className="mb-8" />

        {/* Main Content */}
        <div className="grid gap-8 @5xl:grid-cols-12">
          <div className="space-y-8 @5xl:col-span-7">
            <CheckoutAddressSection
              type="shipping"
              title="Shipping Address"
              isAuthenticated={isAuthenticated}
              selectedAddress={selectedShippingAddress}
              onSelectAddress={handleShippingAddressSelect}
              userInfo={{
                name: session?.user?.name,
                email: session?.user?.email,
              }}
            />

            {/* Billing Address Option */}
            <div className="rounded-lg border bg-card p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <Checkbox
                  id="same-billing"
                  checked={useSameForBilling}
                  onCheckedChange={(checked) =>
                    setUseSameForBilling(checked === true)
                  }
                />
                <Label htmlFor="same-billing" className="cursor-pointer">
                  Use same address for billing
                </Label>
              </div>
            </div>

            {/* Billing Address Section (if different) */}
            {!useSameForBilling && (
              <CheckoutAddressSection
                type="billing"
                title="Billing Address"
                isAuthenticated={isAuthenticated}
                selectedAddress={selectedBillingAddress}
                onSelectAddress={setSelectedBillingAddress}
                userInfo={{
                  name: session?.user?.name,
                  email: session?.user?.email,
                }}
              />
            )}

            {/* Shipping Method */}
            <ShippingMethodSelector />
          </div>

          {/* Right Column - Order Summary */}
          <div className="@5xl:col-span-5">
            <CheckoutOrderSummary
              onProceedToPayment={handleProceedToPayment}
              canProceed={
                !!selectedShippingAddress &&
                (useSameForBilling || !!selectedBillingAddress)
              }
              isProcessing={createCheckoutSession.isPending}
              onCouponsChange={handleCouponsChange}
              appliedCoupons={appliedCoupons}
              onRemoveCoupon={handleRemoveCoupon}
            />
          </div>
        </div>
      </div>

      <StripePaymentDialog
        open={showPaymentDialog}
        onOpenChange={setShowPaymentDialog}
        checkoutSession={checkoutSession}
      />
    </>
  );
}
