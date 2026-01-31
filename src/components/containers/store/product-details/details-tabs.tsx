import ProductAdditionalInfoTab from "@/components/base/products/details/product-additional-info-tab";
import ProductDescriptionTab from "@/components/base/products/details/product-description-tab";
import ProductShippingTab from "@/components/base/products/details/product-shipping-tab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Product } from "@/data/products";
import ProductReviewsTab from "./product-reviews-tab";

interface ProductDetailsTabsProps {
  product: Product;
}

export default function ProductDetailsTabs({
  product,
}: ProductDetailsTabsProps) {
  return (
    <Tabs defaultValue="description" className="w-full">
      <div className="overflow-x-auto border-b">
        <TabsList className="h-auto w-full justify-start gap-2 rounded-none bg-transparent p-0 sm:gap-6">
          <TabsTrigger
            value="description"
            className="relative whitespace-nowrap rounded-none border-transparent border-b-2 bg-transparent px-2 pt-2 pb-3 font-semibold text-muted-foreground shadow-none transition-none data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none sm:px-0"
          >
            Description
          </TabsTrigger>
          <TabsTrigger
            value="additional-info"
            className="relative whitespace-nowrap rounded-none border-transparent border-b-2 bg-transparent px-2 pt-2 pb-3 font-semibold text-muted-foreground shadow-none transition-none data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none sm:px-0"
          >
            Additional Information
          </TabsTrigger>
          <TabsTrigger
            value="reviews"
            className="relative whitespace-nowrap rounded-none border-transparent border-b-2 bg-transparent px-2 pt-2 pb-3 font-semibold text-muted-foreground shadow-none transition-none data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none sm:px-0"
          >
            Reviews ({product.rating.count})
          </TabsTrigger>
          <TabsTrigger
            value="shipping"
            className="relative whitespace-nowrap rounded-none border-transparent border-b-2 bg-transparent px-2 pt-2 pb-3 font-semibold text-muted-foreground shadow-none transition-none data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none sm:px-0"
          >
            Shipping & Returns
          </TabsTrigger>
        </TabsList>
      </div>

      <div className="mt-8">
        <TabsContent value="description">
          <ProductDescriptionTab description={product.description} />
        </TabsContent>
        <TabsContent value="additional-info">
          <ProductAdditionalInfoTab specifications={product.specifications} />
        </TabsContent>
        <TabsContent value="reviews">
          <ProductReviewsTab
            reviews={product.reviews}
            averageRating={product.rating.average}
            ratingBreakdown={product.rating.breakdown}
            totalRatings={product.rating.count}
            productId={product.id}
          />
        </TabsContent>
        <TabsContent value="shipping">
          <ProductShippingTab shipping={product.shipping} />
        </TabsContent>
      </div>
    </Tabs>
  );
}
