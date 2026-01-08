import { Clock, RotateCcw, Truck } from 'lucide-react';
import { cn } from '@/lib/utils';
import ShippingInfoItem from './shipping-info-item';

interface ShippingInfoSectionProps {
  shipping: {
    freeShipping: boolean;
    deliveryTime: string;
    policy: string;
  };
  className?: string;
}

export default function ShippingInfoSection({
  shipping,
  className,
}: ShippingInfoSectionProps) {
  return (
    <div className={cn('space-y-4 border-t pt-4', className)}>
      {shipping.freeShipping && (
        <ShippingInfoItem
          icon={Truck}
          label="Free Shipping & Returns"
          value="On all orders over $50"
          detailsLink="/shipping-policy"
        />
      )}

      <ShippingInfoItem
        icon={Clock}
        label="Delivery"
        value={`Estimated delivery: ${shipping.deliveryTime}`}
      />

      <ShippingInfoItem
        icon={RotateCcw}
        label="Return Policy"
        value={shipping.policy}
        detailsLink="/return-policy"
      />
    </div>
  );
}
