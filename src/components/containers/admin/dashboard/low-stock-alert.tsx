import { Link } from "@tanstack/react-router";
import { AlertTriangle, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { LowStockProduct } from "@/types/admin-dashboard";

interface LowStockAlertProps {
  products: LowStockProduct[];
  isLoading?: boolean;
}

export function LowStockAlert({
  products,
  isLoading = false,
}: LowStockAlertProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="size-5 text-amber-500" />
            Low Stock Alerts
          </CardTitle>
          <CardDescription>Products needing restocking</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
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
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="size-5 text-amber-500" />
            Low Stock Alerts
            {products.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {products.length}
              </Badge>
            )}
          </CardTitle>
          <CardDescription>Products needing restocking</CardDescription>
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
          <div className="py-4 text-center text-muted-foreground">
            <p>All products are well stocked! 🎉</p>
          </div>
        ) : (
          <div className="space-y-3">
            {products.slice(0, 5).map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium" title={product.name}>
                    {product.name}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {product.sku && `SKU: ${product.sku} • `}
                    {product.shopName}
                  </p>
                </div>
                <div className="ml-4 flex items-center gap-2">
                  <Badge
                    variant={product.stock === 0 ? "destructive" : "outline"}
                    className="tabular-nums"
                  >
                    {product.stock} / {product.threshold}
                  </Badge>
                  <Link
                    to="/shop/$slug/products"
                    params={{ slug: product.shopSlug }}
                    className="text-muted-foreground text-sm hover:text-foreground"
                  >
                    <ExternalLink className="size-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
