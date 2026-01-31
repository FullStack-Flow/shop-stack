import {
  queryOptions,
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { useMemo } from "react";
import { toast } from "sonner";
import {
  createShop,
  deleteShop,
  getShopBySlug,
  getVendorShops,
  updateShop,
} from "@/lib/functions/shops";
import type { CreateShopInput, UpdateShopInput } from "@/lib/validators/shop";

export const vendorShopsQueryOptions = () =>
  queryOptions({
    queryKey: ["vendor", "shops"],
    queryFn: () => getVendorShops(),
  });

export const shopBySlugQueryOptions = (slug: string) =>
  queryOptions({
    queryKey: ["vendor", "shops", slug],
    queryFn: () => getShopBySlug({ data: { slug } }),
    enabled: !!slug,
  });

export const useShopMutations = () => {
  const queryClient = useQueryClient();

  const invalidateShops = () => {
    queryClient.invalidateQueries({
      queryKey: ["vendor", "shops"],
    });
  };

  const createShopMutation = useMutation({
    mutationFn: async (data: CreateShopInput) => {
      const result = await createShop({ data });
      return result;
    },
    onSuccess: (result) => {
      toast.success(`Shop "${result.shop?.name}" created successfully!`);
      invalidateShops();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create shop");
    },
  });

  // Update shop mutation
  const updateShopMutation = useMutation({
    mutationFn: async (data: UpdateShopInput) => {
      const result = await updateShop({ data });
      return result;
    },
    onSuccess: (result) => {
      toast.success(`Shop "${result.shop?.name}" updated successfully!`);
      invalidateShops();
      // Also invalidate specific shop query if slug exists
      if (result.shop?.slug) {
        queryClient.invalidateQueries({
          queryKey: ["vendor", "shops", result.shop.slug],
        });
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update shop");
    },
  });

  // Delete shop mutation
  const deleteShopMutation = useMutation({
    mutationFn: async (shopId: string) => {
      const result = await deleteShop({ data: { id: shopId } });
      return result;
    },
    onSuccess: () => {
      toast.success("Shop deleted successfully");
      invalidateShops();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete shop");
    },
  });

  return {
    createShop: createShopMutation.mutateAsync,
    updateShop: updateShopMutation.mutateAsync,
    deleteShop: deleteShopMutation.mutateAsync,
    isCreating: createShopMutation.isPending,
    isUpdating: updateShopMutation.isPending,
    isDeleting: deleteShopMutation.isPending,
  };
};

export const useShops = () => {
  const mutations = useShopMutations();
  return {
    shopsQueryOptions: vendorShopsQueryOptions,
    shopBySlugQueryOptions,
    ...mutations,
  };
};

export const useTransformedShops = (options?: { filterByVendor?: boolean }) => {
  const { shopsQueryOptions } = useShops();
  const { data, ...rest } = useSuspenseQuery(shopsQueryOptions());

  const shops = data?.shops ?? [];
  const vendorId = data?.vendorId;

  const transformedShops = useMemo(() => {
    let filteredShops = shops;

    if (options?.filterByVendor && vendorId) {
      filteredShops = shops.filter((shop) => shop.vendorId === vendorId);
    } else if (options?.filterByVendor && !vendorId) {
      filteredShops = [];
    }

    return filteredShops.map((shop) => ({
      id: shop.id,
      vendorId: shop.vendorId,
      slug: shop.slug,
      name: shop.name,
      description: shop.description || null,
      logo: shop.logo || null,
      banner: shop.banner || null,
      category: shop.category || null,
      address: shop.address || null,
      phone: shop.phone || null,
      email: shop.email || null,
      enableNotifications: shop.enableNotifications || false,
      monthlyRevenue: new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(shop.totalRevenue || 0),
      status: (shop.status === "active" ? "active" : "pending") as
        | "active"
        | "pending",
      rating: (shop.rating || "0.0") as string,
      totalProducts: shop.totalProducts || 0,
      totalOrders: shop.totalOrders || 0,
      createdAt: shop.createdAt || new Date(),
      updatedAt: shop.updatedAt || new Date(),
    }));
  }, [shops, vendorId, options?.filterByVendor]);

  return {
    shops: transformedShops,
    vendorId,
    ...rest,
  };
};
