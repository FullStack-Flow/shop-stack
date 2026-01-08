import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { MyShopsPageSkeleton } from "@/components/base/vendors/skeleton/shop-card-skeleton";
import { AddShopDialog } from "@/components/containers/shared/shops/add-shop-dialog";
import MyShopsTemplate from "@/components/templates/vendor/my-shops-template";
import { mockShops } from "@/data/my-shops";
import type { ShopFormValues } from "@/types/shop";

export const Route = createFileRoute("/(vendor)/_layout/my-shop")({
  component: MyShopPage,
  loader: async () => {
    // Simulate loading delay for skeleton demonstration
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return {};
  },
  pendingComponent: MyShopsPageSkeleton,
});

function MyShopPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [shops, setShops] = useState(mockShops);

  const handleCreateShop = () => {
    // TODO: Implement create shop functionality
    console.log("Create new shop clicked");
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
      <MyShopsTemplate shops={mockShops} onCreateShop={handleCreateShop} />

      <AddShopDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={handleShopSubmit}
      />
    </>
  );
}
