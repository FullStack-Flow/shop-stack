import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import AdminOrdersTemplate from "@/components/templates/admin/admin-orders-template";
import { mockOrders } from "@/data/orders";
import type { Order } from "@/types/orders";

export const Route = createFileRoute("/(admin)/admin/orders/")({
  component: AdminOrdersPage,
});

function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>(mockOrders);

  const handleAddOrder = (
    data: Omit<Order, "id" | "date" | "customer"> & {
      customerName: string;
      customerEmail: string;
    }
  ) => {
    const newOrder: Order = {
      ...data,
      id: String(orders.length + 1),
      date: new Date().toISOString().split("T")[0],
      customer: {
        name: data.customerName,
        email: data.customerEmail,
      },
    };
    setOrders([...orders, newOrder]);
  };

  const handleDeleteOrder = (id: string) => {
    setOrders(orders.filter((order) => order.id !== id));
  };

  return (
    <AdminOrdersTemplate
      orders={orders}
      onAddOrder={handleAddOrder}
      onDeleteOrder={handleDeleteOrder}
    />
  );
}
