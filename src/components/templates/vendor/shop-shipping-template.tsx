import ShippingHeader from '@/components/containers/shared/shipping/shipping-header';
import ShippingTable from '@/components/containers/shared/shipping/shipping-table';
import { VENDOR_SHIPPING_PERMISSIONS } from '@/lib/config/shipping-permissions';
import type { ShippingMethod } from '@/types/shipping';

interface ShopShippingTemplateProps {
  shippingMethods: ShippingMethod[];
  onAddShipping?: (data: any) => void;
  onEditShipping?: (shippingId: string) => void;
  onDeleteShipping?: (shippingId: string) => void;
}

export default function ShopShippingTemplate({
  shippingMethods,
  onAddShipping,
  onEditShipping,
  onDeleteShipping,
}: ShopShippingTemplateProps) {
  return (
    <div className="space-y-6">
      <ShippingHeader
        role="vendor"
        onAddShipping={onAddShipping}
        showAddButton={!!onAddShipping}
      />
      <ShippingTable
        shippingMethods={shippingMethods}
        permissions={VENDOR_SHIPPING_PERMISSIONS}
        onEditShipping={onEditShipping}
        onDeleteShipping={onDeleteShipping}
      />
    </div>
  );
}
