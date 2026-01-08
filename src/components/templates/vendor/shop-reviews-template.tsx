import ReviewHeader from '@/components/containers/shared/reviews/review-header';
import ReviewTable from '@/components/containers/shared/reviews/review-table';
import { VENDOR_REVIEW_PERMISSIONS } from '@/lib/config/review-permissions';
import type { Review } from '@/types/review';

interface ShopReviewsTemplateProps {
  reviews: Review[];
  onUpdateStatus?: (reviewId: string, newStatus: string) => void;
  onDeleteReview?: (reviewId: string) => void;
}

export default function ShopReviewsTemplate({
  reviews,
  onUpdateStatus,
  onDeleteReview,
}: ShopReviewsTemplateProps) {
  return (
    <div className="space-y-6">
      <ReviewHeader role="vendor" />
      <ReviewTable
        reviews={reviews}
        permissions={VENDOR_REVIEW_PERMISSIONS}
        onUpdateStatus={onUpdateStatus}
        onDeleteReview={onDeleteReview}
      />
    </div>
  );
}
