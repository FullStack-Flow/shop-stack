import ProductAdditionalInfoTab from "@/components/base/products/details/product-additional-info-tab";
import ProductDescriptionTab from "@/components/base/products/details/product-description-tab";
import ProductShippingTab from "@/components/base/products/details/product-shipping-tab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { StoreProduct } from "@/types/store-types";
import ProductReviewsTab from "./product-reviews-tab";

interface ProductDetailsTabsProps {
  product: StoreProduct;
}

export default function ProductDetailsTabs({
  product,
}: ProductDetailsTabsProps) {
  // Map attributes to specifications
  const specifications: Record<string, string> = {};
  if (product.attributeIds && product.attributeNames) {
    product.attributeIds.forEach((attrId, index) => {
      const attrName = product.attributeNames[index];
      const valueIds = product.attributeValues[attrId] || [];
      const valueNames = valueIds
        .map((vid) => product.attributeValueNames[vid])
        .filter(Boolean)
        .join(", ");
      if (attrName && valueNames) {
        specifications[attrName] = valueNames;
      }
    });
  }

  // Default shipping info since API doesn't provide it
  const shipping = {
    freeShipping: false,
    deliveryTime: "3-5 business days",
    policy: "Standard return policy applies.",
  };

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
            Reviews ({product.reviewCount})
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
          <ProductDescriptionTab description={product.description || ""} />
        </TabsContent>
        <TabsContent value="additional-info">
          <ProductAdditionalInfoTab specifications={specifications} />
        </TabsContent>
        <TabsContent value="reviews">
          <ProductReviewsTab productId={product.id} />
        </TabsContent>
        <TabsContent value="shipping">
          <ProductShippingTab shipping={shipping} />
        </TabsContent>
      </div>
    </Tabs>
  );
}
