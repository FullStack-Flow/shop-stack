import { useMemo } from "react";
import { toast } from "sonner";
import CollectionItem from "@/components/base/common/collection-item";
import CollectionSkeleton from "@/components/base/skeleton/category-skeleton";
import { useCartStore } from "@/lib/store/cart-store";
import { gridCellBorderClasses } from "@/lib/utils";
import type { DisplayProduct } from "@/types/store-types";

export default function CollectionContainer({
  products,
  isLoading,
  activeCategory,
}: {
  products: DisplayProduct[];
  isLoading: boolean;
  activeCategory: string;
}) {
  const columns2 = 2;
  const columns3 = 3;
  const { addItem } = useCartStore();

  // Filter products by category
  const filteredProducts = useMemo(() => {
    if (activeCategory === "All") {
      return products.slice(0, 6);
    }
    return products
      .filter(
        (p) => p.category.name.toLowerCase() === activeCategory.toLowerCase(),
      )
      .slice(0, 6);
  }, [products, activeCategory]);

  const handleAddToCart = (product: DisplayProduct) => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price.current,
      image: product.images[0]?.url || "",
      quantity: 1,
      maxQuantity: product.stock.quantity,
    });
    toast.success("Added to cart");
  };

  if (isLoading) {
    return <CollectionSkeleton />;
  }

  if (filteredProducts.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-lg text-muted-foreground">
          No products found in this category
        </p>
      </div>
    );
  }

  return (
    <div className="grid @4xl:grid-cols-2 @6xl:grid-cols-3 grid-cols-1">
      {filteredProducts.map((product, index) => (
        <div
          key={product.id}
          className="fade-in-0 zoom-in-95 animate-in duration-300"
          style={{
            animationDelay: `${index * 50}ms`,
            animationFillMode: "backwards",
          }}
        >
          <CollectionItem
            id={product.id}
            image={
              product.images[0]?.url ||
              `https://placehold.co/600x600?text=${encodeURIComponent(product.name)}`
            }
            title={product.name}
            category={product.category.name}
            fit="Regular"
            price={`$${product.price.current.toFixed(2)}`}
            className={gridCellBorderClasses(index, columns2, columns3, true)}
            onAddToCart={() => handleAddToCart(product)}
          />
        </div>
      ))}
    </div>
  );
}
