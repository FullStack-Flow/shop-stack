import { Link } from "@tanstack/react-router";
import { ShoppingBag } from "lucide-react";
import NotFound from "@/components/base/empty/notfound";
import WishlistItemCard from "@/components/base/store/accounts/wishlist-item-card";
import { Button } from "@/components/ui/button";
import { mockWishlists } from "@/data/wishlist";

export default function WishlistList() {
  if (!mockWishlists) {
    <div className="@container container mx-auto px-4 py-8">
      <NotFound
        title="Category not found"
        description="The category you're looking for doesn't exist or has been removed."
        icon={<ShoppingBag className="h-10 w-10 text-muted-foreground" />}
      >
        <Link to="/product">
          <Button variant="outline">Start Shopping</Button>
        </Link>
      </NotFound>
    </div>;
  }

  return (
    <div className="flex flex-col">
      {mockWishlists.map((item) => (
        <WishlistItemCard key={item.id} item={item} />
      ))}
    </div>
  );
}
