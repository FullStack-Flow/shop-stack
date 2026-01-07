import { Download } from "lucide-react";
import PageHeader from "@/components/base/common/page-header";
import { Button } from "@/components/ui/button";

interface OrderHeaderProps {
  className?: string;
}

export default function OrderHeader({ className }: OrderHeaderProps) {
  return (
    <PageHeader
      title="Orders"
      description="Manage and track your shop orders"
      className={className}
    >
      <Button variant="outline">
        <Download className="mr-2 size-4" />
        Export Orders
      </Button>
    </PageHeader>
  );
}
