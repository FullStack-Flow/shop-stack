import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { BreadcrumbNav } from "@/components/base/common/breadcrumb-nav";
import { CheckoutAddressSection } from "@/components/containers/store/checkout/checkout-address-section";
import CheckoutOrderSummary from "@/components/containers/store/checkout/checkout-order-summary";
import ShippingMethodSelector from "@/components/containers/store/checkout/shipping-method-selector";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useSession } from "@/lib/auth/auth-client";
import { useCartStore } from "@/lib/store/cart-store";
import type { ShippingAddressInput } from "@/lib/validators/shipping-address";

export default function CheckoutTemplate() {
  const { data: session } = useSession();
  const isAuthenticated = !!session;
  const { setShippingAddress } = useCartStore();

  const [selectedShippingAddress, setSelectedShippingAddress] =
    useState<ShippingAddressInput | null>(null);
  const [selectedBillingAddress, setSelectedBillingAddress] =
    useState<ShippingAddressInput | null>(null);
  const [useSameForBilling, setUseSameForBilling] = useState(true);

  // Sync with store when selection changes
  const handleShippingAddressSelect = (address: ShippingAddressInput) => {
    setSelectedShippingAddress(address);
    setShippingAddress(address);
  };

  const checkoutSteps = [
    { label: "Cart", href: "/cart" },
    { label: "Shipping", href: "#", isActive: true },
  ];

  // Placeholder for checkout mutation
  const createCheckoutSession = useMutation({
    mutationFn: async (data: any) => {
      // TODO: Implement actual checkout session creation
      console.log("Creating checkout session with:", data);
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Mock delay
      return { url: "/success" };
    },
    onSuccess: (_data) => {
      // window.location.href = data.url;
    },
  });

  const handleProceedToPayment = () => {
    if (!selectedShippingAddress) return;

    createCheckoutSession.mutate({
      shippingAddress: selectedShippingAddress,
      billingAddress: useSameForBilling
        ? selectedShippingAddress
        : selectedBillingAddress,
      // Add other necessary data
    });
  };

  const handleCouponsChange = (couponCode: string | null) => {
    // TODO: Implement coupon handling
    console.log("Coupon changed:", couponCode);
  };

  return (
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
          />
        </div>
      </div>
    </div>
  );
}
