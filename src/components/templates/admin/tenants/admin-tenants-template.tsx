import PageHeader from "@/components/base/common/page-header";
import AdminTenantTable from "@/components/containers/admin/tenant/admin-tenant-table";
import type { AdminTenant } from "@/types/tenant";

interface AdminTenantsTemplateProps {
  tenants: AdminTenant[];
}

export default function AdminTenantsTemplate({
  tenants,
}: AdminTenantsTemplateProps) {
  return (
    <>
      <PageHeader
        title="Tenants"
        description="Manage all registered shops and vendors"
      />

      <AdminTenantTable tenants={tenants} />
    </>
  );
}
