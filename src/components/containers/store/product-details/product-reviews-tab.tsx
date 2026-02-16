import { MessageSquare, Star } from "lucide-react";
import { useState } from "react";
import RatingSummary from "@/components/base/products/details/review/rating-summary";
import ReviewCard from "@/components/base/products/details/review/review-card";
import ReviewFormCta from "@/components/base/products/details/review/review-form-cta";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useProductReviews,
  useReviewEligibility,
  useReviewMutations,
} from "@/hooks/store/use-reviews";
import type { StoreReviewResponse } from "@/lib/helper/review-query-helpers";
import { ReviewFormDialog } from "./review-form-dialog";

interface ProductReviewsTabProps {
  productId: string;
}

type SortOption = "newest" | "oldest" | "highest" | "lowest" | "helpful";

export default function ProductReviewsTab({
  productId,
}: ProductReviewsTabProps) {
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);

  // Fetch product reviews
  const {
    data: reviewsData,
    isLoading,
    error,
  } = useProductReviews(productId, {
    limit: 10,
    offset: 0,
    sortBy,
  });

  // Check review eligibility
  const { data: eligibility } = useReviewEligibility(productId);

  // Review mutations
  const { voteHelpful } = useReviewMutations();

  // Handle helpful vote
  const handleVoteHelpful = (reviewId: string) => {
    voteHelpful.mutate({ reviewId, productId });
  };

  // Handle write review click
  const handleWriteReview = () => {
    setIsReviewDialogOpen(true);
  };

  // Extract data from response
  const reviews = reviewsData?.reviews ?? [];
  const totalRatings = reviewsData?.total ?? 0;
  const ratingStats = reviewsData?.ratingStats;
  const averageRating = ratingStats?.average ?? 0;
  const ratingBreakdown = ratingStats?.breakdown ?? {
    5: 0,
    4: 0,
    3: 0,
    2: 0,
    1: 0,
  };

  // Check if user can review
  const canReview = eligibility?.canReview ?? false;
  const eligibleOrderItems = eligibility?.eligibleOrderItems ?? [];

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-10">
        <div className="grid @5xl:grid-cols-12 gap-8">
          <div className="@5xl:col-span-8">
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-32 animate-pulse rounded-lg bg-muted"
                />
              ))}
            </div>
          </div>
          <div className="@5xl:col-span-4">
            <div className="h-64 animate-pulse rounded-lg bg-muted" />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <MessageSquare className="mb-4 h-12 w-12 text-muted-foreground" />
        <h3 className="mb-2 font-semibold text-lg">Unable to load reviews</h3>
        <p className="text-muted-foreground text-sm">
          There was an error loading reviews. Please try again later.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="grid @5xl:grid-cols-12 gap-8">
        <div className="@5xl:col-span-8">
          {/* Header with sort */}
          <div className="mb-6 flex items-center justify-between">
            <h3 className="font-semibold text-lg">
              Customer Reviews ({totalRatings})
            </h3>
            {reviews.length > 0 && (
              <Select
                value={sortBy}
                onValueChange={(value) => setSortBy(value as SortOption)}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="highest">Highest Rated</SelectItem>
                  <SelectItem value="lowest">Lowest Rated</SelectItem>
                  <SelectItem value="helpful">Most Helpful</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Reviews list */}
          {reviews.length > 0 ? (
            <div className="space-y-2">
              {reviews.map((review: StoreReviewResponse) => (
                <ReviewCard
                  key={review.id}
                  userName={review.userName}
                  userAvatar={review.userAvatar ?? ""}
                  date={new Date(review.createdAt).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                  rating={review.rating}
                  reviewText={review.comment}
                  isVerifiedPurchase={review.isVerifiedPurchase}
                  helpfulCount={review.helpfulCount}
                  hasVotedHelpful={review.hasVotedHelpful}
                  onVoteHelpful={() => handleVoteHelpful(review.id)}
                  isVoting={voteHelpful.isPending}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Star className="mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 font-semibold text-lg">No reviews yet</h3>
              <p className="text-muted-foreground text-sm">
                Be the first to review this product!
              </p>
            </div>
          )}
        </div>

        <div className="@5xl:col-span-4">
          <RatingSummary
            averageRating={averageRating}
            totalRatings={totalRatings}
            ratingBreakdown={ratingBreakdown}
            className="@2xl:flex-row @5xl:flex-col flex-col"
          />
          <ReviewFormCta
            canReview={canReview}
            onReviewClick={handleWriteReview}
            className="mt-6"
          />
        </div>
      </div>

      {/* Review Form Dialog */}
      <ReviewFormDialog
        open={isReviewDialogOpen}
        onOpenChange={setIsReviewDialogOpen}
        productId={productId}
        eligibleOrderItems={eligibleOrderItems}
      />
    </div>
  );
}
