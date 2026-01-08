import { useState } from 'react';
import PageHeader from '@/components/base/common/page-header';
import type { ShippingFormValues } from '@/types/shipping-form';
import { AddShippingDialog } from './add-shipping-dialog';

export interface ShippingHeaderProps {
  onAddShipping?: (data: ShippingFormValues) => void;
  role?: 'admin' | 'vendor';
  showAddButton?: boolean;
  children?: React.ReactNode;
  className?: string;
}

export default function ShippingHeader({
  onAddShipping,
  role = 'vendor',
  showAddButton = true,
  children,
  className,
}: ShippingHeaderProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const handleAddShipping = (data: ShippingFormValues) => {
    onAddShipping?.(data);
  };

  return (
    <PageHeader
      title="Shipping Methods"
      description={
        role === 'admin'
          ? 'Manage platform-wide shipping options and delivery methods'
          : 'Manage your shipping options and delivery methods'
      }
      className={className}
    >
      {children}
      {showAddButton && (
        <AddShippingDialog
          open={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
          onSubmit={handleAddShipping}
        />
      )}
    </PageHeader>
  );
}
