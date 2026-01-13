import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CustomerInsightsProps {
  className?: string;
}

export default function CustomerInsights({ className }: CustomerInsightsProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Customer Insights</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex h-50 items-center justify-center text-muted-foreground">
          Customer analytics placeholder
        </div>
      </CardContent>
    </Card>
  );
}
