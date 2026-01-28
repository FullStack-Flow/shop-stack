import { useState } from "react";
import AdminBrandsTable from "@/components/containers/admin/brands/admin-brands-table";
import { AddBrandDialog } from "@/components/containers/shared/brands/add-brand-dialog";
import BrandHeader from "@/components/containers/shared/brands/brand-header";
import type { BrandFormValues, BrandItem } from "@/types/brands";

interface AdminBrandsTemplateProps {
  brands: BrandItem[];
  onAddBrand: (data: BrandFormValues) => void;
  onDeleteBrand: (brand: BrandItem) => void;
}

export default function AdminBrandsTemplate({
  brands,
  onAddBrand,
  onDeleteBrand,
}: AdminBrandsTemplateProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  return (
    <div className="space-y-6">
      <BrandHeader onAdd={() => setIsAddDialogOpen(true)} role="admin" />
      <AddBrandDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSubmit={onAddBrand}
      />
      <AdminBrandsTable brands={brands} onDelete={onDeleteBrand} />
    </div>
  );
}
