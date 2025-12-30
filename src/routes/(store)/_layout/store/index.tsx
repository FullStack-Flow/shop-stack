import StoresListingTemplate from "@/components/templates/store/storefront/stores-listing-template";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(store)/_layout/store/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <StoresListingTemplate />;
}
