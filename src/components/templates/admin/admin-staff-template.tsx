import { Plus } from "lucide-react";
import { useState } from "react";
import { AddStaffDialog } from "@/components/containers/shared/staff/add-staff-dialog";
import StaffHeader from "@/components/containers/shared/staff/staff-header";
import StaffTable from "@/components/containers/shared/staff/staff-table";
import { Button } from "@/components/ui/button";
import { ADMIN_STAFF_PERMISSIONS } from "@/lib/config/staff-permissions";
import type { Staff } from "@/types/staff";

interface AdminStaffTemplateProps {
  staff: Staff[];
  onAddStaff: (data: Omit<Staff, "id" | "joinedDate">) => void;
  onDeleteStaff: (id: string) => void;
}

export default function AdminStaffTemplate({
  staff,
  onAddStaff,
  onDeleteStaff,
}: AdminStaffTemplateProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const handleAddStaff = (data: any) => {
    const newStaff: Omit<Staff, "id" | "joinedDate"> = {
      ...data,
      avatar: undefined,
    };
    onAddStaff(newStaff);
  };

  return (
    <div className="flex flex-col gap-6">
      <StaffHeader>
        <AddStaffDialog
          open={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
          onSubmit={handleAddStaff}
        />
        <Button onClick={() => setIsAddDialogOpen(true)} size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Add Staff
        </Button>
      </StaffHeader>

      <StaffTable
        staff={staff}
        permissions={ADMIN_STAFF_PERMISSIONS}
        onDeleteStaff={onDeleteStaff}
      />
    </div>
  );
}
