import { createFileRoute } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import ShopOrderDetailsTemplate from "@/components/templates/vendor/shop-order-details-template";
import { useVendorOrderDetails } from "@/hooks/vendors/use-vendor-orders";

export const Route = createFileRoute("/(vendor)/shop/$slug/orders/$orderId")({
  component: OrderDetailsPage,
});

function OrderDetailsPage() {
  const { slug, orderId } = Route.useParams();

  const { data: order, isLoading, error } = useVendorOrderDetails(orderId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-destructive">Failed to load order details</p>
        <p className="text-muted-foreground text-sm">
          {error.message || "Please try again later"}
        </p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-muted-foreground">Order not found</p>
      </div>
    );
  }

  return <ShopOrderDetailsTemplate shopSlug={slug} order={order} />;
}
