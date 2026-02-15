import { Users } from "lucide-react";
import { useMemo } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils/dashboard";
import type { DashboardRecentOrder } from "@/types/shop-dashboard";

interface CustomerInsightsProps {
  orders: DashboardRecentOrder[];
  className?: string;
}

interface CustomerSummary {
  name: string;
  email: string;
  totalSpent: number;
  orderCount: number;
}

export default function CustomerInsights({
  orders,
  className,
}: CustomerInsightsProps) {
  // Aggregate customer data from recent orders
  const customers = useMemo(() => {
    const customerMap = new Map<string, CustomerSummary>();

    for (const order of orders) {
      const key = order.customerEmail;
      const existing = customerMap.get(key);

      if (existing) {
        existing.totalSpent += order.totalAmount;
        existing.orderCount += 1;
      } else {
        customerMap.set(key, {
          name: order.customerName,
          email: order.customerEmail,
          totalSpent: order.totalAmount,
          orderCount: 1,
        });
      }
    }

    return Array.from(customerMap.values()).sort(
      (a, b) => b.totalSpent - a.totalSpent,
    );
  }, [orders]);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Customer Insights</CardTitle>
        <CardDescription>
          {customers.length > 0
            ? "Top customers from recent orders"
            : "No customer data yet"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {customers.length > 0 ? (
          <div className="space-y-4">
            {customers.map((customer) => {
              const initials = customer.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2);

              return (
                <div key={customer.email} className="flex items-center gap-3">
                  <Avatar className="size-9">
                    <AvatarFallback className="text-xs">
                      {initials}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0 space-y-1">
                    <p className="font-medium text-sm leading-none truncate">
                      {customer.name}
                    </p>
                    <p className="text-muted-foreground text-xs truncate">
                      {customer.email}
                    </p>
                  </div>

                  <div className="text-right space-y-1">
                    <p className="font-medium text-sm">
                      {formatCurrency(customer.totalSpent)}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {customer.orderCount}{" "}
                      {customer.orderCount === 1 ? "order" : "orders"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex h-[200px] flex-col items-center justify-center gap-2 text-muted-foreground">
            <Users className="size-8" />
            <p className="text-sm">Customer insights will appear here</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
