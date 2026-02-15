import ReviewHeader from "@/components/containers/shared/reviews/review-header";
import ReviewTable from "@/components/containers/shared/reviews/review-table";
import { ADMIN_REVIEW_PERMISSIONS } from "@/lib/config/review-permissions";
import type { Review } from "@/types/review";

interface AdminReviewsTemplateProps {
  reviews: Review[];
  onReviewStatusChange: (
    reviewId: string,
    newStatus: "approved" | "pending" | "rejected",
  ) => void;
  onDeleteReview: (reviewId: string) => void;
}

export default function AdminReviewsTemplate({
  reviews,
  onReviewStatusChange,
  onDeleteReview,
}: AdminReviewsTemplateProps) {
  return (
    <>
      <ReviewHeader role="admin" showAddButton={false} />
      <ReviewTable
        reviews={reviews}
        permissions={ADMIN_REVIEW_PERMISSIONS}
        onUpdateStatus={onReviewStatusChange}
        onDeleteReview={onDeleteReview}
      />
    </>
  );
}
