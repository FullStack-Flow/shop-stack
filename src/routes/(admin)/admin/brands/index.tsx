import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import AdminBrandsTemplate from "@/components/templates/admin/admin-brands-template";
import { mockBrands } from "@/data/brand";
import type { Brand } from "@/types/brands";

export const Route = createFileRoute("/(admin)/admin/brands/")({
  component: AdminBrandsPage,
});

function AdminBrandsPage() {
  const [brands, setBrands] = useState<Brand[]>(mockBrands);

  const handleAddBrand = (newBrandData: {
    name: string;
    slug: string;
    website?: string;
    description?: string;
    logo?: string;
  }) => {
    const newBrand: Brand = {
      id: Date.now().toString(),
      name: newBrandData.name,
      slug: newBrandData.slug,
      website: newBrandData.website,
      logo: newBrandData.logo,
      description: newBrandData.description,
    };
    setBrands([...brands, newBrand]);
  };

  const handleDeleteBrand = (brandId: string) => {
    setBrands(brands.filter((brand) => brand.id !== brandId));
  };

  return (
    <AdminBrandsTemplate
      brands={brands}
      onAddBrand={handleAddBrand}
      onDeleteBrand={handleDeleteBrand}
    />
  );
}
