import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ShopBrandsTemplate } from "@/components/templates/vendor/shop-brands-template";
import { mockBrands } from "@/data/brand";
import type { Brand } from "@/types/brands";

export const Route = createFileRoute("/(vendor)/shop/$slug/brands")({
  component: BrandsPage,
});

function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>(mockBrands);

  const handleAddBrand = (data: {
    name: string;
    slug: string;
    website?: string;
    description?: string;
    logo?: string;
  }) => {
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

  return <ShopBrandsTemplate brands={brands} onAddBrand={handleAddBrand} />;
}
