import CheckoutTemplate from "@/components/templates/store/checkout/checkout-template";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(store)/_layout/checkout")({
  component: RouteComponent,
});

function RouteComponent() {
  return <CheckoutTemplate />;
}
