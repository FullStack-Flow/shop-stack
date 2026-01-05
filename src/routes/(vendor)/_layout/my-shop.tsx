import { MyShopsPageSkeleton } from "@/components/base/vendors/skeleton/shop-card-skeleton";
import MyShopsTemplate from "@/components/templates/vendor/my-shops-template";
import { mockShops } from "@/data/my-shops";
import { createFileRoute } from "@tanstack/react-router";

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
  const handleCreateShop = () => {
    // TODO: Implement create shop functionality
    console.log("Create new shop clicked");
  };
  return <MyShopsTemplate shops={mockShops} onCreateShop={handleCreateShop} />;
}
