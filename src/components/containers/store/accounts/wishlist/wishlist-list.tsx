import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Loader2, ShoppingBag } from "lucide-react";
import NotFound from "@/components/base/empty/notfound";
import WishlistItemCard from "@/components/base/store/accounts/wishlist-item-card";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/store/use-cart";
import {
  useWishlistMutations,
  wishlistQueryOptions,
} from "@/hooks/store/use-wishlist";

export default function WishlistList() {
  const { data, isPending } = useQuery(wishlistQueryOptions());
  const { addItem, isAdding } = useCart();
  const { toggleWishlist, isToggling } = useWishlistMutations();
  const items = data?.items ?? [];

  const handleAddToCart = async (productId: string) => {
    await addItem({ productId, quantity: 1 });
  };

  const handleRemove = async (productId: string) => {
    await toggleWishlist({ productId });
  };

  if (isPending) {
    return (
      <div className="flex min-h-48 items-center justify-center">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading wishlist...</span>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="@container container mx-auto px-4 py-8">
        <NotFound
          title="Your wishlist is empty"
          description="Looks like you haven't saved anything yet."
          icon={<ShoppingBag className="h-10 w-10 text-muted-foreground" />}
        >
          <Link to="/product">
            <Button variant="outline">Start Shopping</Button>
          </Link>
        </NotFound>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {items.map((item) => {
        const primaryImage =
          item.product.images.find((image) => image.isPrimary)?.url ||
          item.product.images[0]?.url ||
          "";
        const sellingPrice = Number(item.product.sellingPrice || 0);
        const regularPrice = item.product.regularPrice
          ? Number(item.product.regularPrice)
          : undefined;

        return (
          <WishlistItemCard
            key={item.id}
            item={{
              id: item.product.id,
              name: item.product.name,
              price: sellingPrice,
              originalPrice: regularPrice,
              image: primaryImage,
              shopName: item.product.shop?.name ?? "Unknown Store",
              rating: Number(item.product.averageRating || 0),
              inStock: (item.product.stock ?? 0) > 0,
            }}
            onAddToCart={handleAddToCart}
            onRemove={handleRemove}
            isAdding={isAdding}
            isRemoving={isToggling}
          />
        );
      })}
    </div>
  );
}
