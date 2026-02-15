import { Link } from "@tanstack/react-router";
import { ExternalLink, Package } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { TopProduct } from "@/types/admin-dashboard";

interface TopProductsListProps {
  products: TopProduct[];
  isLoading?: boolean;
}

export function TopProductsList({
  products,
  isLoading = false,
}: TopProductsListProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Selling Products</CardTitle>
          <CardDescription>Best sellers by quantity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="size-10 rounded" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Top Selling Products</CardTitle>
          <CardDescription>Best sellers by quantity</CardDescription>
        </div>
        <Link
          to="/admin/products"
          className="flex items-center gap-1 text-muted-foreground text-sm hover:text-foreground"
        >
          View all <ExternalLink className="size-3" />
        </Link>
      </CardHeader>
      <CardContent>
        {products.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            No product sales yet
          </div>
        ) : (
          <div className="space-y-3">
            {products.slice(0, 5).map((product, index) => (
              <div key={product.id} className="flex items-center gap-3">
                <span className="w-4 font-bold text-muted-foreground text-sm">
                  {index + 1}
                </span>
                <Avatar className="size-10 rounded border">
                  {product.image ? (
                    <AvatarImage src={product.image} alt={product.name} />
                  ) : null}
                  <AvatarFallback className="rounded">
                    <Package className="size-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium" title={product.name}>
                    {product.name}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    by {product.shopName}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{product.totalSold} sold</p>
                  <p className="text-muted-foreground text-xs">
                    {formatCurrency(product.revenue)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
