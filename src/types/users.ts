export type UserRole = "admin" | "vendor" | "customer";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  image?: string;
  role: UserRole;
  banned: boolean;
  status: "active" | "banned";
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface AdminUserFormValues {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface ListUsersResponse {
  users: AdminUser[];
  total: number;
  limit: number;
  offset: number;
}

export interface UserPermissions {
  canDelete: boolean;
  canEdit: boolean;
  canView: boolean;
  canCreate: boolean;
}
