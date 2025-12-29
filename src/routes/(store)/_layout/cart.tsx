import CartTemplate from "@/components/templates/store/cart/cart-template";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(store)/_layout/cart")({
  component: RouteComponent,
});

function RouteComponent() {
  return <CartTemplate />;
}
