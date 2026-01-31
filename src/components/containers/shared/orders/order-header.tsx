import { Download } from "lucide-react";
import PageHeader from "@/components/base/common/page-header";
import { Button } from "@/components/ui/button";

export interface OrderHeaderProps {
  role?: "admin" | "vendor";
  children?: React.ReactNode;
  className?: string;
}

export default function OrderHeader({
  role = "vendor",
  children,
  className,
}: OrderHeaderProps) {
  return (
    <PageHeader
      title="Orders"
      description={
        role === "admin"
          ? "Manage platform-wide orders and shipping"
          : "Manage and track your shop orders"
      }
      className={className}
    >
      <Button variant="outline">
        <Download className="mr-2 size-4" />
        Export Orders
      </Button>
      {children}
    </PageHeader>
  );
}
