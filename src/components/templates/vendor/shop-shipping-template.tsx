import ShippingHeader from "@/components/containers/vendors/shipping/shipping-header";
import ShippingTable from "@/components/containers/vendors/shipping/shipping-table";
import { ShippingMethod } from "@/types/shipping";

interface ShopShippingTemplateProps {
  shippingMethods: ShippingMethod[];
  onAddShipping: () => void;
}

export default function ShopShippingTemplate({
  shippingMethods,
  onAddShipping,
}: ShopShippingTemplateProps) {
  return (
    <div className="space-y-6">
      <ShippingHeader onAddShipping={onAddShipping} />
      <ShippingTable shippingMethods={shippingMethods} />
    </div>
  );
}