import { Star } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useReviewMutations } from "@/hooks/store/use-reviews";
import { cn } from "@/lib/utils";

interface EligibleOrderItem {
  orderItemId: string;
  orderId: string;
  orderNumber: string;
  productName: string;
  purchaseDate: string;
  alreadyReviewed: boolean;
}

interface ReviewFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: string;
  eligibleOrderItems: EligibleOrderItem[];
}

export function ReviewFormDialog({
  open,
  onOpenChange,
  productId,
  eligibleOrderItems,
}: ReviewFormDialogProps) {
  const [selectedOrderItemId, setSelectedOrderItemId] = useState<string>("");
  const [rating, setRating] = useState<number>(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [hoveredRating, setHoveredRating] = useState<number>(0);

  const { createReview } = useReviewMutations();

  // Filter to only show unreviewed items
  const unreviewedItems = eligibleOrderItems.filter(
    (item) => !item.alreadyReviewed,
  );

  // Reset form when dialog closes
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setSelectedOrderItemId("");
      setRating(0);
      setTitle("");
      setComment("");
    }
    onOpenChange(newOpen);
  };

  // Handle form submission
  const handleSubmit = () => {
    if (
      !selectedOrderItemId ||
      rating === 0 ||
      !title.trim() ||
      !comment.trim()
    ) {
      return;
    }

    createReview.mutate(
      {
        productId,
        orderItemId: selectedOrderItemId,
        rating,
        title: title.trim(),
        comment: comment.trim(),
      },
      {
        onSuccess: () => {
          handleOpenChange(false);
        },
      },
    );
  };

  // Check if form is valid
  const isFormValid =
    selectedOrderItemId !== "" &&
    rating > 0 &&
    title.trim().length >= 5 &&
    comment.trim().length >= 10;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Write a Review</DialogTitle>
          <DialogDescription>
            Share your honest experience with this product. Only verified
            purchases can leave reviews.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Select Order */}
          {unreviewedItems.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="order">Select Purchase</Label>
              <Select
                value={selectedOrderItemId}
                onValueChange={setSelectedOrderItemId}
              >
                <SelectTrigger id="order">
                  <SelectValue placeholder="Select your purchase" />
                </SelectTrigger>
                <SelectContent>
                  {unreviewedItems.map((item) => (
                    <SelectItem key={item.orderItemId} value={item.orderItemId}>
                      <div className="flex flex-col">
                        <span className="font-medium">{item.productName}</span>
                        <span className="text-muted-foreground text-xs">
                          Order #{item.orderNumber} •{" "}
                          {new Date(item.purchaseDate).toLocaleDateString()}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* No eligible orders message */}
          {unreviewedItems.length === 0 && (
            <div className="rounded-lg border border-dashed p-6 text-center">
              <p className="text-muted-foreground text-sm">
                You don't have any eligible purchases for this product. Only
                verified purchases can be reviewed.
              </p>
            </div>
          )}

          {/* Rating */}
          {selectedOrderItemId && (
            <>
              <div className="space-y-2">
                <Label>Rating</Label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className="p-1 transition-transform hover:scale-110"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                    >
                      <Star
                        className={cn(
                          "h-8 w-8 transition-colors",
                          star <= (hoveredRating || rating)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-muted-foreground",
                        )}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-muted-foreground text-sm">
                    {rating > 0
                      ? ["", "Poor", "Fair", "Good", "Very Good", "Excellent"][
                          rating
                        ]
                      : "Select rating"}
                  </span>
                </div>
              </div>

              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Review Title</Label>
                <Input
                  id="title"
                  placeholder="Summarize your experience"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={100}
                />
                <p className="text-muted-foreground text-xs">
                  {title.length}/100 characters (min 5)
                </p>
              </div>

              {/* Comment */}
              <div className="space-y-2">
                <Label htmlFor="comment">Your Review</Label>
                <Textarea
                  id="comment"
                  placeholder="Tell others about your experience with this product..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={4}
                  maxLength={1000}
                />
                <p className="text-muted-foreground text-xs">
                  {comment.length}/1000 characters (min 10)
                </p>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={createReview.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!isFormValid || createReview.isPending}
          >
            {createReview.isPending ? "Submitting..." : "Submit Review"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
