import { Link } from "@tanstack/react-router";
import { CheckCircle2, Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StoreInfoCardProps {
  store: {
    id: string;
    name: string;
    slug: string;
    logo: string;
    rating: number;
    reviewCount: number;
    isVerified: boolean;
    memberSince: string;
  };
  className?: string;
}

export default function StoreInfoCard({
  store,
  className,
}: StoreInfoCardProps) {
  return (
    <Card className={cn("overflow-hidden bg-muted/30", className)}>
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12 border-2 border-background">
            <AvatarImage src={store.logo} alt={store.name} />
            <AvatarFallback className="bg-primary/10 text-primary">
              {store.name[0]}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <Link
                to="/store/$slug"
                params={{ slug: store.slug }}
                className="font-semibold hover:underline"
              >
                {store.name}
              </Link>
              {store.isVerified && (
                <CheckCircle2
                  className="h-4 w-4 text-blue-500"
                  aria-label="Verified Store"
                />
              )}
            </div>

            <div className="flex items-center gap-3 text-muted-foreground text-sm">
              <div className="flex items-center gap-1">
                <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                <span>{store.rating}</span>
                <span>({store.reviewCount})</span>
              </div>
            </div>
          </div>

          <Button variant="ghost" size="default" asChild>
            <Link to="/store/$slug" params={{ slug: store.slug }}>
              Visit Store
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
