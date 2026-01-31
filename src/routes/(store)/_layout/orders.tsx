import { createFileRoute } from "@tanstack/react-router";
import OrderTemplate from "@/components/templates/store/accounts/order-template";

export const Route = createFileRoute("/(store)/_layout/orders")({
  component: RouteComponent,
});

function RouteComponent() {
  return <OrderTemplate />;
}
