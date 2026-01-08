import BrandHeader from "@/components/containers/shared/brands/brand-header";
import BrandTable from "@/components/containers/shared/brands/brand-table";
import { VENDOR_BRAND_PERMISSIONS } from "@/lib/config/brand-permissions";
import type { Brand } from "@/types/brands";

interface ShopBrandsTemplateProps {
  brands: Brand[];
  onAddBrand?: (data: {
    name: string;
    slug: string;
    website?: string;
    description?: string;
    logo?: string;
  }) => void;
  showAddButton?: boolean;
}

export function ShopBrandsTemplate({
  brands,
  onAddBrand,
  showAddButton = true,
}: ShopBrandsTemplateProps) {
  return (
    <div className="space-y-6">
      <BrandHeader
        onAddBrand={onAddBrand}
        role="vendor"
        showAddButton={showAddButton}
      />
      <BrandTable brands={brands} permissions={VENDOR_BRAND_PERMISSIONS} />
    </div>
  );
}
