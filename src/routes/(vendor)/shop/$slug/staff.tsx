import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AddStaffDialog } from "@/components/containers/shared/staff/add-staff-dialog";
import ShopStaffTemplate from "@/components/templates/vendor/shop-staff-template";
import { mockStaff } from "@/data/staff";
import type { Staff, StaffFormValues } from "@/types/staff";

export const Route = createFileRoute("/(vendor)/shop/$slug/staff")({
  component: StaffPage,
});

function StaffPage() {
  const [staff, setStaff] = useState<Staff[]>(mockStaff);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleAddStaff = () => {
    setIsDialogOpen(true);
  };

  const handleStaffSubmit = (data: StaffFormValues) => {
    const newStaff: Staff = {
      id: String(staff.length + 1),
      name: data.name,
      email: data.email,
      role: data.role,
      avatar: data.avatar ? URL.createObjectURL(data.avatar[0]) : undefined,
      status: data.status,
      joinedDate: new Date().toISOString().split("T")[0],
    };

    setStaff([...staff, newStaff]);
    console.log("Created staff:", newStaff);
  };

  return (
    <>
      <ShopStaffTemplate staff={staff} onAddStaff={handleAddStaff} />

      <AddStaffDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={handleStaffSubmit}
      />
    </>
  );
}
