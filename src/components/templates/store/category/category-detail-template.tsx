import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Grid3x3, List, Loader2, ShoppingBag } from "lucide-react";
import { useMemo, useState } from "react";
import NotFound from "@/components/base/empty/notfound";
import CategoryGrid from "@/components/containers/store/category/category-grid";
import ProductGrid from "@/components/containers/store/product-list/product-grid";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  storeCategoryBySlugQueryOptions,
  subcategoriesQueryOptions,
} from "@/hooks/store/use-store-categories";
import { storeProductsQueryOptions } from "@/hooks/store/use-store-product";
import { toDisplayProducts } from "@/lib/helper/products-query-helpers";
import { toUICategory } from "@/lib/transformers/category-transformers";

export default function CategoryDetailTemplate({ slug }: { slug: string }) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const {
    data: categoryData,
    isPending: isCategoryPending,
    error: categoryError,
  } = useQuery(storeCategoryBySlugQueryOptions(slug));

  const category = categoryData?.category;

  const { data: subcategoriesData } = useQuery({
    ...subcategoriesQueryOptions(category?.id ?? ""),
    enabled: !!category?.id,
  });

  const { data: productsData, isPending: isProductsPending } = useQuery({
    ...storeProductsQueryOptions({
      categoryId: category?.id,
      limit: 20,
      sortBy: "createdAt",
      sortDirection: "desc",
    }),
    enabled: !!category?.id,
  });

  const products = useMemo(
    () => toDisplayProducts(productsData?.data ?? []),
    [productsData?.data],
  );

  const subcategories = useMemo(
    () => (subcategoriesData?.categories ?? []).map(toUICategory),
    [subcategoriesData?.categories],
  );

  // Build breadcrumb - currently just shows current category
  // TODO: Implement full parent chain breadcrumb by fetching parent categories
  const breadcrumb = useMemo(() => {
    if (!category) return [];
    return [
      {
        id: category.id,
        name: category.name,
        slug: category.slug,
      },
    ];
  }, [category]);

  if (isCategoryPending) {
    return (
      <div className="@container container mx-auto flex min-h-100 items-center justify-center px-4 py-8">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading category...</span>
        </div>
      </div>
    );
  }

  if (categoryError || !category) {
    return (
      <div className="@container container mx-auto px-4 py-8">
        <NotFound
          title="Category not found"
          description="The category you're looking for doesn't exist or has been removed."
          icon={<ShoppingBag className="h-10 w-10 text-muted-foreground" />}
        >
          <Link to="/category">
            <Button variant="outline">Browse All Categories</Button>
          </Link>
        </NotFound>
      </div>
    );
  }

  return (
    <div className="@container container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="mb-8">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/category">Categories</BreadcrumbLink>
            </BreadcrumbItem>
            {breadcrumb.map((item, index) => (
              <div key={item.id} className="flex items-center">
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  {index === breadcrumb.length - 1 ? (
                    <BreadcrumbPage>{item.name}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink href={`/category/${item.slug}`}>
                      {item.name}
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </div>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Category Header */}
      <div className="mb-8">
        <div className="flex @md:flex-row flex-col @md:items-center @md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              {category.icon && (
                <span className="text-2xl">{category.icon}</span>
              )}
              <h1 className="font-bold text-3xl tracking-tight">
                {category.name}
              </h1>
            </div>
            {category.description && (
              <p className="mt-2 @md:max-w-2xl text-muted-foreground">
                {category.description}
              </p>
            )}
            <p className="mt-2 text-muted-foreground text-sm">
              {category.productCount} products in this category
            </p>
          </div>

          <Link to="/category">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Categories
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid @5xl:grid-cols-12 gap-8">
        {/* Main Content */}
        <div className="@5xl:col-span-12 space-y-8">
          {/* Subcategories */}
          {subcategories.length > 0 && (
            <div>
              <h2 className="mb-4 font-semibold text-xl">Subcategories</h2>
              <CategoryGrid
                categories={subcategories}
                variant="default"
                columns={{
                  default: 2,
                  sm: 3,
                  md: 4,
                  lg: 5,
                  xl: 6,
                }}
              />
            </div>
          )}

          {subcategories.length > 0 && <Separator />}

          {/* Products in this category */}
          <div>
            <div className="mb-6 flex @4xl:flex-row flex-col @4xl:items-center @4xl:justify-between gap-4">
              <h2 className="font-semibold text-xl">
                Products in {category.name}
              </h2>

              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="gap-2"
                >
                  <Grid3x3 className="h-4 w-4" />
                  Grid
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="gap-2"
                >
                  <List className="h-4 w-4" />
                  List
                </Button>
              </div>
            </div>

            <ProductGrid
              products={products}
              viewMode={viewMode}
              isLoading={isProductsPending}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
