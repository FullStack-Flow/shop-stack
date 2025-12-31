import WishlistTemplate from "@/components/templates/store/accounts/wishlist-template";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(store)/_layout/wishlist")({
  component: RouteComponent,
});

function RouteComponent() {
  return <WishlistTemplate />;
}
