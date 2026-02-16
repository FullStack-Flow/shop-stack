import { useQuery } from "@tanstack/react-query";
import { Check, Plus } from "lucide-react";
import { useState } from "react";
import ShippingAddressForm from "@/components/base/store/checkout/shipping-address-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { addressesQueryOptions } from "@/hooks/store/use-address";
import { cn } from "@/lib/utils";
import type { ShippingAddressInput } from "@/lib/validators/shipping-address";

interface CheckoutAddressSectionProps {
  type?: "shipping" | "billing";
  title?: string;
  isAuthenticated?: boolean;
  selectedAddress: ShippingAddressInput | null;
  onSelectAddress: (address: ShippingAddressInput) => void;
  userInfo?: {
    name?: string | null;
    email?: string | null;
  };
}

export function CheckoutAddressSection({
  title,
  isAuthenticated = false,
  selectedAddress,
  onSelectAddress,
  userInfo,
}: CheckoutAddressSectionProps) {
  const { data, isLoading } = useQuery(addressesQueryOptions());
  const addresses = data?.addresses || [];
  const [isAddingNew, setIsAddingNew] = useState(false);

  // Auto-select default if not selected
  // ... logic ...

  const handleAddressSelect = (address: any) => {
    // Map backend address to ShippingAddressInput
    const mappedAddress: ShippingAddressInput = {
      firstName: address.firstName || "",
      lastName: address.lastName || "",
      email: address.email || "", // Assuming email is available or optional in input
      phone: address.phone || "",
      countryCode: address.country,
      street: address.street,
      city: address.city,
      state: address.state,
      zipCode: address.zip,
      description: address.description,
    };
    onSelectAddress(mappedAddress);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-9 w-24" />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-40 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  // If not authenticated, show form directly (guest checkout)
  if (!isAuthenticated) {
    return (
      <div className="space-y-4">
        <h2 className="font-semibold text-xl">{title || "Shipping Address"}</h2>
        <ShippingAddressForm
          onAddressSelect={onSelectAddress}
          initialValues={
            selectedAddress ||
            (userInfo
              ? {
                  firstName: userInfo.name?.split(" ")[0] || "",
                  lastName: userInfo.name?.split(" ").slice(1).join(" ") || "",
                  email: userInfo.email || "",
                  street: "",
                }
              : null)
          }
        />
      </div>
    );
  }

  // If no addresses or explicitly adding new, show form
  if (addresses.length === 0 || isAddingNew) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-xl">
            {addresses.length === 0
              ? title || "Shipping Address"
              : "Add New Address"}
          </h2>
          {addresses.length > 0 && (
            <Button
              variant="ghost"
              onClick={() => setIsAddingNew(false)}
              size="sm"
            >
              Cancel
            </Button>
          )}
        </div>
        <ShippingAddressForm
          onAddressSelect={(addr) => {
            onSelectAddress(addr);
            setIsAddingNew(false);
          }}
          initialValues={selectedAddress}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-xl">{title || "Shipping Address"}</h2>
        <Button
          onClick={() => setIsAddingNew(true)}
          size="sm"
          className="gap-2"
        >
          <Plus className="size-4" />
          Add New
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {addresses.map((address) => {
          const isSelected =
            selectedAddress?.zipCode === address.zip &&
            selectedAddress?.street === address.street; // Simple equality check, might need ID if available in ShippingAddressInput

          return (
            <div
              key={address.id}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  handleAddressSelect(address);
                }
              }}
              className={cn(
                "group relative flex cursor-pointer flex-col gap-4 rounded-xl border bg-card p-5 text-card-foreground shadow-sm transition-all hover:border-primary/40 hover:shadow-md outline-none focus-visible:ring-2 focus-visible:ring-primary",
                isSelected && "border-primary ring-1 ring-primary",
              )}
              onClick={() => handleAddressSelect(address)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    variant={
                      address.type === "billing" ? "default" : "secondary"
                    }
                    className="capitalize"
                  >
                    {address.type}
                  </Badge>
                  {address.isDefault && (
                    <Badge variant="outline" className="border-primary/50">
                      Default
                    </Badge>
                  )}
                </div>
                {isSelected && (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Check className="h-4 w-4" />
                  </div>
                )}
              </div>

              <div className="space-y-1 text-sm">
                <div className="font-medium text-base">{address.title}</div>
                <div className="text-muted-foreground">{address.street}</div>
                <div className="text-muted-foreground">
                  {address.city}, {address.state} {address.zip}
                </div>
                <div className="text-muted-foreground">{address.country}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
