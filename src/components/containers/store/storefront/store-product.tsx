import { useQuery } from "@tanstack/react-query";
import { Loader2, PackageOpen } from "lucide-react";
import { useMemo, useState } from "react";
import NotFound from "@/components/base/empty/notfound";
import ProductCard from "@/components/base/products/product-card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { storeProductsQueryOptions } from "@/hooks/store/use-store-product";
import { toDisplayProducts } from "@/lib/helper/products-query-helpers";

interface StoreProductsProps {
  storeName: string;
  storeSlug?: string;
}

const sortOptions = [
  { value: "newest", label: "Newest" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "rating", label: "Highest Rated" },
  { value: "popular", label: "Most Popular" },
];

export default function StoreProducts({
  storeName,
  storeSlug,
}: StoreProductsProps) {
  const [sortBy, setSortBy] = useState("newest");

  // Fetch products for this store using shopSlug
  const { data: productsData, isPending } = useQuery({
    ...storeProductsQueryOptions({
      shopSlug: storeSlug,
      limit: 50,
      sortBy: sortBy === "newest" ? "createdAt" : "price",
      sortDirection: sortBy === "price-low" ? "asc" : "desc",
    }),
    enabled: !!storeSlug,
  });

  // Transform to display products
  const products = useMemo(
    () => toDisplayProducts(productsData?.data ?? []),
    [productsData?.data],
  );

  // Client-side sort for rating (since API might not support it)
  const sortedProducts = useMemo(() => {
    if (sortBy === "rating") {
      return [...products].sort((a, b) => b.rating.average - a.rating.average);
    }
    return products;
  }, [products, sortBy]);

  if (isPending) {
    return (
      <div className="flex min-h-50 items-center justify-center">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading products...</span>
        </div>
      </div>
    );
  }

  if (sortedProducts.length === 0) {
    return (
      <NotFound
        title="No Products Yet"
        description="This store hasn't listed any products yet. Check back soon!"
        icon={<PackageOpen className="size-12 text-muted-foreground" />}
        className="py-12"
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with count and sort */}
      <div className="flex @2xl:flex-row flex-col items-start @2xl:items-center justify-between gap-4">
        <div className="@2xl:items-center">
          <h2 className="font-semibold text-xl">
            Products ({sortedProducts.length})
          </h2>
          <p className="text-muted-foreground text-sm">
            Browse all products from {storeName}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-sm">Sort by:</span>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-45">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid @2xl:grid-cols-2 @5xl:grid-cols-3 gap-6">
        {sortedProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
