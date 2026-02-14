import { Link } from "@tanstack/react-router";
import { AlertCircle, Loader2, MessageSquare } from "lucide-react";
import { useState } from "react";
import NotFound from "@/components/base/empty/notfound";
import { EditReviewDialog } from "@/components/base/products/details/review/edit-review-dialog";
import { MyReviewCard } from "@/components/base/products/details/review/my-review-card";
import { Button } from "@/components/ui/button";
import { useReviewMutations, useUserReviews } from "@/hooks/store/use-reviews";
export default function MyReviewsList() {
  const { data: reviews, isLoading, error } = useUserReviews();
  const { deleteReview } = useReviewMutations();

  const [editingReview, setEditingReview] = useState<{
    id: string;
    productId: string;
    rating: number;
    title: string;
    comment: string;
  } | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleEdit = (id: string) => {
    const review = reviews?.find((r) => r.id === id);
    if (review) {
      setEditingReview({
        id: review.id,
        productId: review.productId,
        rating: review.rating,
        title: review.title,
        comment: review.comment,
      });
      setIsEditDialogOpen(true);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this review?")) {
      const review = reviews?.find((r) => r.id === id);
      if (review) {
        deleteReview.mutate({ reviewId: id, productId: review.productId });
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md bg-destructive/15 p-4 text-destructive">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          <p>Failed to load reviews. Please try again later.</p>
        </div>
      </div>
    );
  }

  if (reviews?.length === 0) {
    return (
      <div className="@container container mx-auto px-4 py-8">
        <NotFound
          title="You haven't written any reviews yet"
          description="Purchase products to share your experience!"
          icon={<MessageSquare className="h-10 w-10 text-muted-foreground" />}
        >
          <Link to="/product">
            <Button variant="outline">Start Shopping</Button>
          </Link>
        </NotFound>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-4">
        {reviews?.map((review) => (
          <MyReviewCard
            key={review.id}
            {...review}
            onEdit={handleEdit}
            onDelete={handleDelete}
            isDeleting={deleteReview.isPending}
          />
        ))}
      </div>

      {editingReview && (
        <EditReviewDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          review={editingReview}
        />
      )}
    </>
  );
}
