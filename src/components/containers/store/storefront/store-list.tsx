import NotFound from '@/components/base/empty/notfound';
import StoreCard from '@/components/base/store/storefront/store-card';
import { StoreListSkeleton } from '@/components/base/store/storefront/store-card-skeleton';
import { useStoreFront } from '@/lib/store/store';

export default function StoreList() {
  const { getFilteredStores, isLoading } = useStoreFront();
  const stores = getFilteredStores();

  if (isLoading) {
    return <StoreListSkeleton />;
  }

  if (stores.length === 0) {
    return (
      <NotFound
        title="No stores found"
        description="Try adjusting your filters or search query to find what you're looking for."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-3">
        <p className="font-medium text-sm">
          Showing <span className="text-primary">{stores.length}</span>{' '}
          {stores.length === 1 ? 'store' : 'stores'}
        </p>
      </div>

      {/* Store Grid */}
      <div className="grid @5xl:grid-cols-2 @7xl:grid-cols-3 grid-cols-1 gap-6">
        {stores.map((store) => (
          <StoreCard key={store.id} store={store} />
        ))}
      </div>
    </div>
  );
}
