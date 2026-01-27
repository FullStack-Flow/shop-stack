import { Link } from "@tanstack/react-router";
import { CheckCircle2, MapPin, Package, Star, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Store } from "@/types/store-types";

interface StoreCardProps {
  store: Store;
  className?: string;
}

export default function StoreCard({ store, className }: StoreCardProps) {
  return (
    <Card
      className={cn(
        "group gap-0 overflow-hidden bg-card py-0 transition-all hover:shadow-primary/5 hover:shadow-xl",
        className
      )}
    >
      {/* Banner Image */}
      <div className="relative aspect-video overflow-hidden bg-muted">
        <img
          src={store.banner}
          alt={`${store.name} banner`}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />

        {/* Verification Badge */}
        {store.isVerified && (
          <Badge className="absolute top-4 right-4 gap-1 border-blue-500/20 bg-blue-500/90 text-white backdrop-blur-sm">
            <CheckCircle2 className="size-3" />
            Verified
          </Badge>
        )}
      </div>

      <CardContent className="space-y-5 p-6">
        {/* Store Logo and Name - Side by side */}
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16 shrink-0 border-2 border-border shadow-md ring-2 ring-background">
            <AvatarImage src={store.logo} alt={store.name} />
            <AvatarFallback className="bg-primary/10 font-bold text-lg text-primary">
              {store.name[0]}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1 space-y-2">
            <Link
              to="/store/$slug"
              params={{ slug: store.slug }}
              className="line-clamp-1 block font-bold text-xl leading-tight transition-colors hover:text-primary"
            >
              {store.name}
            </Link>
            <Badge variant="secondary" className="text-xs">
              {store.category}
            </Badge>
          </div>
        </div>

        {/* Description */}
        <p className="line-clamp-2 text-muted-foreground text-sm leading-relaxed">
          {store.description}
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 rounded-lg border bg-muted/30 p-4">
          <div className="flex flex-col items-center gap-1.5 text-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-background">
              <Package className="size-4 text-muted-foreground" />
            </div>
            <span className="font-bold text-base">{store.totalProducts}</span>
            <span className="text-muted-foreground text-xs">Products</span>
          </div>
          <div className="flex flex-col items-center gap-1.5 border-muted border-x text-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-background">
              <Users className="size-4 text-muted-foreground" />
            </div>
            <span className="font-bold text-base">
              {store.followers >= 1000
                ? `${(store.followers / 1000).toFixed(1)}k`
                : store.followers}
            </span>
            <span className="text-muted-foreground text-xs">Followers</span>
          </div>
          <div className="flex flex-col items-center gap-1.5 text-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-background">
              <Star className="size-4 fill-yellow-400 text-yellow-400" />
            </div>
            <span className="font-bold text-base">
              {store.rating.toFixed(1)}
            </span>
            <span className="text-muted-foreground text-xs">Rating</span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 border-muted border-t pt-5">
          {store.address && (
            <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
              <MapPin className="size-3.5 shrink-0" />
              <span className="line-clamp-1">{store.address}</span>
            </div>
          )}
          <Button size="sm" className="shrink-0" asChild>
            <Link to="/store/$slug" params={{ slug: store.slug }}>
              Visit Store
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
