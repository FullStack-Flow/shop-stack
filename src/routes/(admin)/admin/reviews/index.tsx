import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import AdminReviewsTemplate from "@/components/templates/admin/admin-reviews-template";
import { mockReviews } from "@/data/review";
import type { Review } from "@/types/review";

export const Route = createFileRoute("/(admin)/admin/reviews/")({
  component: AdminReviewsPage,
});

function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>(mockReviews);

  const handleReviewStatusChange = (
    reviewId: string,
    newStatus: "published" | "pending" | "rejected"
  ) => {
    setReviews(
      reviews.map((review) =>
        review.id === reviewId ? { ...review, status: newStatus } : review
      )
    );
  };

  return (
    <AdminReviewsTemplate
      reviews={reviews}
      onReviewStatusChange={handleReviewStatusChange}
    />
  );
}
