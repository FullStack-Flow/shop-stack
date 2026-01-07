import BrandHeader from "@/components/containers/vendors/brands/brand-header";
import BrandTable from "@/components/containers/vendors/brands/brand-table";
import type React from "react";

interface Brand {
  id: string;
  name: string;
  slug: string;
  website?: string;
  logo?: string;
  description?: string;
}

interface ShopBrandsTemplateProps {
  brands: Brand[];
  onAddBrand: () => void;
}

export const ShopBrandsTemplate: React.FC<ShopBrandsTemplateProps> = ({
  brands,
  onAddBrand,
}) => {
  return (
    <div className="space-y-6">
      <BrandHeader onAddBrand={onAddBrand} />
      <BrandTable brands={brands} />
    </div>
  );
};
