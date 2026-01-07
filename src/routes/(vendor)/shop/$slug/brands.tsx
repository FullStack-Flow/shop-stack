import { AddBrandDialog } from "@/components/containers/vendors/brands/add-brand-dialog";
import { ShopBrandsTemplate } from "@/components/templates/vendor/shop-brands-template";
import { mockBrands } from "@/data/brand";
import { Brand } from "@/types/brands";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/(vendor)/shop/$slug/brands")({
  component: BrandsPage,
});

function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>(mockBrands);
  const [isAddBrandDialogOpen, setIsAddBrandDialogOpen] = useState(false);

  const handleAddBrand = () => {
    setIsAddBrandDialogOpen(true);
  };

  const handleAddBrandSubmit = (data: any) => {
    const newBrand: Brand = {
      id: String(brands.length + 1),
      name: data.name,
      slug: data.slug,
      website: data.website,
      logo: data.logo,
      description: data.description,
    };
    setBrands([...brands, newBrand]);
  };

  return (
    <>
      <ShopBrandsTemplate brands={brands} onAddBrand={handleAddBrand} />

      <AddBrandDialog
        open={isAddBrandDialogOpen}
        onOpenChange={setIsAddBrandDialogOpen}
        onSubmit={handleAddBrandSubmit}
      />
    </>
  );
}
