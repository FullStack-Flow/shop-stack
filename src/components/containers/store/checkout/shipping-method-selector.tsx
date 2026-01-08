import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useCartStore } from '@/lib/store/cart-store';

export default function ShippingMethodSelector() {
  const { shippingMethod, setShippingMethod } = useCartStore();
  return (
    <div className="space-y-4">
      <h2 className="font-semibold text-xl">Shipping Method</h2>

      <RadioGroup
        value={shippingMethod}
        onValueChange={(value) =>
          setShippingMethod(value as 'free' | 'express')
        }
        className="grid gap-4"
      >
        <div className="relative flex items-center space-x-3 rounded-lg border border-input p-4 transition-colors hover:border-primary/50 has-data-state-checked:border-primary">
          <RadioGroupItem value="free" id="free" />
          <Label
            htmlFor="free"
            className="flex flex-1 cursor-pointer items-center justify-between"
          >
            <div className="space-y-1">
              <p className="font-medium text-sm">Free Shipping</p>
              <p className="text-muted-foreground text-xs"> 7-20 Days</p>
            </div>
            <p className="font-semibold text-lg">$0</p>
          </Label>
        </div>

        <div className="relative flex items-center space-x-3 rounded-lg border border-input p-4 transition-colors hover:border-primary/50 has-data-[state=checked]:border-primary">
          <RadioGroupItem value="express" id="express" />
          <Label
            htmlFor="express"
            className="flex flex-1 cursor-pointer items-center justify-between"
          >
            <div className="space-y-1">
              <p className="font-medium text-sm">Express Shipping</p>
              <p className="text-muted-foreground text-xs">1-3 Days</p>
            </div>
            <p className="font-semibold text-lg">$9</p>
          </Label>
        </div>
      </RadioGroup>
    </div>
  );
}
