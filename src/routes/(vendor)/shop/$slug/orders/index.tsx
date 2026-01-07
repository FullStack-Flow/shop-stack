import ShopOrdersTemplate from "@/components/templates/vendor/shop-orders-template";
import { mockOrders } from "@/data/orders";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(vendor)/shop/$slug/orders/")({
  component: OrdersPage,
});

function OrdersPage() {
  const { slug } = Route.useParams() as { slug: string };
  return <ShopOrdersTemplate orders={mockOrders} shopSlug={slug} />;
}
