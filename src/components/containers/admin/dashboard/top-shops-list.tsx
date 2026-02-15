import { Link } from "@tanstack/react-router";
import { ExternalLink, Store } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import type { TopShop } from "@/types/admin-dashboard";

interface TopShopsListProps {
  shops: TopShop[];
  isLoading?: boolean;
}

export function TopShopsList({ shops, isLoading = false }: TopShopsListProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const maxRevenue = Math.max(...shops.map((s) => s.revenue), 1);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Shops</CardTitle>
          <CardDescription>Shops ranked by revenue</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="size-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-2 w-full" />
                </div>
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
          <CardTitle>Top Performing Shops</CardTitle>
          <CardDescription>Shops ranked by revenue</CardDescription>
        </div>
        <Link
          to="/admin/tenants"
          className="flex items-center gap-1 text-muted-foreground text-sm hover:text-foreground"
        >
          View all <ExternalLink className="size-3" />
        </Link>
      </CardHeader>
      <CardContent>
        {shops.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            No shops with revenue yet
          </div>
        ) : (
          <div className="space-y-4">
            {shops.map((shop, index) => (
              <div key={shop.id} className="flex items-center gap-4">
                <span className="w-4 font-bold text-muted-foreground text-sm">
                  {index + 1}
                </span>
                <Avatar className="border">
                  {shop.logo ? (
                    <AvatarImage src={shop.logo} alt={shop.name} />
                  ) : null}
                  <AvatarFallback>
                    <Store className="size-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <Link
                      to="/admin/tenants/$tenantId"
                      params={{ tenantId: shop.id }}
                      className="font-medium hover:underline"
                    >
                      {shop.name}
                    </Link>
                    <span className="font-bold text-sm">
                      {formatCurrency(shop.revenue)}
                    </span>
                  </div>
                  <Progress
                    value={(shop.revenue / maxRevenue) * 100}
                    className="h-1.5"
                  />
                  <div className="flex gap-4 text-muted-foreground text-xs">
                    <span>{shop.orderCount} orders</span>
                    <span>{shop.productCount} products</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
