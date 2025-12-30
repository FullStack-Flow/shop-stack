import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import NotFound from "@/components/base/empty/notfound";
import { Button } from "@/components/ui/button";
import { mockProducts } from "@/data/products";
import {
  getCategoryBreadcrumb,
  getCategoryBySlug,
  getSubcategories,
} from "@/lib/helper/categories";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Grid3x3, List, ShoppingBag } from "lucide-react";
import { useState } from "react";
import CategoryGrid from "@/components/containers/store/category/category-grid";
import { Separator } from "@/components/ui/separator";
import ProductGrid from "@/components/containers/store/product-list/product-grid";

export default function CategoryDetailTemplate({ slug }: { slug: string }) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const category = getCategoryBySlug(slug);
  const subcategories = category ? getSubcategories(category.id) : [];
  const breadcrumb = category ? getCategoryBreadcrumb(category.id) : [];

  // Filter products for this category
  // Note: In a real app this would be an API call
  // For mock data, we try to match by slug or name, or show generic products if no match found
  const categoryProducts = category
    ? mockProducts.filter(
        (p) =>
          p.category.slug === category.slug ||
          p.category.name.toLowerCase() === category.name.toLowerCase()
      )
    : [];

  const displayProducts =
    categoryProducts.length > 0 ? categoryProducts : mockProducts.slice(0, 8); // Fallback for demo

  if (!category) {
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
    </div>;
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
              {category?.icon && (
                <span className="text-2xl">{category.icon}</span>
              )}
              <h1 className="font-bold text-3xl tracking-tight">
                {category?.name}
              </h1>
            </div>
            {category?.description && (
              <p className="mt-2 @md:max-w-2xl text-muted-foreground">
                {category?.description}
              </p>
            )}
            <p className="mt-2 text-muted-foreground text-sm">
              {categoryProducts.length > 0
                ? categoryProducts.length
                : category?.productCount}{" "}
              products in this category
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
                Products in {category?.name}
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

            <ProductGrid products={displayProducts} viewMode={viewMode} />
          </div>
        </div>
      </div>
    </div>
  );
}
