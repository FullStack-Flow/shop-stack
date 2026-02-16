import { ImageIcon, Package } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils/dashboard";
import type { DashboardTopProduct } from "@/types/shop-dashboard";

interface TopProductsProps {
  products: DashboardTopProduct[];
  className?: string;
}

export default function TopProducts({ products, className }: TopProductsProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Top Products</CardTitle>
        <CardDescription>
          {products.length > 0
            ? "Your best selling products by quantity"
            : "No sales data yet"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {products.length > 0 ? (
          <div className="space-y-4">
            {products.map((product, index) => (
              <div key={product.id} className="flex items-center gap-3">
                <span className="w-5 text-center font-medium text-muted-foreground text-sm">
                  {index + 1}
                </span>

                <Avatar className="size-9 rounded-md">
                  <AvatarImage
                    src={product.image || undefined}
                    alt={product.name}
                    className="object-cover"
                  />
                  <AvatarFallback className="rounded-md">
                    <ImageIcon className="size-4 text-muted-foreground" />
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0 space-y-1">
                  <p className="font-medium text-sm leading-none truncate">
                    {product.name}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {product.totalSold} sold
                  </p>
                </div>

                <span className="font-medium text-sm whitespace-nowrap">
                  {formatCurrency(product.revenue)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex h-[200px] flex-col items-center justify-center gap-2 text-muted-foreground">
            <Package className="size-8" />
            <p className="text-sm">Sales data will appear here</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
