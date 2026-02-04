import { useInfiniteQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BreadcrumbNav } from "@/components/base/common/breadcrumb-nav";
import StoreFilterSidebar from "@/components/containers/store/storefront/store-filter-sidebar";
import StoreList from "@/components/containers/store/storefront/store-list";
import { storeShopsInfiniteQueryOptions } from "@/hooks/store/use-store-shops";
import type { Store, StoreFilters } from "@/types/store-types";

const defaultFilters: StoreFilters = {
  search: "",
  category: "",
  minRating: 0,
  verifiedOnly: false,
  sortBy: "rating",
};

export default function StoresListingTemplate() {
  const [filters, setFilters] = useState<StoreFilters>(defaultFilters);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Fetch stores from the real API with infinite scroll
  const { data, isPending, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useInfiniteQuery(
      storeShopsInfiniteQueryOptions({
        limit: 12,
        search: filters.search || undefined,
        category: filters.category || undefined,
        sortBy:
          filters.sortBy === "newest"
            ? "createdAt"
            : filters.sortBy === "popular"
              ? "totalProducts"
              : filters.sortBy === "name"
                ? "name"
                : "rating",
        sortDirection: filters.sortBy === "name" ? "asc" : "desc",
      }),
    );

  const stores: Store[] = useMemo(() => {
    const allShops = data?.pages.flatMap((page) => page.data) ?? [];

    let transformed = allShops.map(
      (shop): Store => ({
        id: shop.id,
        slug: shop.slug,
        name: shop.name,
        description: shop.description ?? "",
        logo: shop.logo ?? "",
        banner: shop.banner ?? "",
        rating: shop.rating,
        reviewCount: 0,
        isVerified: shop.status === "active",
        memberSince: shop.createdAt,
        totalProducts: shop.totalProducts,
        followers: 0,
        category: shop.category ?? "General",
        contactEmail: shop.email ?? undefined,
        contactPhone: shop.phone ?? undefined,
        address: shop.address ?? undefined,
      }),
    );

    // Apply client-side rating filter
    if (filters.minRating > 0) {
      transformed = transformed.filter((s) => s.rating >= filters.minRating);
    }

    // Apply verified only filter
    if (filters.verifiedOnly) {
      transformed = transformed.filter((s) => s.isVerified);
    }

    return transformed;
  }, [data?.pages, filters.minRating, filters.verifiedOnly]);

  const totalCount = data?.pages[0]?.total ?? 0;

  // Intersection observer for infinite scroll
  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage],
  );

  useEffect(() => {
    const element = loadMoreRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(handleObserver, {
      threshold: 0.1,
      rootMargin: "100px",
    });

    observer.observe(element);

    return () => observer.disconnect();
  }, [handleObserver]);

  const storesSteps = [
    { label: "Home", href: "/" },
    { label: "Stores", isActive: true },
  ] as const;

  const handleFilterChange = (newFilters: Partial<StoreFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const resetFilters = () => {
    setFilters(defaultFilters);
  };

  return (
    <div className="@container container mx-auto px-4 py-8 min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <BreadcrumbNav items={storesSteps} className="mb-4" />

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="mb-3 font-bold @2xl:text-4xl text-3xl tracking-tight">
            All Stores
          </h1>
          <p className="text-lg text-muted-foreground">
            Discover and shop from our verified sellers
          </p>
        </div>

        {/* Main Content */}
        <div className="flex @2xl:flex-row flex-col gap-8">
          {/* Sidebar */}
          <aside className="@2xl:w-72 w-full shrink-0">
            <div className="@2xl:sticky @2xl:top-4 rounded-xl border bg-card p-6 shadow-sm">
              <StoreFilterSidebar
                filters={filters}
                onFilterChange={handleFilterChange}
                onReset={resetFilters}
              />
            </div>
          </aside>

          {/* Store List */}
          <main className="min-w-0 flex-1">
            {isPending ? (
              <div className="flex min-h-75 items-center justify-center">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span>Loading stores...</span>
                </div>
              </div>
            ) : (
              <>
                <StoreList
                  stores={stores}
                  totalCount={totalCount}
                  isLoading={isPending}
                />

                {/* Infinite scroll trigger */}
                <div ref={loadMoreRef} className="h-10 w-full">
                  {isFetchingNextPage && (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      <span className="ml-2 text-muted-foreground text-sm">
                        Loading more stores...
                      </span>
                    </div>
                  )}
                </div>

                {/* End of list indicator */}
                {!hasNextPage && stores.length > 0 && (
                  <p className="py-4 text-center text-muted-foreground text-sm">
                    You've reached the end of the list
                  </p>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
