import { Link } from "@tanstack/react-router";
import { Store } from "lucide-react";
import { useEffect } from "react";
import { BreadcrumbNav } from "@/components/base/common/breadcrumb-nav";
import NotFound from "@/components/base/empty/notfound";
import { StoreHeaderSkeleton } from "@/components/base/store/storefront/store-header-skeleton";
import { StoreProductsSkeleton } from "@/components/base/store/storefront/store-products-skeleton";
import { StoreAbout } from "@/components/containers/store/storefront/store-about";
import StoreHeader from "@/components/containers/store/storefront/store-header";
import StoreProducts from "@/components/containers/store/storefront/store-product";
import { StoreReviews } from "@/components/containers/store/storefront/store-reviews";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useStoreFront } from "@/lib/store/store";

interface StorePageTemplateProps {
  slug: string;
}

export default function StorePageTemplate({ slug }: StorePageTemplateProps) {
  const { currentStore, getStoreBySlug, isLoading } = useStoreFront();

  useEffect(() => {
    getStoreBySlug(slug);
  }, [slug, getStoreBySlug]);

  if (isLoading) {
    return (
      <div className="@container container mx-auto px-4 py-8">
        {/* Breadcrumbs Skeleton */}
        <div className="mb-6">
          <Skeleton className="h-5 w-64" />
        </div>

        {/* Store Header Skeleton */}
        <StoreHeaderSkeleton />

        {/* Tabs Skeleton */}
        <div className="mt-8 space-y-6">
          <Skeleton className="h-10 w-full max-w-md" />
          <StoreProductsSkeleton />
        </div>
      </div>
    );
  }

  if (!currentStore) {
    return (
      <div className="@container flex min-h-[70vh] w-full items-center justify-center p-4">
        <NotFound
          title="Store not found"
          description="The store you're looking for doesn't exist or may have been removed."
          icon={
            <Store className="@[48rem]:size-24 size-12 text-muted-foreground" />
          }
          className="w-full @[48rem]:max-w-2xl max-w-md border-dashed @[48rem]:py-24 **:data-[slot=empty-description]:@[48rem]:text-lg **:data-[slot=empty-title]:@[48rem]:text-3xl"
        >
          <Link to="/store">
            <Button className="@[48rem]:h-12 @[48rem]:px-8 @[48rem]:text-base">
              Browse Stores
            </Button>
          </Link>
        </NotFound>
      </div>
    );
  }

  const storeSteps = [
    { label: "Home", href: "/" },
    { label: "Stores", href: "/store" },
    { label: currentStore.name, isActive: true },
  ] as const;

  return (
    <div className="@container container mx-auto px-4 py-8">
      <BreadcrumbNav items={storeSteps} className="mb-4" />

      {/* Store Header */}
      <StoreHeader store={currentStore} />

      {/* Tabbed Content */}
      <div className="mt-8">
        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-4">
            <StoreProducts storeName={currentStore.name} />
          </TabsContent>

          <TabsContent value="about">
            <StoreAbout store={currentStore} />
          </TabsContent>

          <TabsContent value="reviews" className="space-y-4">
            <StoreReviews
              rating={currentStore.rating}
              reviewCount={currentStore.reviewCount}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
