import { Plus } from "lucide-react";
import PageHeader from "@/components/base/common/page-header";
import { Button } from "@/components/ui/button";

export interface TagHeaderProps {
  onAddTag?: () => void;
  role?: "admin" | "vendor";
  showAddButton?: boolean;
  children?: React.ReactNode;
  className?: string;
}

export default function TagHeader({
  onAddTag,
  role = "vendor",
  showAddButton = true,
  children,
  className,
}: TagHeaderProps) {
  return (
    <PageHeader
      title="Tags"
      description={
        role === "admin"
          ? "Manage tags across the platform"
          : "Manage your tags"
      }
      className={className}
    >
      {children}
      {showAddButton && onAddTag && (
        <Button onClick={onAddTag}>
          <Plus className="mr-2 h-4 w-4" />
          Add Tag
        </Button>
      )}
    </PageHeader>
  );
}
