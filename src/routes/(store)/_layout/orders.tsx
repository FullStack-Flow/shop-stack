import OrderTemplate from "@/components/templates/store/accounts/order-template";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(store)/_layout/orders")({
  component: RouteComponent,
});

function RouteComponent() {
  return <OrderTemplate />;
}
