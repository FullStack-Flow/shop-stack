import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useMemo } from "react";
import CategoryTree from "@/components/base/store/category/category-tree";
import CategoryGrid from "@/components/containers/store/category/category-grid";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  categoryTreeQueryOptions,
  featuredCategoriesQueryOptions,
  storeCategoriesQueryOptions,
} from "@/hooks/store/use-store-categories";
import {
  filterRootCategories,
  toUICategory,
  toUICategoryTree,
} from "@/lib/transformers/category-transformers";

export default function CategoryTemplate() {
  const {
    data: categoriesData,
    isPending: isCategoriesPending,
    error: categoriesError,
  } = useQuery(storeCategoriesQueryOptions({ limit: 50 }));

  const {
    data: featuredData,
    isPending: isFeaturedPending,
    error: featuredError,
  } = useQuery(featuredCategoriesQueryOptions(8));

  const {
    data: treeData,
    isPending: isTreePending,
    error: treeError,
  } = useQuery(categoryTreeQueryOptions());

  const rootCategories = useMemo(() => {
    const allCategories = (categoriesData?.data ?? []).map(toUICategory);
    return filterRootCategories(allCategories);
  }, [categoriesData?.data]);

  const featuredCategories = useMemo(
    () => (featuredData?.categories ?? []).map(toUICategory),
    [featuredData?.categories],
  );

  const categoryTree = useMemo(
    () => (treeData?.tree ?? []).map(toUICategoryTree),
    [treeData?.tree],
  );

  const isPending = isCategoriesPending || isFeaturedPending || isTreePending;
  const hasError = categoriesError || featuredError || treeError;

  if (isPending) {
    return (
      <div className="@container container mx-auto flex min-h-100 items-center justify-center px-4 py-8">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading categories...</span>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="@container container mx-auto flex min-h-100 items-center justify-center px-4 py-8">
        <div className="text-center text-muted-foreground">
          <p>Failed to load categories. Please try again later.</p>
        </div>
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
              <BreadcrumbPage>Categories</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <h1 className="mt-4 font-bold text-3xl tracking-tight">
          All Categories
        </h1>
        <p className="mt-2 text-muted-foreground">
          Browse our wide range of product categories
        </p>
      </div>

      <div className="grid @5xl:grid-cols-12 gap-8">
        {/* Sidebar - Category Tree */}
        <div className="@5xl:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Browse Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <CategoryTree categories={categoryTree} />
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="@5xl:col-span-9 space-y-8">
          {/* Featured Categories */}
          {featuredCategories.length > 0 && (
            <div>
              <h2 className="mb-4 font-semibold text-xl">
                Featured Categories
              </h2>
              <CategoryGrid
                categories={featuredCategories}
                variant="featured"
                columns={{
                  default: 1,
                  sm: 2,
                  md: 3,
                  lg: 3,
                  xl: 3,
                }}
              />
            </div>
          )}

          <Separator />

          {/* All Categories */}
          <Tabs defaultValue="grid" className="w-full">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-xl">All Categories</h2>
              <TabsList>
                <TabsTrigger value="grid">Grid View</TabsTrigger>
                <TabsTrigger value="list">List View</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="grid" className="mt-6">
              <CategoryGrid
                categories={rootCategories}
                variant="default"
                columns={{
                  default: 2,
                  sm: 3,
                  md: 4,
                  lg: 4,
                  xl: 5,
                }}
              />
            </TabsContent>

            <TabsContent value="list" className="mt-6">
              <CategoryGrid
                categories={rootCategories}
                variant="list"
                columns={{
                  default: 1,
                  sm: 1,
                  md: 2,
                  lg: 2,
                  xl: 2,
                }}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
