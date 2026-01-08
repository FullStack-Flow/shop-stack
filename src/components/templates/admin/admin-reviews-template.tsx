import ReviewHeader from "@/components/containers/shared/reviews/review-header";
import ReviewTable from "@/components/containers/shared/reviews/review-table";
import { ADMIN_REVIEW_PERMISSIONS } from "@/lib/config/review-permissions";
import type { Review } from "@/types/review";

interface AdminReviewsTemplateProps {
  reviews: Review[];
  onReviewStatusChange: (
    reviewId: string,
    newStatus: "published" | "pending" | "rejected"
  ) => void;
}

export default function AdminReviewsTemplate({
  reviews,
  onReviewStatusChange,
}: AdminReviewsTemplateProps) {
  return (
    <>
      <ReviewHeader />
      <ReviewTable
        reviews={reviews}
        permissions={ADMIN_REVIEW_PERMISSIONS}
        onUpdateStatus={onReviewStatusChange}
      />
    </>
  );
}
