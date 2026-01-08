import { useState } from "react";
import PageHeader from "@/components/base/common/page-header";
import { AddStaffDialog } from "./add-staff-dialog";
import type { StaffFormValues } from "@/types/staff";

export interface StaffHeaderProps {
  onAddStaff?: (data: StaffFormValues) => void;
  role?: "admin" | "vendor";
  showAddButton?: boolean;
  children?: React.ReactNode;
  className?: string;
}

export default function StaffHeader({
  onAddStaff,
  role = "vendor",
  showAddButton = true,
  children,
  className,
}: StaffHeaderProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const handleAddStaff = (data: StaffFormValues) => {
    onAddStaff?.(data);
  };

  return (
    <PageHeader
      title="Staff Members"
      description={
        role === "admin"
          ? "Manage platform-wide staff and their roles"
          : "Manage your shop staff and their roles"
      }
      className={className}
    >
      {children}
      {showAddButton && (
        <AddStaffDialog
          open={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
          onSubmit={handleAddStaff}
        />
      )}
    </PageHeader>
  );
}
