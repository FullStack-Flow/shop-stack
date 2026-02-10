import { createFileRoute } from "@tanstack/react-router";
import { format } from "date-fns";
import { useCallback, useEffect, useState } from "react";
import { z } from "zod";
import OrderTrackingTemplate from "@/components/templates/store/order/order-tracking-template";
import { useOrderById } from "@/hooks/store/use-checkout";
import type { TrackingData } from "@/types/tracking-order";

const searchSchema = z.object({
  orderId: z.string().optional(),
});

export const Route = createFileRoute("/(store)/_layout/track-order")({
  validateSearch: (search) => searchSchema.parse(search),
  component: TrackOrderPage,
});

function TrackOrderPage() {
  const [queryId, setQueryId] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  const { orderId } = Route.useSearch();
  const { data: order, isLoading, error } = useOrderById(queryId);

  const handleSearch = useCallback((id: string) => {
    setQueryId(id);
    setHasSearched(true);
  }, []);

  useEffect(() => {
    if (orderId && !hasSearched) {
      setQueryId(orderId);
      setHasSearched(true);
    }
  }, [orderId, hasSearched]);

  // Generate timeline stages
  const generateStages = (
    status: string,
    createdAt: string,
    updatedAt: string,
  ) => {
    const statusOrder = [
      "pending",
      "confirmed",
      "processing",
      "shipped",
      "delivered",
    ];
    const currentIndex = statusOrder.indexOf(status);
    const createdDate = new Date(createdAt);
    const updatedDate = new Date(updatedAt);

    return [
      {
        id: "1",
        label: "Order Placed",
        date: format(createdDate, "dd MMM, h:mm a"),
        status:
          currentIndex >= 0 ? ("completed" as const) : ("pending" as const),
      },
      {
        id: "2",
        label: "Confirmed",
        date:
          currentIndex >= 1
            ? format(
                currentIndex === 0 ? createdDate : updatedDate,
                "dd MMM, h:mm a",
              )
            : undefined,
        status:
          currentIndex >= 1
            ? ("completed" as const)
            : currentIndex === 0
              ? ("active" as const)
              : ("pending" as const),
      },
      {
        id: "3",
        label: "Processing",
        date:
          currentIndex >= 2 ? format(updatedDate, "dd MMM, h:mm a") : undefined,
        status:
          currentIndex >= 2
            ? ("completed" as const)
            : currentIndex === 1
              ? ("active" as const)
              : ("pending" as const),
      },
      {
        id: "4",
        label: "Shipped",
        date:
          currentIndex >= 3 ? format(updatedDate, "dd MMM, h:mm a") : undefined,
        status:
          currentIndex >= 3
            ? ("completed" as const)
            : currentIndex === 2
              ? ("active" as const)
              : ("pending" as const),
      },
      {
        id: "5",
        label: "Delivered",
        date:
          currentIndex >= 4 ? format(updatedDate, "dd MMM, h:mm a") : undefined,
        status:
          currentIndex >= 4
            ? ("completed" as const)
            : currentIndex === 3
              ? ("active" as const)
              : ("pending" as const),
      },
    ];
  };

  let trackingData: TrackingData | null = null;

  if (order) {
    const stages = generateStages(
      order.status,
      order.createdAt,
      order.updatedAt,
    );

    // Create a mock update based on current status
    // In a real app, this would come from a shipping provider API
    const updates = [
      {
        id: "1",
        timestamp: format(new Date(order.updatedAt), "dd MMM, h:mm a"),
        location: "System Update",
        status: `Order is currently ${order.status}`,
        isLatest: true,
      },
      {
        id: "2",
        timestamp: format(new Date(order.createdAt), "dd MMM, h:mm a"),
        location: "System Update",
        status: "Order placed successfully",
        isLatest: false,
      },
    ];

    trackingData = {
      orderId: order.orderNumber,
      orderDate: format(new Date(order.createdAt), "dd MMM, yyyy"),
      itemsCount: order.items.length,
      total: order.totalAmount,
      carrier: order.shippingMethod || "Standard Shipping",
      trackingNumber: "Pending", // We don't have this in schema yet
      currentLocation: "Processing Center", // Placeholder
      estimatedDelivery: "Calculated at checkout",
      packageInfo: {
        weight: "N/A",
        dimensions: "N/A",
      },
      stages,
      updates,
    };
  }

  return (
    <OrderTrackingTemplate
      onSearch={handleSearch}
      isLoading={isLoading}
      data={trackingData}
      error={error}
      hasSearched={hasSearched}
    />
  );
}
