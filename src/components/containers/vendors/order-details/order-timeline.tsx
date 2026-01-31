import OrderStatusTimeline from "@/components/base/store/order/order-status-timeline";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface OrderTimelineProps {
  stages: {
    id: string;
    label: string;
    date?: string;
    status: "completed" | "active" | "pending";
  }[];
}

export default function OrderTimeline({ stages }: OrderTimelineProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Status</CardTitle>
        <CardDescription>Track the progress of this order</CardDescription>
      </CardHeader>
      <CardContent>
        <OrderStatusTimeline stages={stages} />
      </CardContent>
    </Card>
  );
}
