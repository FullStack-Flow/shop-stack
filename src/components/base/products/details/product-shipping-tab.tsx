import { Clock, RotateCcw, ShieldCheck, Truck } from "lucide-react";

interface ProductShippingTabProps {
  shipping: {
    freeShipping: boolean;
    deliveryTime: string;
    policy: string;
  };
}

export default function ProductShippingTab({
  shipping,
}: ProductShippingTabProps) {
  return (
    <div className="grid @2xl:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div className="flex gap-3">
          <div className="h-fit rounded-full bg-muted p-2">
            <Truck className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h4 className="font-medium">Delivery Information</h4>
            <p className="mt-1 text-muted-foreground text-sm">
              Estimated delivery time is {shipping.deliveryTime}.
              {shipping.freeShipping && " We offer free shipping on this item."}
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="h-fit rounded-full bg-muted p-2">
            <Clock className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h4 className="font-medium">Processing Time</h4>
            <p className="mt-1 text-muted-foreground text-sm">
              Orders are typically processed within 1-2 business days.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex gap-3">
          <div className="h-fit rounded-full bg-muted p-2">
            <RotateCcw className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h4 className="font-medium">Return Policy</h4>
            <p className="mt-1 text-muted-foreground text-sm">
              {shipping.policy}
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="h-fit rounded-full bg-muted p-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h4 className="font-medium">Warranty</h4>
            <p className="mt-1 text-muted-foreground text-sm">
              1 year manufacturer warranty included.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
