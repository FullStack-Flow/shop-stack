import { createFileRoute } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import ShopOrderDetailsTemplate from "@/components/templates/vendor/shop-order-details-template";
import { useAdminOrderDetails } from "@/hooks/admin/use-admin-orders";

export const Route = createFileRoute("/(admin)/admin/orders/$orderId")({
  component: RouteComponent,
});

function RouteComponent() {
  const { orderId } = Route.useParams();
  const { data: order, isLoading, error } = useAdminOrderDetails(orderId);

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

  const orderWithShopMeta = order as typeof order & {
    shopId?: string;
    shopName?: string;
  };
  const normalizedOrder = {
    ...order,
    shopId: order.shop?.id ?? orderWithShopMeta.shopId ?? "",
    shopName: order.shop?.name ?? orderWithShopMeta.shopName ?? "Unknown Store",
  };

  return (
    <ShopOrderDetailsTemplate
      order={normalizedOrder}
      mode="admin"
      backLink={{ to: "/admin/orders", label: "Back to Orders" }}
    />
  );
}
