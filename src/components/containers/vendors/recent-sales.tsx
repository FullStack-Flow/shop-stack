import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface RecentSalesProps {
  className?: string;
}

export default function RecentSales({ className }: RecentSalesProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Recent Sales</CardTitle>
      </CardHeader>
      <CardContent className="pl-2">
        <div className="flex h-75 items-center justify-center text-muted-foreground">
          Recent sales list placeholder
        </div>
      </CardContent>
    </Card>
  );
}
