import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ConfirmDeleteDialog } from "@/components/base/common/confirm-delete-dialog";
import { PageSkeleton } from "@/components/base/common/page-skeleton";
import AdminReviewsTemplate from "@/components/templates/admin/admin-reviews-template";
import {
  useAdminReviewMutations,
  useAdminReviews,
} from "@/hooks/admin/use-admin-reviews";
import type { AdminReviewResponse, Review } from "@/types/review";

export const Route = createFileRoute("/(admin)/admin/reviews/")({
  component: AdminReviewsPage,
  pendingComponent: PageSkeleton,
});

function AdminReviewsPage() {
  const { data, isLoading, isError } = useAdminReviews();
  const { updateStatus, deleteReview } = useAdminReviewMutations();
  const [deletingReview, setDeletingReview] = useState<Review | null>(null);

  const reviews = useMemo<Review[]>(() => {
    const items = data?.data ?? [];
    return items.map((review: AdminReviewResponse) => ({
      id: review.id,
      productName: review.productName,
      productImage: review.productImage ?? "",
      customerName: review.userName || "Anonymous",
      customerAvatar: review.userAvatar ?? undefined,
      rating: review.rating,
      comment: review.comment,
      date: review.createdAt,
      status: review.status as "approved" | "pending" | "rejected",
    }));
  }, [data?.data]);

  const handleReviewStatusChange = async (
    reviewId: string,
    newStatus: "approved" | "pending" | "rejected",
  ) => {
    updateStatus.mutate({ reviewId, status: newStatus });
  };

  const handleDeleteReview = (reviewId: string) => {
    const target = reviews.find((review) => review.id === reviewId) ?? null;
    setDeletingReview(target);
  };

  const handleConfirmDelete = () => {
    if (!deletingReview) return;
    const reason = window.prompt(
      "Provide a reason for deletion (min 5 characters).",
    );
    if (!reason || reason.trim().length < 5) {
      toast.error("Deletion reason must be at least 5 characters.");
      return;
    }
    deleteReview.mutate({ reviewId: deletingReview.id, reason: reason.trim() });
    setDeletingReview(null);
  };

  if (isLoading) {
    return <PageSkeleton />;
  }

  if (isError) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-destructive">
        Failed to load reviews.
      </div>
    );
  }

  return (
    <>
      <AdminReviewsTemplate
        reviews={reviews}
        onReviewStatusChange={handleReviewStatusChange}
        onDeleteReview={handleDeleteReview}
      />
      <ConfirmDeleteDialog
        open={!!deletingReview}
        onOpenChange={(open) => !open && setDeletingReview(null)}
        onConfirm={handleConfirmDelete}
        isDeleting={deleteReview.isPending}
        itemName={deletingReview?.productName}
        entityType="review"
      />
    </>
  );
}
