import { Plus } from "lucide-react";
import PageHeader from "@/components/base/common/page-header";
import { Button } from "@/components/ui/button";

interface TagsHeaderProps {
  onAddTag: () => void;
  className?: string;
}

export default function TagsHeader({
  onAddTag,
  className,
}: TagsHeaderProps) {
  return (
    <PageHeader
      title="Tags"
      description="Manage your product tags and labels"
      className={className}
    >
      <Button onClick={onAddTag}>
        <Plus className="mr-2 size-4" />
        Add Tag
      </Button>
    </PageHeader>
  );
}