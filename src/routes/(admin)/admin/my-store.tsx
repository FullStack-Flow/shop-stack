import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { MyShopsPageSkeleton } from "@/components/base/vendors/skeleton/shop-card-skeleton";
import { AddShopDialog } from "@/components/containers/shared/shops/add-shop-dialog";
import MyStoreTemplate from "@/components/templates/admin/my-store-template";
import type { ShopFormValues } from "@/types/shop";

export const Route = createFileRoute("/(admin)/admin/my-store")({
  component: AdminMyStorePage,
  loader: async () => {
    // Simulate loading delay for skeleton demonstration
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return {};
  },
  pendingComponent: MyShopsPageSkeleton,
});

const mockAdminShops = [
  {
    id: "1",
    slug: "official-shopstack-store",
    name: "Official ShopStack Store",
    description:
      "The official store for ShopStack merchandise and digital products.",
    logo: "",
    banner: "",
    category: "Merchandise",
    rating: 5.0,
    totalProducts: 24,
    totalOrders: 156,
    monthlyRevenue: "$3,450",
    status: "active" as const,
  },
];

function AdminMyStorePage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [shops, setShops] = useState(mockAdminShops);

  const handleCreateShop = () => {
    setIsDialogOpen(true);
  };

  const handleShopSubmit = (data: ShopFormValues) => {
    console.log("New admin shop data:", data);
    // Mock creation
    const newShop = {
      id: String(shops.length + 1),
      slug: data.name.toLowerCase().replace(/\s+/g, "-"),
      name: data.name,
      description: data.description,
      logo: "",
      banner: "",
      category: "General", // Default
      rating: 0,
      totalProducts: 0,
      totalOrders: 0,
      monthlyRevenue: "$0",
      status: "active" as const,
    };
    setShops([...shops, newShop]);
    setIsDialogOpen(false);
  };

  return (
    <>
      <MyStoreTemplate shops={shops} onAddShop={handleCreateShop} />

      <AddShopDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={handleShopSubmit}
      />
    </>
  );
}
