import { createFileRoute } from "@tanstack/react-router";
import { MyShopsPageSkeleton } from "@/components/base/vendors/skeleton/shop-card-skeleton";
import { AddShopDialog } from "@/components/containers/shared/shops/add-shop-dialog";
import MyShopsTemplate from "@/components/templates/vendor/my-shops-template";
import { useEntityCRUD } from "@/hooks/common/use-entity-crud";
import {
  useShops,
  useTransformedShops,
  vendorShopsQueryOptions,
} from "@/hooks/vendors/use-shops";
import type { ShopFormValues } from "@/types/shop";

export const Route = createFileRoute("/(admin)/admin/my-store")({
  component: AdminMyStorePage,
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(vendorShopsQueryOptions());
    return {};
  },
  pendingComponent: MyShopsPageSkeleton,
});

function AdminMyStorePage() {
  const { createShop, isCreating } = useShops();
  const { shops, vendorId: currentVendorId } = useTransformedShops({
    filterByVendor: true,
  });

  // Use shared CRUD hook
  const {
    isDialogOpen,
    setIsDialogOpen,
    handleAdd: handleAddShop,
    handleDialogClose,
  } = useEntityCRUD<any>({
    onDelete: async (_id) => {
      // Delete logic if needed
    },
  });

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
      handleDialogClose();
    } catch (error) {
      console.error("Failed to create shop:", error);
    }
  };

  return (
    <>
      <MyShopsTemplate
        shops={shops}
        onCreateShop={handleAddShop}
        currentVendorId={currentVendorId}
        title="My Store"
        description="Manage your own store directly from the admin panel."
      />

      <AddShopDialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) handleDialogClose();
        }}
        onSubmit={handleShopSubmit}
        isSubmitting={isCreating}
      />
    </>
  );
}
