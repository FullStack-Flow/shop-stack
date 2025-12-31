import OrderConfirmationTemplate from "@/components/templates/store/order/order-confirmation-template";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(store)/_layout/order-confirmation")({
  component: RouteComponent,
});

function RouteComponent() {
  return <OrderConfirmationTemplate />;
}
