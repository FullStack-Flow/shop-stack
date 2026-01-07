import { Plus } from "lucide-react";
import PageHeader from "@/components/base/common/page-header";
import { Button } from "@/components/ui/button";

interface ReviewHeaderProps {
  onAddReview: () => void;
  className?: string;
}

export default function ReviewHeader({
  onAddReview,
  className,
}: ReviewHeaderProps) {
  return (
    <PageHeader
      title="Reviews"
      description="Manage customer reviews and ratings"
      className={className}
    >
      <Button onClick={onAddReview}>
        <Plus className="mr-2 size-4" />
        Add Review
      </Button>
    </PageHeader>
  );
}