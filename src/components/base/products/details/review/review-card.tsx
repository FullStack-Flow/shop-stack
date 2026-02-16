import { Check, Star, ThumbsUp } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ReviewCardProps {
  userName: string;
  userAvatar: string;
  date: string;
  rating: number;
  reviewText: string;
  className?: string;
  isVerifiedPurchase?: boolean;
  helpfulCount?: number;
  hasVotedHelpful?: boolean;
  onVoteHelpful?: () => void;
  isVoting?: boolean;
}

export default function ReviewCard({
  userName,
  userAvatar,
  date,
  rating,
  reviewText,
  className,
  isVerifiedPurchase = false,
  helpfulCount = 0,
  hasVotedHelpful = false,
  onVoteHelpful,
  isVoting = false,
}: ReviewCardProps) {
  return (
    <div className={cn("flex gap-4 border-b py-6 last:border-0", className)}>
      <Avatar className="h-10 w-10">
        <AvatarImage src={userAvatar} alt={userName} />
        <AvatarFallback>{userName[0]}</AvatarFallback>
      </Avatar>

      <div className="flex-1 space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-foreground">{userName}</h4>
              {isVerifiedPurchase && (
                <span className="flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                  <Check className="h-3 w-3" />
                  Verified Purchase
                </span>
              )}
            </div>
            <p className="text-muted-foreground text-xs">{date}</p>
          </div>
          <div className="flex text-yellow-400">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={cn(
                  "h-3.5 w-3.5",
                  i < rating ? "fill-current" : "text-muted",
                )}
              />
            ))}
          </div>
        </div>

        <p className="text-muted-foreground text-sm leading-relaxed">
          {reviewText}
        </p>

        {onVoteHelpful && (
          <div className="flex items-center gap-2 pt-1">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-8 gap-1.5 text-xs",
                hasVotedHelpful && "bg-primary/10 text-primary",
              )}
              onClick={onVoteHelpful}
              disabled={isVoting}
            >
              <ThumbsUp
                className={cn("h-3.5 w-3.5", hasVotedHelpful && "fill-current")}
              />
              <span>
                {hasVotedHelpful ? "Voted" : "Helpful"} ({helpfulCount})
              </span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
