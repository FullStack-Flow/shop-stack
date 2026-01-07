import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import OrderTimeline from "@/components/containers/vendors/order-details/order-timeline";
import OrderSummary from "@/components/containers/vendors/order-details/order-summary";
import OrderItemsList from "@/components/containers/vendors/order-details/order-items-list";

interface ShopOrderDetailsTemplateProps {
  shopSlug: string;
  order: any; // Replace with proper type
}

export default function ShopOrderDetailsTemplate({
  shopSlug,
  order,
}: ShopOrderDetailsTemplateProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/shop/$slug/orders" params={{ slug: shopSlug }}>
            <ArrowLeft className="mr-2 size-4" />
            Back to Orders
          </Link>
        </Button>
        <h1 className="font-bold text-2xl tracking-tight">
          Order #{order.orderNumber}
        </h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <OrderTimeline stages={order.stages} />
          <OrderItemsList items={order.items} />
        </div>
        <div>
          <OrderSummary
            orderId={order.orderNumber}
            orderDate={order.date}
            customer={order.customer}
            paymentMethod={order.paymentMethod}
            paymentStatus={order.paymentStatus}
            subtotal={order.subtotal}
            shipping={order.shipping}
            tax={order.tax}
            total={order.total}
          />
        </div>
      </div>
    </div>
  );
}
