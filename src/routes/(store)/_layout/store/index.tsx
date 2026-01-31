import { createFileRoute } from "@tanstack/react-router";
import StoresListingTemplate from "@/components/templates/store/storefront/stores-listing-template";

export const Route = createFileRoute("/(store)/_layout/store/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <StoresListingTemplate />;
}
