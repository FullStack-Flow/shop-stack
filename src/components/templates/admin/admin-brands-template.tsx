import BrandHeader from '@/components/containers/shared/brands/brand-header';
import BrandTable from '@/components/containers/shared/brands/brand-table';
import { ADMIN_BRAND_PERMISSIONS } from '@/lib/config/brand-permissions';
import type { Brand } from '@/types/brands';

interface AdminBrandsTemplateProps {
  brands: Brand[];
  onAddBrand: (data: {
    name: string;
    slug: string;
    website?: string;
    description?: string;
    logo?: string;
  }) => void;
  onDeleteBrand: (brandId: string) => void;
}

export default function AdminBrandsTemplate({
  brands,
  onAddBrand,
  onDeleteBrand,
}: AdminBrandsTemplateProps) {
  return (
    <div className="space-y-6">
      <BrandHeader onAddBrand={onAddBrand} role="admin" />
      <BrandTable
        brands={brands}
        permissions={ADMIN_BRAND_PERMISSIONS}
        onDeleteBrand={onDeleteBrand}
      />
    </div>
  );
}
