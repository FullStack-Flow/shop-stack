import { useForm } from "@tanstack/react-form";
import { useQuery } from "@tanstack/react-query";
import { BookUser } from "lucide-react";
import { useCallback, useEffect } from "react";
import { ShippingAddressFields } from "@/components/containers/store/checkout/shipping-address-fields";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { addressesQueryOptions } from "@/hooks/store/use-address";
import {
  type ShippingAddressInput,
  shippingAddressSchema,
} from "@/lib/validators/shipping-address";

interface ShippingAddressFormProps {
  onAddressSelect: (address: ShippingAddressInput) => void;
  initialValues?: Partial<ShippingAddressInput> | null;
}

export default function ShippingAddressForm({
  onAddressSelect,
  initialValues,
}: ShippingAddressFormProps) {
  const { data, isLoading } = useQuery(addressesQueryOptions());
  const addresses = data?.addresses || [];

  const form = useForm({
    defaultValues: {
      firstName: initialValues?.firstName || "",
      lastName: initialValues?.lastName || "",
      email: initialValues?.email || "",
      phone: initialValues?.phone || "",
      countryCode: initialValues?.countryCode || "BD",
      street: initialValues?.street || "",
      city: initialValues?.city || "",
      state: initialValues?.state || "",
      zipCode: initialValues?.zipCode || "",
      description: initialValues?.description || "",
    } as ShippingAddressInput,
    validators: {
      onSubmit: shippingAddressSchema,
    },
    onSubmit: async ({ value }) => {
      onAddressSelect(value);
    },
  });

  const handleFillAddress = useCallback(
    (addr: any) => {
      form.setFieldValue("firstName", addr.firstName || "");
      form.setFieldValue("lastName", addr.lastName || "");
      form.setFieldValue("phone", addr.phone || "");
      form.setFieldValue("countryCode", addr.country);
      form.setFieldValue("street", addr.street || "");
      form.setFieldValue("city", addr.city);
      form.setFieldValue("state", addr.state);
      form.setFieldValue("zipCode", addr.zip);
    },
    [form],
  );

  // Auto-fill default if available and form is pristine
  useEffect(() => {
    if (
      !isLoading &&
      addresses.length > 0 &&
      !initialValues &&
      !form.state.isTouched
    ) {
      const defaultAddr = addresses.find((a) => a.isDefault) || addresses[0];
      handleFillAddress(defaultAddr);
    }
  }, [
    isLoading,
    addresses,
    initialValues,
    form.state.isTouched,
    handleFillAddress,
  ]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-xl">Shipping Address</h2>
        {addresses.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <BookUser className="mr-2 h-4 w-4" />
                Auto-fill
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {addresses.map((addr) => (
                <DropdownMenuItem
                  key={addr.id}
                  onClick={() => handleFillAddress(addr)}
                >
                  {addr.title}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="space-y-6"
      >
        <ShippingAddressFields form={form as any} />
        <Button
          type="submit"
          className="w-full"
          disabled={form.state.isSubmitting}
        >
          Save & Continue
        </Button>
      </form>
    </div>
  );
}
