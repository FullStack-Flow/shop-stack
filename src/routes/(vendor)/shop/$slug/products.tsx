import { ShopProductsPageSkeleton } from "@/components/base/vendors/skeleton/shop-products-skeleton";
import { AddProductDialog } from "@/components/containers/vendors/products/add-product-dialog";
import ShopProductsTemplate from "@/components/templates/vendor/products/shop-products-template";
import {
  mockAttributes,
  mockBrands,
  mockCategories,
  mockProducts,
  mockShippingMethods,
  mockTags,
  mockTaxes,
} from "@/data/shop-products";
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

  const handleAddProductSubmit = (data: any) => {
    console.log("Adding product:", data);

    // Resolve names from IDs for the mock table
    const categoryName = mockCategories.find(
      (c) => c.id === data.categoryId
    )?.name;
    const brandName = mockBrands.find((b) => b.id === data.brandId)?.name;
    const tagNames = data.tagIds
      .map((id: string) => mockTags.find((t) => t.id === id)?.name)
      .filter(Boolean);

    const newProduct = {
      id: String(products.length + 1),
      name: data.name,
      sku: data.sku,
      shop: "Tech Gadgets Store",
      price: `$${data.price}`,
      stock: Number(data.stock),
      status: "active" as const,
      image: "https://placehold.co/100?text=NP",
      productType: "Simple", // Default for now
      category: categoryName || "",
      brand: brandName || "",
      tags: tagNames,
    };
    setProducts([...products, newProduct]);
  };

  const handleSearch = (query: string) => {
    // This is now handled by the DataTable component internally
    console.log("Search query:", query);
  };

  return (
    <>
      <ShopProductsTemplate
        products={products}
        onAddProduct={handleAddProduct}
        onSearch={handleSearch}
      />

      <AddProductDialog
        open={isAddProductDialogOpen}
        onOpenChange={setIsAddProductDialogOpen}
        onSubmit={handleAddProductSubmit}
        categories={mockCategories}
        brands={mockBrands}
        tags={mockTags}
        availableAttributes={mockAttributes}
        taxes={mockTaxes}
        shippingMethods={mockShippingMethods}
      />
    </>
  );
}
