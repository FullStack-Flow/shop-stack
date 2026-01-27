import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DashboardChartProps {
  className?: string;
}

export default function DashboardChart({ className }: DashboardChartProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Overview</CardTitle>
      </CardHeader>
      <CardContent className="pl-2">
        <div className="flex h-75 items-center justify-center text-muted-foreground">
          Chart placeholder - Revenue over time
        </div>
      </CardContent>
    </Card>
  );
}
