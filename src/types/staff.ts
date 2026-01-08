export interface Staff {
  id: string;
  name: string;
  email: string;
  role: "admin" | "manager" | "staff";
  status: "active" | "invited" | "inactive";
  joinedDate: string;
  avatar?: string;
}

export interface StaffFormValues {
  name: string;
  email: string;
  role: "admin" | "manager" | "staff";
  status: "active" | "invited" | "inactive";
  avatar?: FileList | null;
}

export interface StaffPermissions {
  canDelete: boolean;
  canEdit: boolean;
  canView: boolean;
  canCreate: boolean;
}
