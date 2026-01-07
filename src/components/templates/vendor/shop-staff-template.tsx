import StaffHeader from "@/components/containers/vendors/staff/staff-header";
import StaffTable from "@/components/containers/vendors/staff/staff-table";
import { Staff } from "@/types/staff";

interface ShopStaffTemplateProps {
  staff: Staff[];
  onAddStaff: () => void;
}

export default function ShopStaffTemplate({
  staff,
  onAddStaff,
}: ShopStaffTemplateProps) {
  return (
    <div className="space-y-6">
      <StaffHeader onAddStaff={onAddStaff} />
      <StaffTable staff={staff} />
    </div>
  );
}