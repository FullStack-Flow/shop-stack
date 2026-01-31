import { Link } from "@tanstack/react-router";
import { ExternalLink, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

interface OrderTrackingSummaryProps {
  orderId: string;
  orderDate: string;
  itemsCount: number;
  total: number;
}

export default function OrderTrackingSummary({
  orderId,
  orderDate,
  itemsCount,
  total,
}: OrderTrackingSummaryProps) {
  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm">
      <h3 className="mb-4 font-semibold text-lg">Order Summary</h3>
      <div className="space-y-3">
        <div className="flex justify-between text-base">
          <span className="text-muted-foreground">Order Id</span>
          <span className="font-medium text-foreground">{orderId}</span>
        </div>
        <div className="flex justify-between text-base">
          <span className="text-muted-foreground">Order Date</span>
          <span className="font-medium text-foreground">{orderDate}</span>
        </div>
        <div className="flex justify-between text-base">
          <span className="text-muted-foreground">Items</span>
          <span className="font-medium text-foreground">
            {itemsCount} items
          </span>
        </div>
        <div className="flex justify-between text-base">
          <span className="text-muted-foreground">Total</span>
          <span className="font-semibold text-foreground text-xl">
            ${total.toFixed(2)}
          </span>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-4">
        <Link to="/order-confirmation">
          <Button variant="default" size="lg" className="w-full">
            <ExternalLink className="mr-2 h-4 w-4" />
            View Full Order
          </Button>
        </Link>
        <Button variant="outline" size="lg" className="w-full">
          <Mail className="mr-2 h-4 w-4" />
          Contact Support
        </Button>
      </div>
    </div>
  );
}
