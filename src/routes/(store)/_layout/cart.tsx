import { createFileRoute } from "@tanstack/react-router";
import CartTemplate from "@/components/templates/store/cart/cart-template";

export const Route = createFileRoute("/(store)/_layout/cart")({
  component: RouteComponent,
});

function RouteComponent() {
  return <CartTemplate />;
}
