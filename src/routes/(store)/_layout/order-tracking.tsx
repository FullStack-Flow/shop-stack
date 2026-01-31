import { createFileRoute } from "@tanstack/react-router";
import OrderTrackingTemplate from "@/components/templates/store/order/order-tracking-template";

export const Route = createFileRoute("/(store)/_layout/order-tracking")({
  component: OrderTrackingTemplate,
});
