import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import ProductActions from "@/components/base/products/details/product-actions";
import ProductHeader from "@/components/base/products/details/product-header";
import ProductImageGallery from "@/components/base/products/details/product-image-gallery";
import ProductPrice from "@/components/base/products/details/product-price";
import { QuantitySelector } from "@/components/base/products/details/quantity-selector";
import ShippingInfoSection from "@/components/base/products/details/shipping-info-section";
import StoreInfoCard from "@/components/base/products/details/store-info-card";
import { useCart } from "@/hooks/store/use-cart";
import {
  useWishlistMutations,
  wishlistStatusQueryOptions,
} from "@/hooks/store/use-wishlist";
import { useCartStore } from "@/lib/store/cart-store";
import type { StoreProduct } from "@/types/store-types";

interface ProductMainSectionProps {
  product: StoreProduct;
}
export default function ProductMainSection({
  product,
}: ProductMainSectionProps) {
  const [quantity, setQuantity] = useState(1);
  const [isCompareListed, setIsCompareListed] = useState(false);

  const { addItem } = useCart();
  const { setIsOpen } = useCartStore();
  const { toggleWishlist, isToggling } = useWishlistMutations();
  const { data: wishlistStatus } = useQuery(
    wishlistStatusQueryOptions(product.id),
  );
  const isWishlisted = wishlistStatus?.isInWishlist ?? false;

  const handleAddToCart = async () => {
    try {
      await addItem({
        productId: product.id,
        quantity,
      });
      setIsOpen(true); // Open cart sheet after successful addition
      toast.success("Added to cart");
    } catch (error) {
      console.error("Failed to add to cart:", error);
      toast.error("Failed to add to cart");
    }
  };

  const handleBuyNow = () => {
    console.log("Buy now:", product.id, quantity);
  };

  const handleToggleWishlist = async () => {
    await toggleWishlist({ productId: product.id });
  };

  const regularPrice = parseFloat(product.regularPrice || "0");
  const sellingPrice = parseFloat(product.sellingPrice);
  const discountPercentage =
    regularPrice > sellingPrice
      ? Math.round(((regularPrice - sellingPrice) / regularPrice) * 100)
      : 0;

  // Prepare derived data
  const category = {
    name: product.categoryName || "Unknown",
    slug: product.categoryId || "", // Fallback to ID if slug unavailable
  };

  const store = {
    id: product.shopId,
    name: product.shopName || "Unknown Store",
    slug: product.shopSlug || "",
    logo: "", // Placeholder
    rating: 0, // Placeholder
    reviewCount: 0, // Placeholder
    isVerified: false,
    memberSince: "",
  };

  const shipping = {
    freeShipping: false,
    deliveryTime: "3-5 business days",
    policy: "Standard return policy applies.",
  };

  const images = product.images.map((img) => ({
    id: img.id,
    url: img.url,
    alt: img.alt || product.name,
  }));

  return (
    <div className="grid @5xl:grid-cols-12 grid-cols-1 @5xl:gap-12 gap-8">
      {/* Left Column - Image Gallery */}
      <div className="@5xl:col-span-7">
        <ProductImageGallery images={images} />
      </div>

      {/* Right Column - Product Details */}
      <div className="@5xl:col-span-5 flex flex-col gap-8">
        <div className="space-y-6">
          <ProductHeader
            title={product.name}
            category={category}
            rating={parseFloat(product.averageRating) || 0}
            reviewCount={product.reviewCount || 0}
            isOnSale={regularPrice > sellingPrice}
          />

          <ProductPrice
            currentPrice={sellingPrice}
            originalPrice={regularPrice}
            currency={"$"}
            discountPercentage={discountPercentage}
            inStock={product.stock > 0}
          />

          <div className="space-y-4 border-t pt-6">
            <div className="flex items-center gap-4">
              <QuantitySelector
                value={quantity}
                onChange={setQuantity}
                max={product.stock}
                disabled={product.stock <= 0}
              />
            </div>

            <ProductActions
              onAddToCart={handleAddToCart}
              onBuyNow={handleBuyNow}
              onToggleWishlist={handleToggleWishlist}
              onToggleCompare={() => setIsCompareListed(!isCompareListed)}
              isWishlisted={isWishlisted}
              isCompareListed={isCompareListed}
              isLoading={isToggling}
              disabled={product.stock <= 0}
            />
          </div>
        </div>

        <StoreInfoCard store={store} />

        <ShippingInfoSection shipping={shipping} />
      </div>
    </div>
  );
}
