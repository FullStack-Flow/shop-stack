import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useCart } from "@/hooks/store/use-cart";
import { getAvailableShippingMethods } from "@/lib/functions/store/shipping";
import { useCartStore } from "@/lib/store/cart-store";
import { cn } from "@/lib/utils";

export default function ShippingMethodSelector() {
  const { items } = useCart();
  const { shippingMethod, setShippingMethod } = useCartStore();

  const productIds = items.map((item) => item.productId);

  const {
    data: availableMethods,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["available-shipping-methods", productIds],
    queryFn: () => getAvailableShippingMethods({ data: { productIds } }),
    enabled: productIds.length > 0,
  });

  // Auto-select the first method if none selected or current selection is invalid
  useEffect(() => {
    if (availableMethods && availableMethods.length > 0) {
      const currentIsValid =
        shippingMethod &&
        availableMethods.some((m) => m.id === shippingMethod.id);

      if (!currentIsValid) {
        // Convert to CartShippingMethod format
        const firstMethod = availableMethods[0];
        setShippingMethod({
          id: firstMethod.id,
          name: firstMethod.name,
          price: Number(firstMethod.price),
          duration: firstMethod.duration,
        });
      }
    }
  }, [availableMethods, shippingMethod, setShippingMethod]);

  if (items.length === 0) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="font-semibold text-xl">Shipping Method</h2>
        <div className="flex h-24 items-center justify-center rounded-lg border bg-muted/50">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h2 className="font-semibold text-xl">Shipping Method</h2>
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
          Failed to load shipping methods. Please try again.
        </div>
      </div>
    );
  }

  if (!availableMethods || availableMethods.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="font-semibold text-xl">Shipping Method</h2>
        <div className="rounded-lg border bg-muted/50 p-4 text-muted-foreground">
          No shipping methods available for these items.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="font-semibold text-xl">Shipping Method</h2>

      <RadioGroup
        value={shippingMethod?.id}
        onValueChange={(value) => {
          const selected = availableMethods.find((m) => m.id === value);
          if (selected) {
            setShippingMethod({
              id: selected.id,
              name: selected.name,
              price: Number(selected.price),
              duration: selected.duration,
            });
          }
        }}
        className="grid gap-4"
      >
        {availableMethods.map((method) => (
          <div
            key={method.id}
            className={cn(
              "relative flex items-center space-x-3 rounded-lg border border-input p-4 transition-colors hover:border-primary/50",
              shippingMethod?.id === method.id && "border-primary bg-primary/5",
            )}
          >
            <RadioGroupItem value={method.id} id={method.id} />
            <Label
              htmlFor={method.id}
              className="flex flex-1 cursor-pointer items-center justify-between"
            >
              <div className="space-y-1">
                <p className="font-medium text-sm">{method.name}</p>
                <p className="text-muted-foreground text-xs">
                  {method.duration}
                </p>
              </div>
              <p className="font-semibold text-lg">
                ${Number(method.price).toFixed(2)}
              </p>
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
}
