import { Plus } from "lucide-react";
import { useMemo } from "react";
import DataTable from "@/components/base/data-table/data-table";
import { createReviewColumns } from "@/components/containers/shared/reviews/review-table-columns";
import { Button } from "@/components/ui/button";
import type { Review, ReviewPermissions } from "@/types/review";

interface ReviewTableProps {
  reviews: Review[];
  permissions?: ReviewPermissions;
  onUpdateStatus?: (reviewId: string, newStatus: Review["status"]) => void;
  onDeleteReview?: (reviewId: string) => void;
  onAddReview?: () => void;
  className?: string;
}

export default function ReviewTable({
  reviews,
  permissions = {
    canDelete: false,
    canEdit: true,
    canView: true,
    canUpdateStatus: true,
  },
  onUpdateStatus,
  onDeleteReview,
  onAddReview,
  className,
}: ReviewTableProps) {
  const columns = useMemo(() => {
    return createReviewColumns({ permissions, onUpdateStatus, onDeleteReview });
  }, [permissions, onUpdateStatus, onDeleteReview]);

  return (
    <div className="space-y-4">
      {onAddReview && (
        <div className="flex justify-end">
          <Button onClick={onAddReview} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Review
          </Button>
        </div>
      )}
      <DataTable columns={columns} data={reviews} className={className} />
    </div>
  );
}
