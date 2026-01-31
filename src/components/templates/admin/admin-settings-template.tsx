import PageHeader from "@/components/base/common/page-header";
import { AdminSettingsTable } from "@/components/containers/admin/settings/admin-settings-table";

interface Setting {
  id: string;
  key: string;
  value: string;
  description: string;
  category: string;
  updatedAt: Date;
}

interface AdminSettingsTemplateProps {
  settings: Setting[];
}

export default function AdminSettingsTemplate({
  settings,
}: AdminSettingsTemplateProps) {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Settings"
        description="Manage platform settings and configurations"
      />

      <AdminSettingsTable data={settings} />
    </div>
  );
}
