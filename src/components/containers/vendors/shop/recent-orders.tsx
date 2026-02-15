import { ShoppingBag } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { DashboardRecentOrder } from "@/lib/functions/vendor/dashboard";
import {
  formatCurrency,
  formatRelativeTime,
  getStatusColor,
} from "@/lib/utils/dashboard";

interface RecentOrdersProps {
  orders: DashboardRecentOrder[];
  className?: string;
}

export default function RecentOrders({ orders, className }: RecentOrdersProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Recent Orders</CardTitle>
        <CardDescription>
          {orders.length > 0
            ? `Your ${orders.length} most recent orders`
            : "No orders yet"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order) => {
              const initials = order.customerName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2);

              return (
                <div key={order.id} className="flex items-center gap-3">
                  <Avatar className="size-9">
                    <AvatarFallback className="text-xs">
                      {initials}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium text-sm leading-none truncate">
                        {order.customerName}
                      </p>
                      <span className="font-medium text-sm whitespace-nowrap">
                        {formatCurrency(order.totalAmount)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-muted-foreground text-xs truncate">
                        {order.orderNumber}
                      </p>
                      <div className="flex items-center gap-1.5">
                        <Badge
                          variant="secondary"
                          className={`text-[10px] px-1.5 py-0 ${getStatusColor(order.status)}`}
                        >
                          {order.status}
                        </Badge>
                        <span className="text-muted-foreground text-[10px] whitespace-nowrap">
                          {formatRelativeTime(order.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex h-[200px] flex-col items-center justify-center gap-2 text-muted-foreground">
            <ShoppingBag className="size-8" />
            <p className="text-sm">No orders received yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
