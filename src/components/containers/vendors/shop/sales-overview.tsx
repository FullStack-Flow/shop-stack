import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SalesOverviewProps {
  shopName: string;
  className?: string;
}

export default function SalesOverview({
  shopName,
  className,
}: SalesOverviewProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Sales Overview</CardTitle>
      </CardHeader>
      <CardContent className="pl-2">
        <div className="flex h-75 items-center justify-center text-muted-foreground">
          Chart placeholder - Sales over time for {shopName}
        </div>
      </CardContent>
    </Card>
  );
}
