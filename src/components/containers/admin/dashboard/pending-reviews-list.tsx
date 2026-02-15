import { Link } from "@tanstack/react-router";
import { ExternalLink, MessageSquare, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { PendingReview } from "@/types/admin-dashboard";

interface PendingReviewsListProps {
  reviews: PendingReview[];
  isLoading?: boolean;
}

export function PendingReviewsList({
  reviews,
  isLoading = false,
}: PendingReviewsListProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="size-5 text-blue-500" />
            Pending Reviews
          </CardTitle>
          <CardDescription>Reviews awaiting moderation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="size-5 text-blue-500" />
            Pending Reviews
            {reviews.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {reviews.length}
              </Badge>
            )}
          </CardTitle>
          <CardDescription>Reviews awaiting moderation</CardDescription>
        </div>
        <Link
          to="/admin/reviews"
          className="flex items-center gap-1 text-muted-foreground text-sm hover:text-foreground"
        >
          View all <ExternalLink className="size-3" />
        </Link>
      </CardHeader>
      <CardContent>
        {reviews.length === 0 ? (
          <div className="py-4 text-center text-muted-foreground">
            <p>No pending reviews! 🎉</p>
          </div>
        ) : (
          <div className="space-y-3">
            {reviews.slice(0, 5).map((review) => (
              <div key={review.id} className="rounded-lg border p-3">
                <div className="mb-1 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`size-3 ${
                          i < review.rating
                            ? "fill-amber-400 text-amber-400"
                            : "text-muted-foreground"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-muted-foreground text-xs">
                    {formatDate(review.createdAt)}
                  </span>
                </div>
                <p className="font-medium">{review.title}</p>
                <p className="text-muted-foreground text-sm">
                  {review.productName} • by {review.customerName}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
