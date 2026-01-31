import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import AdminStaffTemplate from "@/components/templates/admin/admin-staff-template";
import { mockStaff } from "@/data/staff";
import type { Staff } from "@/types/staff";

export const Route = createFileRoute("/(admin)/admin/staff/")({
  component: AdminStaffPage,
});

function AdminStaffPage() {
  const [staff, setStaff] = useState<Staff[]>(mockStaff);

  const handleAddStaff = (data: Omit<Staff, "id" | "joinedDate">) => {
    const newStaff: Staff = {
      ...data,
      id: String(staff.length + 1),
      joinedDate: new Date().toISOString(),
    };
    setStaff([...staff, newStaff]);
  };

  const handleDeleteStaff = (id: string) => {
    setStaff(staff.filter((s) => s.id !== id));
  };

  return (
    <AdminStaffTemplate
      staff={staff}
      onAddStaff={handleAddStaff}
      onDeleteStaff={handleDeleteStaff}
    />
  );
}
