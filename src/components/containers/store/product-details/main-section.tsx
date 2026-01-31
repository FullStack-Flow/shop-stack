import { useState } from "react";
import { toast } from "sonner";
import ProductActions from "@/components/base/products/details/product-actions";
import ProductHeader from "@/components/base/products/details/product-header";
import ProductImageGallery from "@/components/base/products/details/product-image-gallery";
import ProductPrice from "@/components/base/products/details/product-price";
import { QuantitySelector } from "@/components/base/products/details/quantity-selector";
import ShippingInfoSection from "@/components/base/products/details/shipping-info-section";
import StoreInfoCard from "@/components/base/products/details/store-info-card";
import type { Product } from "@/data/products";
import { useCartStore } from "@/lib/store/cart-store";

interface ProductMainSectionProps {
  product: Product;
}
export default function ProductMainSection({
  product,
}: ProductMainSectionProps) {
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isCompareListed, setIsCompareListed] = useState(false);

  const { addItem } = useCartStore();

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price.current,
      image: product.images[0].url,
      quantity,
      maxQuantity: product.stock.quantity,
    });
    toast.success("Added to cart");
  };

  const handleBuyNow = () => {
    console.log("Buy now:", product.id, quantity);
  };

  return (
    <div className="grid @5xl:grid-cols-12 grid-cols-1 @5xl:gap-12 gap-8">
      {/* Left Column - Image Gallery */}
      <div className="@5xl:col-span-7">
        <ProductImageGallery images={product.images} />
      </div>

      {/* Right Column - Product Details */}
      <div className="@5xl:col-span-5 flex flex-col gap-8">
        <div className="space-y-6">
          <ProductHeader
            title={product.name}
            category={product.category}
            rating={product.rating.average}
            reviewCount={product.rating.count}
            isOnSale={product.isOnSale}
          />

          <ProductPrice
            currentPrice={product.price.current}
            originalPrice={product.price.original}
            currency={product.price.currency}
            discountPercentage={product.price.discountPercentage}
            inStock={product.stock.inStock}
          />

          <div className="space-y-4 border-t pt-6">
            <div className="flex items-center gap-4">
              <QuantitySelector
                value={quantity}
                onChange={setQuantity}
                max={product.stock.quantity}
                disabled={!product.stock.inStock}
              />
            </div>

            <ProductActions
              onAddToCart={handleAddToCart}
              onBuyNow={handleBuyNow}
              onToggleWishlist={() => setIsWishlisted(!isWishlisted)}
              onToggleCompare={() => setIsCompareListed(!isCompareListed)}
              isWishlisted={isWishlisted}
              isCompareListed={isCompareListed}
              disabled={!product.stock.inStock}
            />
          </div>
        </div>

        <StoreInfoCard store={product.store} />

        <ShippingInfoSection shipping={product.shipping} />
      </div>
    </div>
  );
}
