import { createFileRoute } from "@tanstack/react-router";
import CheckoutTemplate from "@/components/templates/store/checkout/checkout-template";

export const Route = createFileRoute("/(store)/_layout/checkout")({
  component: RouteComponent,
});

function RouteComponent() {
  return <CheckoutTemplate />;
}
