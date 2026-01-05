import { ShopProductsPageSkeleton } from "@/components/base/vendors/skeleton/shop-products-skeleton";
import ShopProductsTemplate from "@/components/templates/vendor/products/shop-products-template";
import { mockProducts } from "@/data/shop-products";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/(vendor)/shop/$slug/products")({
  component: ProductsPage,
  loader: async () => {
    // Simulate loading delay for skeleton demonstration
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return {};
  },
  pendingComponent: ShopProductsPageSkeleton,
});

function ProductsPage() {
  const [products, setProducts] = useState(mockProducts);
  const [isAddProductDialogOpen, setIsAddProductDialogOpen] = useState(false);

  const handleAddProduct = () => {
    setIsAddProductDialogOpen(true);
  };

  const handleSearch = (query: string) => {
    // This is now handled by the DataTable component internally
    console.log("Search query:", query);
  };

  return (
    <ShopProductsTemplate
      products={products}
      onAddProduct={handleAddProduct}
      onSearch={handleSearch}
    />
  );
}
