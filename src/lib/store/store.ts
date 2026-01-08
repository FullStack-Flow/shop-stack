import { mockStores } from "@/data/store";
import type { Store, StoreFilters } from "@/types/store-types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface StoreState {
  stores: Store[];
  currentStore: Store | null;
  filters: StoreFilters;
  followedStores: string[];
  isLoading: boolean;

  // Actions
  setStores: (stores: Store[]) => void;
  setCurrentStore: (store: Store | null) => void;
  getStoreBySlug: (slug: string) => Store | undefined;
  setFilters: (filters: Partial<StoreFilters>) => void;
  resetFilters: () => void;
  toggleFollow: (storeId: string) => void;
  isFollowing: (storeId: string) => boolean;
  getFilteredStores: () => Store[];
}

const defaultFilters: StoreFilters = {
  search: "",
  category: "",
  minRating: 0,
  verifiedOnly: false,
  sortBy: "rating",
};

export const useStoreFront = create<StoreState>()(
  persist(
    (set, get) => ({
      stores: mockStores,
      currentStore: null,
      filters: defaultFilters,
      followedStores: [],
      isLoading: false,

      setStores: (stores) => set({ stores }),

      setCurrentStore: (store) => set({ currentStore: store }),

      getStoreBySlug: (slug) => {
        const store = get().stores.find((s) => s.slug === slug);
        if (store) {
          set({ currentStore: store });
        }
        return store;
      },

      setFilters: (newFilters) =>
        set((state) => ({
          filters: { ...state.filters, ...newFilters },
        })),

      resetFilters: () => set({ filters: defaultFilters }),

      toggleFollow: (storeId) =>
        set((state) => {
          const isFollowing = state.followedStores.includes(storeId);
          return {
            followedStores: isFollowing
              ? state.followedStores.filter((id) => id !== storeId)
              : [...state.followedStores, storeId],
          };
        }),

      isFollowing: (storeId) => get().followedStores.includes(storeId),

      getFilteredStores: () => {
        const { stores, filters } = get();
        let filtered = [...stores];

        // Apply search filter
        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          filtered = filtered.filter(
            (store) =>
              store.name.toLowerCase().includes(searchLower) ||
              store.description.toLowerCase().includes(searchLower)
          );
        }

        // Apply category filter
        if (filters.category) {
          filtered = filtered.filter(
            (store) => store.category === filters.category
          );
        }

        // Apply rating filter
        if (filters.minRating > 0) {
          filtered = filtered.filter(
            (store) => store.rating >= filters.minRating
          );
        }

        // Apply verified filter
        if (filters.verifiedOnly) {
          filtered = filtered.filter((store) => store.isVerified);
        }

        // Apply sorting
        filtered.sort((a, b) => {
          switch (filters.sortBy) {
            case "rating":
              return b.rating - a.rating;
            case "newest":
              return (
                new Date(b.memberSince).getTime() -
                new Date(a.memberSince).getTime()
              );
            case "popular":
              return b.followers - a.followers;
            case "name":
              return a.name.localeCompare(b.name);
            default:
              return 0;
          }
        });

        return filtered;
      },
    }),
    {
      name: "storefront",
      partialize: (state) => ({
        followedStores: state.followedStores,
      }),
    }
  )
);
