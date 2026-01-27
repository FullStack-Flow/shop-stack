import { CheckCircle2, Heart, Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useStoreFront } from "@/lib/store/store";
import { cn } from "@/lib/utils";
import type { Store } from "@/types/store-types";

interface StoreBannerProps {
  store: Store;
  className?: string;
}

export default function StoreBanner({ store, className }: StoreBannerProps) {
  const { isFollowing, toggleFollow } = useStoreFront();
  const following = isFollowing(store.id);
  return (
    <div className={cn("relative overflow-hidden rounded-xl", className)}>
      {/* Banner Image */}
      <div className="relative @2xl:h-64 h-48 overflow-hidden bg-muted">
        <img
          src={store.banner}
          alt={`${store.name} banner`}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent" />
      </div>

      {/* Store Info Overlay */}
      <div className="absolute right-0 bottom-0 left-0 p-6">
        <div className="flex @2xl:flex-row flex-col items-start @2xl:items-end gap-4">
          {/* Logo */}
          <Avatar className="-mb-8 @2xl:h-32 h-24 @2xl:w-32 w-24 border-4 border-background shadow-xl">
            <AvatarImage src={store.logo} alt={store.name} />
            <AvatarFallback className="bg-primary/10 font-bold text-2xl text-primary">
              {store.name[0]}
            </AvatarFallback>
          </Avatar>

          {/* Store Name and Info */}
          <div className="flex-1 text-white">
            <div className="mb-1 flex items-center gap-2">
              <h1 className="font-bold @2xl:text-3xl text-2xl">{store.name}</h1>
              {store.isVerified && (
                <CheckCircle2
                  className="h-6 w-6 text-blue-400"
                  aria-label="Verified Store"
                />
              )}
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{store.rating.toFixed(1)}</span>
                <span className="text-white/80">
                  ({store.reviewCount} reviews)
                </span>
              </div>
              <span className="text-white/60">•</span>
              <span className="text-white/80">{store.category}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              variant={following ? "secondary" : "default"}
              size="lg"
              onClick={() => toggleFollow(store.id)}
              className="gap-2"
            >
              <Heart className={cn("size-4", following && "fill-current")} />
              {following ? "Following" : "Follow"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
