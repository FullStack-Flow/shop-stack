import ProductBreadcrumb from "@/components/base/products/details/product-breadcrum";
import ProductDetailsTabs from "@/components/containers/store/product-details/details-tabs";
import ProductMainSection from "@/components/containers/store/product-details/main-section";
import SimilarProductsSection from "@/components/containers/store/product-details/similar-products-section";
import { Product } from "@/data/products";

interface ProductDetailsTemplateProps {
  product: Product;
}
export default function ProductDetailsTemplate({
  product,
}: ProductDetailsTemplateProps) {
  return (
    <div className="@container container mx-auto @4xl:px-6 px-4 @5xl:py-12 py-8">
      <ProductBreadcrumb items={product.breadcrumbs} />

      <div className="space-y-16">
        <ProductMainSection product={product} />

        <ProductDetailsTabs product={product} />

        <SimilarProductsSection products={product.similarProducts} />
      </div>
    </div>
  );
}
