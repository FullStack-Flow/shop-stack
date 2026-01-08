import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import AdminProductsTemplate from "@/components/templates/admin/admin-products-template";
import type { Product } from "@/data/products";
import { mockProducts } from "@/data/products";

export const Route = createFileRoute("/(admin)/admin/products/")({
  component: AdminProductsPage,
});

function AdminProductsPage() {
  const [products] = useState<Product[]>(mockProducts);

  return <AdminProductsTemplate products={products} />;
}
