import { useNavigate } from "@tanstack/react-router";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useDownloadInvoice } from "@/hooks/store/use-invoice";

interface OrderDetailsCardProps {
  orderId: string;
  orderNumber: string;
  orderDate: string;
  estimatedDelivery: string;
  paymentIntentId?: string;
}

export function OrderDetailsCard({
  orderId,
  orderNumber,
  orderDate,
  estimatedDelivery,
  paymentIntentId,
}: OrderDetailsCardProps) {
  const downloadInvoice = useDownloadInvoice();
  const navigate = useNavigate();

  return (
    <div className="rounded-lg bg-primary p-6 text-primary-foreground">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="mb-2 font-semibold text-xl">
            Order Number: {orderNumber}
          </h2>
          <div className="flex flex-wrap gap-4 text-sm">
            <span>Order Date: {orderDate}</span>
            <span className="text-yellow-300">
              Estimated delivery: {estimatedDelivery}
            </span>
          </div>
        </div>
        <div className="flex gap-3">
          <Button
            variant="secondary"
            size="lg"
            className="rounded-full"
            onClick={() =>
              downloadInvoice.download(orderId, { paymentIntentId })
            }
            disabled={downloadInvoice.isPending}
          >
            {downloadInvoice.isPending ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <Download className="mr-2 size-4" />
            )}
            Download Invoice
          </Button>
          <Button
            size="lg"
            className="rounded-full bg-yellow-400 text-background hover:bg-yellow-500"
            onClick={() => {
              toast.success("Opening order tracking");
              navigate({
                to: "/track-order",
                search: { orderId: orderId },
              });
            }}
          >
            Track order
          </Button>
        </div>
      </div>
    </div>
  );
}
