import { MessageSquare, Star, ThumbsUp } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useReviewMutations, useShopReviews } from "@/hooks/store/use-reviews";
import type { StoreReviewResponse } from "@/lib/helper/review-query-helpers";

interface StoreReviewsProps {
  shopId: string;
  rating: number;
  reviewCount: number;
}

export function StoreReviews({
  shopId,
  rating,
  reviewCount,
}: StoreReviewsProps) {
  // Fetch shop reviews
  const {
    data: reviewsData,
    isLoading,
    error,
  } = useShopReviews(shopId, {
    limit: 10,
    offset: 0,
  });

  // Review mutations for helpful voting
  const { voteHelpful } = useReviewMutations();

  // Extract data from response
  const reviews = reviewsData?.reviews ?? [];
  const totalReviews = reviewsData?.total ?? reviewCount;
  const ratingStats = reviewsData?.ratingStats;
  const ratingBreakdown = ratingStats?.breakdown ?? {
    5: 0,
    4: 0,
    3: 0,
    2: 0,
    1: 0,
  };

  // Calculate rating distribution
  const ratingDistribution = [5, 4, 3, 2, 1].map((star) => {
    const count = ratingBreakdown[star as keyof typeof ratingBreakdown] || 0;
    const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
    return { star, count, percentage };
  });

  // Handle helpful vote
  const handleVoteHelpful = (reviewId: string) => {
    voteHelpful.mutate({ reviewId, productId: "" }); // productId not needed for shop reviews invalidation
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-8">
        <Card>
          <CardContent className="p-6">
            <div className="grid @2xl:grid-cols-2 gap-8">
              <div className="flex flex-col items-center justify-center space-y-2 border-muted @2xl:border-r p-6">
                <div className="h-12 w-20 animate-pulse rounded bg-muted" />
                <div className="h-5 w-32 animate-pulse rounded bg-muted" />
              </div>
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-6 animate-pulse rounded bg-muted" />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
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
    <div className="space-y-8">
      {/* Rating Overview */}
      <Card>
        <CardContent className="p-6">
          <div className="grid @2xl:grid-cols-2 gap-8">
            {/* Overall Rating */}
            <div className="flex flex-col items-center justify-center space-y-2 border-muted @2xl:border-r p-6">
              <div className="font-bold text-5xl">{rating.toFixed(1)}</div>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`size-5 ${
                      i < Math.floor(rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted-foreground"
                    }`}
                  />
                ))}
              </div>
              <p className="text-muted-foreground text-sm">
                Based on {totalReviews} reviews
              </p>
            </div>

            {/* Rating Distribution */}
            <div className="space-y-3">
              {ratingDistribution.map(({ star, count, percentage }) => (
                <div key={star} className="flex items-center gap-3">
                  <div className="flex w-12 items-center gap-1">
                    <span className="text-sm">{star}</span>
                    <Star className="size-3 fill-yellow-400 text-yellow-400" />
                  </div>
                  <Progress value={percentage} className="h-2 flex-1" />
                  <span className="w-12 text-muted-foreground text-sm">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reviews List */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Customer Reviews</h3>

        {reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map((review: StoreReviewResponse) => (
              <Card key={review.id}>
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    {/* Avatar */}
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={review.userAvatar ?? ""}
                        alt={review.userName}
                      />
                      <AvatarFallback>
                        {review.userName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>

                    {/* Review Content */}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold">{review.userName}</p>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-0.5">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`size-3.5 ${
                                    i < review.rating
                                      ? "fill-yellow-400 text-yellow-400"
                                      : "text-muted-foreground"
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-muted-foreground text-xs">
                              {new Date(review.createdAt).toLocaleDateString(
                                "en-US",
                                {
                                  month: "long",
                                  day: "numeric",
                                  year: "numeric",
                                },
                              )}
                            </span>
                          </div>
                        </div>
                      </div>

                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {review.comment}
                      </p>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 gap-1"
                          onClick={() => handleVoteHelpful(review.id)}
                          disabled={
                            voteHelpful.isPending || review.hasVotedHelpful
                          }
                        >
                          <ThumbsUp className="size-3.5" />
                          <span className="text-xs">
                            Helpful ({review.helpfulCount})
                          </span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Star className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 font-semibold text-lg">No reviews yet</h3>
            <p className="text-muted-foreground text-sm">
              This store hasn't received any reviews yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
