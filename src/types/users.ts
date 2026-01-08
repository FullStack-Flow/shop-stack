export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  totalOrders: number;
  totalSpent: string;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: Date;
}

export interface UserFormValues {
  name: string;
  email: string;
  status: 'active' | 'inactive' | 'suspended';
  avatar?: FileList | null;
}

export interface UserPermissions {
  canDelete: boolean;
  canEdit: boolean;
  canView: boolean;
  canCreate: boolean;
}
