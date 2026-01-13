import ProductCard from "@/components/base/products/product-card";
import ProductGridSkeleton from "@/components/base/products/product-grid-skeleton";
import ProductNotFound from "@/components/base/products/product-not-found";
import type { Product } from "@/data/products";

interface ProductGridProps {
  products: Product[];
  isLoading?: boolean;
  viewMode?: "grid" | "list";
}
export default function ProductGrid({
  products,
  isLoading,
  viewMode = "grid",
}: ProductGridProps) {
  if (isLoading) {
    return <ProductGridSkeleton />;
  }

  if (products.length === 0) {
    return <ProductNotFound />;
  }

  const gridClass =
    viewMode === "grid"
      ? "grid grid-cols-1 @4xl:grid-cols-2 @7xl:grid-cols-3 gap-6"
      : "flex flex-col gap-4";

  return (
    <div className={gridClass}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
