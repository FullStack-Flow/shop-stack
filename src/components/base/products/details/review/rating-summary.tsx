import { Star } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface RatingSummaryProps {
  averageRating: number;
  totalRatings: number;
  ratingBreakdown: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  className?: string;
}

export default function RatingSummary({
  averageRating,
  totalRatings,
  ratingBreakdown,
  className,
}: RatingSummaryProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-6 sm:flex-row sm:items-start',
        className
      )}
    >
      <div className="flex flex-col items-center justify-center gap-2 text-center sm:w-1/3 sm:items-start sm:text-left lg:w-full lg:items-center lg:text-center">
        <div className="font-bold text-5xl text-foreground">
          {averageRating.toFixed(1)}
        </div>
        <div className="flex text-yellow-400">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={cn(
                'h-5 w-5',
                i < Math.round(averageRating) ? 'fill-current' : 'text-muted'
              )}
            />
          ))}
        </div>
        <p className="text-muted-foreground text-sm">
          {totalRatings} Product Ratings
        </p>
      </div>

      <div className="w-full flex-1 space-y-2">
        {[5, 4, 3, 2, 1].map((star) => {
          const count =
            ratingBreakdown[star as keyof typeof ratingBreakdown] || 0;
          const percentage =
            totalRatings > 0 ? (count / totalRatings) * 100 : 0;

          return (
            <div key={star} className="flex items-center gap-3 text-sm">
              <div className="flex w-12 shrink-0 items-center gap-1">
                <span className="font-medium">{star}</span>
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              </div>
              <Progress
                value={percentage}
                className="h-2 w-auto min-w-0 flex-1"
              />
              <span className="w-10 shrink-0 text-right text-muted-foreground">
                {count}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
