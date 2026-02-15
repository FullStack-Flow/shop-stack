import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import AdminTenantDetailsTemplate from "@/components/templates/admin/tenants/admin-tenant-details-template";
import { useAdminShops } from "@/hooks/admin/use-admin-shops";

export const Route = createFileRoute("/(admin)/admin/tenants/$tenantId")({
  component: TenantDetailsPage,
});

function TenantDetailsPage() {
  const { tenantId } = Route.useParams();
  const { adminShopByIdQueryOptions } = useAdminShops();
  const { data, isLoading, isError, error } = useQuery(
    adminShopByIdQueryOptions(tenantId),
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-destructive">Failed to load tenant details</p>
        <p className="text-muted-foreground text-sm">
          {error?.message || "Please try again later"}
        </p>
      </div>
    );
  }

  const shop = data?.shop;
  if (!shop) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-muted-foreground">Tenant not found</p>
      </div>
    );
  }

  const tenant = {
    id: shop.id,
    name: shop.name,
    slug: shop.slug,
    description: shop.description ?? "",
    owner: {
      name: shop.ownerName ?? "Unknown",
      email: shop.ownerEmail ?? "Unknown",
      avatar: shop.ownerImage ?? undefined,
    },
    plan: "free",
    status: (shop.status ?? "pending") as "active" | "suspended" | "pending",
    joinedDate: shop.createdAt,
    stats: {
      revenue: shop.monthlyRevenue ?? "$0",
      orders: shop.totalOrders ?? 0,
      products: shop.totalProducts ?? 0,
      customers: 0,
    },
  };

  return <AdminTenantDetailsTemplate tenant={tenant} />;
}
