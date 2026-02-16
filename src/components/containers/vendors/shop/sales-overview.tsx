import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { DashboardMonthlySales } from "@/types/shop-dashboard";

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

interface SalesOverviewProps {
  shopName: string;
  monthlySales: DashboardMonthlySales[];
  className?: string;
}

export default function SalesOverview({
  shopName,
  monthlySales,
  className,
}: SalesOverviewProps) {
  const hasData = monthlySales.some((m) => m.revenue > 0 || m.orders > 0);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Sales Overview</CardTitle>
        <CardDescription>
          Monthly revenue for {shopName} over the last 6 months
        </CardDescription>
      </CardHeader>
      <CardContent className="pl-2">
        {hasData ? (
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <BarChart accessibilityLayer data={monthlySales}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                fontSize={12}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                fontSize={12}
                tickFormatter={(value) => `$${value}`}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    formatter={(value) => (
                      <span className="font-medium">
                        ${Number(value).toLocaleString()}
                      </span>
                    )}
                  />
                }
              />
              <Bar
                dataKey="revenue"
                fill="var(--color-revenue)"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        ) : (
          <div className="flex h-[300px] items-center justify-center text-muted-foreground">
            <p>
              No sales data available yet. Orders will appear here once
              fulfilled.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
