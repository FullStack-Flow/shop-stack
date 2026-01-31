import TenantHeader from "@/components/containers/admin/tenant/tenant-header";
import TenantStateOverview from "@/components/containers/admin/tenant/tenant-state-overview";
import TenantTabs from "@/components/containers/admin/tenant/tenant-tabs";
import type { AdminTenantDetailsProps } from "@/types/tenant";

export default function AdminTenantDetailsTemplate({
  tenant,
}: AdminTenantDetailsProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <TenantHeader tenant={tenant} />

      {/* Stats Overview */}
      <TenantStateOverview tenant={tenant} />

      {/* Tabs */}
      <TenantTabs tenant={tenant} />
    </div>
  );
}
