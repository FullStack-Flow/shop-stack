import { Loader2 } from "lucide-react";
import ProductCard from "@/components/base/products/product-card";
import ProductGridSkeleton from "@/components/base/products/product-grid-skeleton";
import ProductNotFound from "@/components/base/products/product-not-found";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { DisplayProduct } from "@/types/store-types";

interface ProductGridProps {
  products: DisplayProduct[];
  isLoading?: boolean;
  viewMode?: "grid" | "list";
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  onLoadMore?: () => void;
}
export default function ProductGrid({
  products,
  isLoading,
  viewMode = "grid",
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
}: ProductGridProps) {
  if (isLoading) {
    return <ProductGridSkeleton />;
  }

  if (products.length === 0) {
    return <ProductNotFound />;
  }

  return (
    <div className="space-y-8">
      <div
        className={cn(
          "gap-6",
          viewMode === "grid"
            ? "grid @4xl:grid-cols-2 @7xl:grid-cols-3 grid-cols-1"
            : "flex flex-col",
        )}
      >
        {products.map((product) => (
          <ProductCard key={product.id} product={product} variant={viewMode} />
        ))}
      </div>
      {/* Load More Button */}
      {hasNextPage && (
        <div className="flex justify-center pt-6">
          <Button
            variant="outline"
            size="lg"
            onClick={onLoadMore}
            disabled={isFetchingNextPage}
            className="min-w-50"
          >
            {isFetchingNextPage ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              "Load More Products"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
