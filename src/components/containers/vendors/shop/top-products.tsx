import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TopProductsProps {
  className?: string;
}

export default function TopProducts({ className }: TopProductsProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Top Products</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex h-50 items-center justify-center text-muted-foreground">
          Top selling products placeholder
        </div>
      </CardContent>
    </Card>
  );
}
