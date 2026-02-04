import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ConfirmDeleteDialog } from "@/components/base/common/confirm-delete-dialog";
import { PageSkeleton } from "@/components/base/common/page-skeleton";
import { AddUserDialog } from "@/components/containers/shared/users/add-user-dialog";
import AdminUsersTemplate from "@/components/templates/admin/admin-users-template";
import { useUsers } from "@/hooks/admin/use-users";
import type { AdminUser, AdminUserFormValues, UserRole } from "@/types/users";

export const Route = createFileRoute("/(admin)/admin/users/")({
  component: AdminUsersPage,
});

function AdminUsersPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [deletingUser, setDeletingUser] = useState<AdminUser | null>(null);
  const {
    queryOptions,
    createUser,
    deleteUser,
    banUser,
    unbanUser,
    updateRole,
    isCreating,
    isDeleting,
  } = useUsers();
  const { data, isLoading, isError } = useQuery(queryOptions());
  const users = data?.users ?? [];

  const handleAddUser = async (data: AdminUserFormValues) => {
    await createUser(data);
  };

  const handleConfirmDelete = async () => {
    if (!deletingUser) return;
    await deleteUser(deletingUser.id);
    setDeletingUser(null);
  };

  const handleBanUser = async (userId: string) => {
    await banUser({ userId });
  };

  const handleUnbanUser = async (userId: string) => {
    await unbanUser({ userId });
  };

  const handleUpdateRole = async (userId: string, role: UserRole) => {
    await updateRole({ userId, role });
  };

  if (isLoading) {
    return <PageSkeleton />;
  }

  if (isError) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-destructive">
        Failed to load users.
      </div>
    );
  }

  return (
    <>
      <AddUserDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSubmit={handleAddUser}
        isSubmitting={isCreating}
      />
      <ConfirmDeleteDialog
        open={!!deletingUser}
        onOpenChange={(open) => {
          if (!open) setDeletingUser(null);
        }}
        onConfirm={handleConfirmDelete}
        itemName={deletingUser?.name}
        entityType="user"
        isDeleting={isDeleting}
      />
      <AdminUsersTemplate
        users={users}
        onOpenAddDialog={() => setIsAddDialogOpen(true)}
        onDeleteUser={(userId) =>
          setDeletingUser(users.find((user) => user.id === userId) ?? null)
        }
        onBanUser={handleBanUser}
        onUnbanUser={handleUnbanUser}
        onUpdateRole={handleUpdateRole}
      />
    </>
  );
}
