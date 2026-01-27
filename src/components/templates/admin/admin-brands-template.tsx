import AdminBrandsTable from "@/components/containers/admin/brands/admin-brands-table";
import BrandHeader from "@/components/containers/shared/brands/brand-header";
import type { Brand } from "@/types/brands";

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
      <BrandHeader
        onAddBrand={() => onAddBrand({ name: "", slug: "" })}
        role="admin"
      />
      <AdminBrandsTable brands={brands} onDelete={onDeleteBrand} />
    </div>
  );
}
