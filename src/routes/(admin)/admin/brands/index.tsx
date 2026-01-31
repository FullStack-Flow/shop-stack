import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import AdminBrandsTemplate from "@/components/templates/admin/admin-brands-template";
import { mockBrands } from "@/data/brand";
import type { BrandFormValues, BrandItem } from "@/types/brands";

export const Route = createFileRoute("/(admin)/admin/brands/")({
  component: AdminBrandsPage,
});

function AdminBrandsPage() {
  const [brands, setBrands] = useState<BrandItem[]>(mockBrands);

  const handleAddBrand = (newBrandData: BrandFormValues) => {
    const now = new Date().toISOString();
    const newBrand: BrandItem = {
      id: Date.now().toString(),
      shopId: "1",
      name: newBrandData.name,
      slug: newBrandData.slug,
      website: newBrandData.website ?? null,
      logo: newBrandData.logo ?? null,
      description: newBrandData.description ?? null,
      sortOrder: brands.length,
      isActive: true,
      productCount: 0,
      createdAt: now,
      updatedAt: now,
    };
    setBrands([...brands, newBrand]);
  };

  const handleDeleteBrand = (brand: BrandItem) => {
    setBrands(brands.filter((b) => b.id !== brand.id));
  };

  return (
    <AdminBrandsTemplate
      brands={brands}
      onAddBrand={handleAddBrand}
      onDeleteBrand={handleDeleteBrand}
    />
  );
}
