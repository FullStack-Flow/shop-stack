import { useState } from 'react';
import PageHeader from '@/components/base/common/page-header';
import type { TaxFormValues } from '@/types/taxes';
import { AddTaxDialog } from './add-tax-dialog';

export interface TaxHeaderProps {
  onAddTax?: (data: TaxFormValues) => void;
  role?: 'admin' | 'vendor';
  showAddButton?: boolean;
  children?: React.ReactNode;
  className?: string;
}

export default function TaxHeader({
  onAddTax,
  role = 'vendor',
  showAddButton = true,
  children,
  className,
}: TaxHeaderProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const handleAddTax = (data: TaxFormValues) => {
    onAddTax?.(data);
  };

  return (
    <PageHeader
      title="Taxes"
      description={
        role === 'admin'
          ? 'Manage platform-wide tax rates and configurations'
          : 'Manage your tax rates and configurations'
      }
      className={className}
    >
      {children}
      {showAddButton && (
        <AddTaxDialog
          open={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
          onSubmit={handleAddTax}
        />
      )}
    </PageHeader>
  );
}
