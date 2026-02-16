import { Info, PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface ReviewFormCtaProps {
  onReviewClick: () => void;
  canReview?: boolean;
  className?: string;
}

export default function ReviewFormCta({
  onReviewClick,
  canReview = false,
  className,
}: ReviewFormCtaProps) {
  return (
    <div className={cn("rounded-lg border bg-muted/30 p-6", className)}>
      <h3 className="font-semibold text-foreground text-lg">
        Review this product
      </h3>
      <p className="mt-2 text-muted-foreground text-sm">
        Share your thoughts with other customers
      </p>

      {canReview ? (
        <Button className="mt-4 w-full" onClick={onReviewClick}>
          <PenLine className="mr-2 h-4 w-4" />
          Write a review
        </Button>
      ) : (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button className="mt-4 w-full" disabled>
                <PenLine className="mr-2 h-4 w-4" />
                Write a review
              </Button>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p className="flex items-center gap-2 text-xs">
                <Info className="h-3 w-3 shrink-0" />
                You can only review products you have purchased and paid for.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
}
