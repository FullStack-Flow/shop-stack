import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useReviewMutations } from "@/hooks/store/use-reviews";
import { cn } from "@/lib/utils";
import { Star } from "lucide-react";

interface EditReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  review: {
    id: string;
    productId: string;
    rating: number;
    title: string;
    comment: string;
  };
}

export function EditReviewDialog({
  open,
  onOpenChange,
  review,
}: EditReviewDialogProps) {
  const [rating, setRating] = useState<number>(review.rating);
  const [title, setTitle] = useState(review.title);
  const [comment, setComment] = useState(review.comment);
  const [hoveredRating, setHoveredRating] = useState<number>(0);

  const { updateReview } = useReviewMutations();

  // Reset form when review changes
  useEffect(() => {
    if (open) {
      setRating(review.rating);
      setTitle(review.title);
      setComment(review.comment);
    }
  }, [open, review]);

  const handleSubmit = () => {
    if (rating === 0 || !title.trim() || !comment.trim()) {
      return;
    }

    updateReview.mutate(
      {
        reviewId: review.id,
        productId: review.productId,
        rating,
        title: title.trim(),
        comment: comment.trim(),
      },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Review</DialogTitle>
          <DialogDescription>
            Update your review for this product.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="space-y-2">
            <Label>Rating</Label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  className="focus:outline-none"
                  onMouseEnter={() => setHoveredRating(value)}
                  onMouseLeave={() => setHoveredRating(0)}
                  onClick={() => setRating(value)}
                >
                  <Star
                    className={cn(
                      "h-6 w-6 transition-colors",
                      value <= (hoveredRating || rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted-foreground/30",
                    )}
                  />
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              {rating === 0 ? "Select a rating" : `${rating} out of 5 stars`}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <input
              id="title"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Summarize your experience"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="comment">Review</Label>
            <Textarea
              id="comment"
              placeholder="What did you like or dislike? What did you use this product for?"
              className="min-h-[100px]"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              updateReview.isPending ||
              rating === 0 ||
              !title.trim() ||
              !comment.trim()
            }
          >
            {updateReview.isPending ? "Updating..." : "Update Review"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
