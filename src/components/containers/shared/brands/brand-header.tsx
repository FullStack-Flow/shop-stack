import { useState } from 'react';
import PageHeader from '@/components/base/common/page-header';
import { AddBrandDialog } from './add-brand-dialog';

export interface BrandHeaderProps {
  onAddBrand?: (data: {
    name: string;
    slug: string;
    website?: string;
    description?: string;
    logo?: string;
  }) => void;
  role?: 'admin' | 'vendor';
  showAddButton?: boolean;
  children?: React.ReactNode;
  className?: string;
}

export default function BrandHeader({
  onAddBrand,
  role = 'vendor',
  showAddButton = true,
  children,
  className,
}: BrandHeaderProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const handleAddBrand = (data: {
    name: string;
    slug: string;
    website?: string;
    description?: string;
    logo?: string;
  }) => {
    onAddBrand?.(data);
  };

  return (
    <PageHeader
      title="Brands"
      description={
        role === 'admin'
          ? 'Manage product brands across the platform'
          : 'Manage the brands associated with your shop'
      }
      className={className}
    >
      {children}
      {showAddButton && (
        <AddBrandDialog
          open={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
          onSubmit={handleAddBrand}
          role={role}
        />
      )}
    </PageHeader>
  );
}
