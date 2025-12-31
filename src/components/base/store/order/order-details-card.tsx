import { Button } from "@/components/ui/button";

interface OrderDetailsCardProps {
  orderId: string;
  orderDate: string;
  estimatedDelivery: string;
}

export default function OrderDetailsCard({
  orderId,
  orderDate,
  estimatedDelivery,
}: OrderDetailsCardProps) {
  return (
    <div className="rounded-lg bg-primary p-6 text-primary-foreground">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="mb-2 font-semibold text-xl">Order Id: {orderId}</h2>
          <div className="flex flex-wrap gap-4 text-sm">
            <span>Order Date: {orderDate}</span>
            <span className="text-yellow-300">
              Estimated delivery: {estimatedDelivery}
            </span>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" size="lg" className="rounded-full">
            Download Invoice
          </Button>
          <Button
            size="lg"
            className="rounded-full bg-yellow-400 text-background hover:bg-yellow-500"
          >
            Track order
          </Button>
        </div>
      </div>
    </div>
  );
}
