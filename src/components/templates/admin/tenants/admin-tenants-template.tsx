import PageHeader from "@/components/base/common/page-header";
import type { DataTableServer } from "@/components/base/data-table/types";
import AdminTenantTable from "@/components/containers/admin/tenant/admin-tenant-table";
import type { AdminTenant } from "@/types/tenant";

interface AdminTenantsTemplateProps {
  fetcher: DataTableServer<AdminTenant>["fetcher"];
}

export default function AdminTenantsTemplate({
  fetcher,
}: AdminTenantsTemplateProps) {
  return (
    <>
      <PageHeader
        title="Tenants"
        description="Manage all registered shops and vendors"
      />

      <AdminTenantTable fetcher={fetcher} />
    </>
  );
}
