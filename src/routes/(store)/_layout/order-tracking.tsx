import OrderTrackingTemplate from "@/components/templates/store/order/order-tracking-template";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(store)/_layout/order-tracking")({
  component: OrderTrackingTemplate,
});
