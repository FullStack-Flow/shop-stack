import AdminTenantsTemplate from "@/components/templates/admin/tenants/admin-tenants-template";
import { mockTenants } from "@/data/tenant";
import { AdminTenant } from "@/types/tenant";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/(admin)/admin/tenants/")({
  component: AdminTenantsPage,
});

function AdminTenantsPage() {
  const [tenants] = useState<AdminTenant[]>(mockTenants);

  return <AdminTenantsTemplate tenants={tenants} />;
}
