import { format } from "date-fns";
import { Pencil, Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MyReviewCardProps {
  id: string;
  productId: string;
  productName: string;
  productImage: string | null;
  rating: number;
  title: string;
  comment: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  vendorResponse?: string | null;
  vendorRespondedAt?: string | null;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  isDeleting?: boolean;
}

export function MyReviewCard({
  id,
  productName,
  productImage,
  rating,
  title,
  comment,
  status,
  createdAt,
  vendorResponse,
  onEdit,
  onDelete,
  isDeleting = false,
}: MyReviewCardProps) {
  return (
    <Card className="@container/card overflow-hidden p-0 border-transparent">
      <div className="flex flex-col @sm:flex-row">
        {/* Product Image */}
        <div className="relative h-48 w-full shrink-0 @sm:size-40 @xl:size-46 bg-muted">
          {productImage ? (
            <img
              src={productImage}
              alt={productName}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
              No Image
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col">
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-semibold leading-none tracking-tight">
                  {productName}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Reviewed on {format(new Date(createdAt), "MMMM d, yyyy")}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                    status === "approved" &&
                      "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
                    status === "pending" &&
                      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
                    status === "rejected" &&
                      "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
                  )}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </span>
              </div>
            </div>
          </CardHeader>

          <CardContent className="flex-1 pb-2">
            <div className="flex items-center gap-1 text-yellow-400 mb-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "h-4 w-4",
                    i < rating ? "fill-current" : "text-muted/30",
                  )}
                />
              ))}
            </div>
            <h4 className="font-medium mb-1">{title}</h4>
            <p className="text-sm text-muted-foreground line-clamp-3">
              {comment}
            </p>

            {vendorResponse && (
              <div className="mt-4 rounded-md bg-muted p-3 text-sm">
                <p className="font-medium text-xs text-muted-foreground mb-1">
                  Response from Seller:
                </p>
                <p>{vendorResponse}</p>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit?.(id)}
              className="h-8"
            >
              <Pencil className="mr-2 h-3.5 w-3.5" />
              Edit
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDelete?.(id)}
              disabled={isDeleting}
              className="h-8"
            >
              <Trash2 className="mr-2 h-3.5 w-3.5" />
              Delete
            </Button>
          </CardFooter>
        </div>
      </div>
    </Card>
  );
}
