import { createFileRoute, notFound } from "@tanstack/react-router";
import ProductDetailsTemplate from "@/components/templates/store/product-details-template";
import { mockProducts } from "@/data/products";

export const Route = createFileRoute("/(store)/_layout/product/$productId")({
  loader: async ({ params }) => {
    const product = mockProducts.find(
      (product) => product.id === params.productId
    );

    if (!product) {
      throw notFound();
    }

    return { product };
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { product } = Route.useLoaderData();
  return <ProductDetailsTemplate product={product} />;
}
