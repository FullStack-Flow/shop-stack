import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ReviewFormCtaProps {
  onReviewClick: () => void;
  className?: string;
}

export default function ReviewFormCta({
  onReviewClick,
  className,
}: ReviewFormCtaProps) {
  return (
    <div className={cn('rounded-lg border bg-muted/30 p-6', className)}>
      <h3 className="font-semibold text-foreground text-lg">
        Review this product
      </h3>
      <p className="mt-2 text-muted-foreground text-sm">
        Share your thoughts with other customers
      </p>
      <Button className="mt-4 w-full" onClick={onReviewClick}>
        Write a review
      </Button>
    </div>
  );
}
