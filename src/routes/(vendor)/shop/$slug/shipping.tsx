import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { AddShippingDialog } from '@/components/containers/shared/shipping/add-shipping-dialog';
import ShopShippingTemplate from '@/components/templates/vendor/shop-shipping-template';
import { mockShippingMethods } from '@/data/shipping';
import type { ShippingMethod } from '@/types/shipping';
import type { ShippingFormValues } from '@/types/shipping-form';

export const Route = createFileRoute('/(vendor)/shop/$slug/shipping')({
  component: ShippingPage,
});

function ShippingPage() {
  const [shippingMethods, setShippingMethods] =
    useState<ShippingMethod[]>(mockShippingMethods);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleAddShipping = () => {
    setIsDialogOpen(true);
  };

  const handleShippingSubmit = (data: ShippingFormValues) => {
    const newShippingMethod: ShippingMethod = {
      id: String(shippingMethods.length + 1),
      name: data.name,
      price: data.price,
      duration: data.duration,
      description: data.description,
    };

    setShippingMethods([...shippingMethods, newShippingMethod]);
    console.log('Created shipping method:', newShippingMethod);
  };

  return (
    <>
      <ShopShippingTemplate
        shippingMethods={shippingMethods}
        onEditShipping={handleAddShipping}
      />

      <AddShippingDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={handleShippingSubmit}
      />
    </>
  );
}
