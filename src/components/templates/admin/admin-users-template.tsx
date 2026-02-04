import UserHeader from "@/components/containers/shared/users/user-header";
import UserTable from "@/components/containers/shared/users/user-table";
import { ADMIN_USER_PERMISSIONS } from "@/lib/config/user-permissions";
import type { AdminUser, UserRole } from "@/types/users";

interface AdminUsersTemplateProps {
  users: AdminUser[];
  onOpenAddDialog?: () => void;
  onDeleteUser: (userId: string) => void;
  onBanUser: (userId: string) => void;
  onUnbanUser: (userId: string) => void;
  onUpdateRole: (userId: string, role: UserRole) => void;
}

export default function AdminUsersTemplate({
  users,
  onOpenAddDialog,
  onDeleteUser,
  onBanUser,
  onUnbanUser,
  onUpdateRole,
}: AdminUsersTemplateProps) {
  return (
    <div className="space-y-6">
      <UserHeader onAdd={onOpenAddDialog} role="admin" />
      <UserTable
        users={users}
        permissions={ADMIN_USER_PERMISSIONS}
        onDeleteUser={onDeleteUser}
        onBanUser={onBanUser}
        onUnbanUser={onUnbanUser}
        onUpdateRole={onUpdateRole}
      />
    </div>
  );
}
