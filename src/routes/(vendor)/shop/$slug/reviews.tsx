import { AddReviewDialog } from "@/components/containers/vendors/reviews/add-review-dialog";
import ShopReviewsTemplate from "@/components/templates/vendor/shop-reviews-template";
import { mockReviews } from "@/data/review";
import { Review } from "@/types/review";
import { ReviewFormValues } from "@/types/review-form";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/(vendor)/shop/$slug/reviews")({
  component: ReviewsPage,
});

function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>(mockReviews);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleAddReview = () => {
    setIsDialogOpen(true);
  };

  const handleReviewSubmit = (data: ReviewFormValues) => {
    const newReview: Review = {
      id: String(reviews.length + 1),
      productName: data.productName,
      productImage: "https://placehold.co/100?text=PR",
      customerName: data.customerName,
      customerAvatar: data.customerAvatar
        ? URL.createObjectURL(data.customerAvatar[0])
        : undefined,
      rating: data.rating,
      comment: data.comment,
      date: new Date().toISOString().split("T")[0],
      status: data.status,
    };

    setReviews([...reviews, newReview]);
    console.log("Created review:", newReview);
  };

  return (
    <>
      <ShopReviewsTemplate reviews={reviews} onAddReview={handleAddReview} />

      <AddReviewDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={handleReviewSubmit}
      />
    </>
  );
}
