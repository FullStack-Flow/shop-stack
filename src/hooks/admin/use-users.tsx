/**
 * Admin Users Hook
 *
 * React hook for admin user management with TanStack Query.
 * Uses server functions for SSR-compatible data fetching.
 * Uses Better Auth client directly for mutations.
 */

import {
  queryOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { admin } from "@/lib/auth/auth-client";
import { getUsers } from "@/lib/functions/users";
import type { UserRole } from "@/types/users";

// ============================================================================
// Query Options
// ============================================================================

/**
 * Query options for fetching users list
 */
export const usersQueryOptions = () =>
  queryOptions({
    queryKey: ["admin", "users"],
    queryFn: () => getUsers(),
  });

// ============================================================================
// Mutations Hook
// ============================================================================

/**
 * Hook providing mutations for admin user management
 */
export const useUserMutations = () => {
  const queryClient = useQueryClient();

  const invalidateUsers = () => {
    queryClient.invalidateQueries({
      queryKey: ["admin", "users"],
    });
  };

  // Create user mutation using auth client
  const createUserMutation = useMutation({
    mutationFn: async (data: {
      email: string;
      password: string;
      name: string;
      role?: UserRole;
    }) => {
      const result = await admin.createUser({
        email: data.email,
        password: data.password,
        name: data.name,
        role: data.role as any,
      });
      if (result.error)
        throw new Error(result.error.message || "Failed to create user");
      return result.data;
    },
    onSuccess: () => {
      toast.success("User created successfully");
      invalidateUsers();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create user");
    },
  });

  // Ban user mutation using auth client
  const banUserMutation = useMutation({
    mutationFn: async (data: { userId: string; reason?: string }) => {
      const result = await admin.banUser({
        userId: data.userId,
        banReason: data.reason,
      });
      if (result.error)
        throw new Error(result.error.message || "Failed to ban user");
      return result.data;
    },
    onSuccess: () => {
      toast.error("User has been banned");
      invalidateUsers();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to ban user");
    },
  });

  // Unban user mutation using auth client
  const unbanUserMutation = useMutation({
    mutationFn: async (data: { userId: string }) => {
      const result = await admin.unbanUser({ userId: data.userId });
      if (result.error)
        throw new Error(result.error.message || "Failed to unban user");
      return result.data;
    },
    onSuccess: () => {
      toast.success("User has been unbanned");
      invalidateUsers();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to unban user");
    },
  });

  // Update role mutation using auth client
  const updateRoleMutation = useMutation({
    mutationFn: async (data: { userId: string; role: UserRole }) => {
      const result = await admin.setRole({
        userId: data.userId,
        role: data.role as any,
      });
      if (result.error)
        throw new Error(result.error.message || "Failed to update role");
      return result.data;
    },
    onSuccess: (_, variables) => {
      toast.success(`User role updated to ${variables.role}`);
      invalidateUsers();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update role");
    },
  });

  // Delete user mutation using auth client
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const result = await admin.removeUser({ userId });
      if (result.error)
        throw new Error(result.error.message || "Failed to delete user");
      return result.data;
    },
    onSuccess: () => {
      toast.success("User deleted successfully");
      invalidateUsers();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete user");
    },
  });

  return {
    createUser: createUserMutation.mutateAsync,
    banUser: banUserMutation.mutateAsync,
    unbanUser: unbanUserMutation.mutateAsync,
    updateRole: updateRoleMutation.mutateAsync,
    deleteUser: deleteUserMutation.mutateAsync,
    isCreating: createUserMutation.isPending,
    isBanning: banUserMutation.isPending,
    isUnbanning: unbanUserMutation.isPending,
    isUpdatingRole: updateRoleMutation.isPending,
    isDeleting: deleteUserMutation.isPending,
  };
};

// ============================================================================
// Combined Hook
// ============================================================================

export const useUsers = () => {
  const mutations = useUserMutations();
  return {
    queryOptions: usersQueryOptions,
    ...mutations,
  };
};
