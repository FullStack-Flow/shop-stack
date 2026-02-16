import { Cell, Pie, PieChart, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type ChartConfig, ChartContainer } from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import type { OrderDistribution } from "@/types/admin-dashboard";

interface OrderStatusChartProps {
  data: OrderDistribution[];
  isLoading?: boolean;
}

const STATUS_COLORS: Record<string, string> = {
  pending: "#f59e0b", // Amber
  confirmed: "#3b82f6", // Blue
  processing: "#8b5cf6", // Violet
  shipped: "#06b6d4", // Cyan
  delivered: "#22c55e", // Green
  cancelled: "#ef4444", // Red
  refunded: "#6b7280", // Gray
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

const chartConfig = {
  count: {
    label: "Orders",
  },
} satisfies ChartConfig;

export function OrderStatusChart({
  data,
  isLoading = false,
}: OrderStatusChartProps) {
  if (isLoading) {
    return (
      <Card className="col-span-3">
        <CardHeader>
          <CardTitle>Order Status</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="mx-auto size-50 rounded-full" />
        </CardContent>
      </Card>
    );
  }

  const totalOrders = data.reduce((sum, d) => sum + d.count, 0);

  const chartData = data.map((d) => ({
    ...d,
    label: STATUS_LABELS[d.status] || d.status,
    fill: STATUS_COLORS[d.status] || "#6b7280",
  }));

  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>Order Status Distribution</CardTitle>
        <p className="text-muted-foreground text-sm">
          Total: {totalOrders.toLocaleString()} orders
        </p>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <ChartContainer
            config={chartConfig}
            className="mx-auto h-50 w-full max-w-50"
          >
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                dataKey="count"
                nameKey="label"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-md">
                        <p className="font-medium">{data.label}</p>
                        <p className="text-muted-foreground text-sm">
                          {data.count} orders ({data.percentage.toFixed(1)}%)
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </PieChart>
          </ChartContainer>

          {/* Legend */}
          <div className="grid grid-cols-2 gap-2 text-sm">
            {chartData.map((item) => (
              <div key={item.status} className="flex items-center gap-2">
                <div
                  className="size-3 rounded-full"
                  style={{ backgroundColor: item.fill }}
                />
                <span className="text-muted-foreground">{item.label}</span>
                <span className="ml-auto font-medium">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
