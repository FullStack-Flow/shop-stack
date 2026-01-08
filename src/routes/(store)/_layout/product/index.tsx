import { createFileRoute } from '@tanstack/react-router';
import ProductListingTemplate from '@/components/templates/store/product-page/product-listing-template';

export const Route = createFileRoute('/(store)/_layout/product/')({
  component: RouteComponent,
});

function RouteComponent() {
  return <ProductListingTemplate />;
}
