import { createFileRoute, notFound } from "@tanstack/react-router";
import ProductDetailsTemplate from "@/components/templates/store/product-details-template";
import { getStoreProductById } from "@/lib/functions/store/products";
export const Route = createFileRoute("/(store)/_layout/product/$productId")({
  loader: async ({ params }) => {
    try {
      const { product } = await getStoreProductById({
        data: { id: params.productId },
      });

      return { product };
    } catch {
      throw notFound();
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { product } = Route.useLoaderData();

  return <ProductDetailsTemplate product={product} />;
}
