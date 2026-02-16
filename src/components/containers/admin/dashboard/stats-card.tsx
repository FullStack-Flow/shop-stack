import type { LucideIcon } from "lucide-react";
import { ArrowDown, ArrowUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: LucideIcon;
  isLoading?: boolean;
  format?: "number" | "currency" | "percentage";
}

export function StatsCard({
  title,
  value,
  change,
  changeLabel,
  icon: Icon,
  isLoading = false,
  format = "number",
}: StatsCardProps) {
  const formatValue = (val: string | number) => {
    if (typeof val === "string") return val;
    switch (format) {
      case "currency":
        return new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(val);
      case "percentage":
        return `${val.toFixed(1)}%`;
      default:
        return new Intl.NumberFormat("en-US").format(val);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="size-4" />
        </CardHeader>
        <CardContent>
          <Skeleton className="mb-1 h-8 w-20" />
          <Skeleton className="h-3 w-32" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="font-medium text-sm">{title}</CardTitle>
        <Icon className="size-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="font-bold text-2xl">{formatValue(value)}</div>
        {(change !== undefined || changeLabel) && (
          <p className="flex items-center gap-1 text-muted-foreground text-xs">
            {change !== undefined && (
              <>
                {change >= 0 ? (
                  <ArrowUp className="size-3 text-green-500" />
                ) : (
                  <ArrowDown className="size-3 text-red-500" />
                )}
                <span
                  className={cn(
                    "font-medium",
                    change >= 0 ? "text-green-500" : "text-red-500",
                  )}
                >
                  {Math.abs(change).toFixed(1)}%
                </span>
              </>
            )}
            {changeLabel && <span>{changeLabel}</span>}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
