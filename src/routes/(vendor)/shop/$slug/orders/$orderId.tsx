import ShopOrderDetailsTemplate from "@/components/templates/vendor/shop-order-details-template";
import { mockOrderDetails } from "@/data/order-details";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(vendor)/shop/$slug/orders/$orderId")({
  component: OrderDetailsPage,
});

function OrderDetailsPage() {
  const { slug } = Route.useParams() as { slug: string };

  return <ShopOrderDetailsTemplate shopSlug={slug} order={mockOrderDetails} />;
}
