import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { MyShopsPageSkeleton } from "@/components/base/vendors/skeleton/shop-card-skeleton";
import { AddShopDialog } from "@/components/containers/shared/shops/add-shop-dialog";
import MyShopsTemplate from "@/components/templates/vendor/my-shops-template";
import { useShops, vendorShopsQueryOptions } from "@/hooks/vendors/use-shops";
import type { ShopFormValues } from "@/types/shop";

export const Route = createFileRoute("/(vendor)/_layout/my-shop")({
  component: MyShopPage,
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(vendorShopsQueryOptions());
    return {};
  },
  pendingComponent: MyShopsPageSkeleton,
});

function MyShopPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { createShop, isCreating, shopsQueryOptions } = useShops();

  // Fetch shops data
  const { data } = useSuspenseQuery(shopsQueryOptions());
  const shops = data?.shops ?? [];
  const currentVendorId = data?.vendorId;

  const handleCreateShop = () => {
    setIsDialogOpen(true);
  };

  const handleShopSubmit = async (data: ShopFormValues) => {
    try {
      await createShop({
        name: data.name,
        slug: data.slug,
        description: data.description,
        logo: data.logo || undefined,
        banner: data.banner || undefined,
        address: data.address,
        phone: data.phone,
        email: data.email,
        enableNotifications: data.enableNotification,
      });
      setIsDialogOpen(false);
    } catch (error) {
      // Error is handled by the mutation's onError callback
      console.error("Failed to create shop:", error);
    }
  };
  return (
    <>
      <MyShopsTemplate
        shops={shops}
        onCreateShop={handleCreateShop}
        currentVendorId={currentVendorId}
      />

      <AddShopDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={handleShopSubmit}
        isSubmitting={isCreating}
      />
    </>
  );
}
