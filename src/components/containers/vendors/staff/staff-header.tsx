import { Plus } from "lucide-react";
import PageHeader from "@/components/base/common/page-header";
import { Button } from "@/components/ui/button";

interface StaffHeaderProps {
  onAddStaff: () => void;
  className?: string;
}

export default function StaffHeader({
  onAddStaff,
  className,
}: StaffHeaderProps) {
  return (
    <PageHeader
      title="Staff Members"
      description="Manage your shop staff and their roles"
      className={className}
    >
      <Button onClick={onAddStaff}>
        <Plus className="mr-2 size-4" />
        Add Staff Member
      </Button>
    </PageHeader>
  );
}