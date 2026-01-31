import {
  queryOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createAttribute,
  deleteAttribute,
  getAttributeById,
  getAttributes,
  updateAttribute,
} from "@/lib/functions/vendor/attribute";
import type {
  CreateAttributeInput,
  UpdateAttributeInput,
} from "@/lib/validators/shared/attribute-query";
import type { ListAttributesQuery } from "@/types/attributes";

export const vendorAttributesKeys = {
  all: (shopId: string) => ["vendor", "attributes", shopId] as const,
  lists: (shopId: string) =>
    [...vendorAttributesKeys.all(shopId), "list"] as const,
  list: (params: ListAttributesQuery) =>
    [...vendorAttributesKeys.lists(params.shopId), params] as const,
  details: (shopId: string) =>
    [...vendorAttributesKeys.all(shopId), "detail"] as const,
  detail: (shopId: string, id: string) =>
    [...vendorAttributesKeys.details(shopId), id] as const,
};

const defaultParams: Partial<ListAttributesQuery> = {
  limit: 10,
  offset: 0,
  sortBy: "sortOrder",
  sortDirection: "asc",
};

export const attributesQueryOptions = (params: ListAttributesQuery) =>
  queryOptions({
    queryKey: vendorAttributesKeys.list(params),
    queryFn: () => getAttributes({ data: { ...defaultParams, ...params } }),
    enabled: !!params.shopId,
  });

export const attributeByIdQueryOptions = (id: string, shopId: string) =>
  queryOptions({
    queryKey: vendorAttributesKeys.detail(shopId, id),
    queryFn: () => getAttributeById({ data: { id, shopId } }),
    enabled: !!id && !!shopId,
  });

export interface VendorAttributeMutationState {
  creatingId: string | null;
  deletingId: string | null;
  updatingId: string | null;
  isAnyMutating: boolean;
}

export const useAttributeMutations = (shopId: string) => {
  const queryClient = useQueryClient();

  const invalidateAttributes = () => {
    queryClient.invalidateQueries({
      queryKey: vendorAttributesKeys.all(shopId),
    });
  };

  const createAttributeMutation = useMutation({
    mutationFn: async (
      data: Omit<CreateAttributeInput, "shopId"> & { name: string },
    ) => {
      const result = await createAttribute({ data: { ...data, shopId } });
      return result;
    },
    onSuccess: (result) => {
      toast.success(
        `Attribute "${result.attribute?.name}" created successfully!`,
      );
      invalidateAttributes();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create attribute");
    },
  });

  const updateAttributeMutation = useMutation({
    mutationFn: async (
      data: Omit<UpdateAttributeInput, "shopId"> & { id: string },
    ) => {
      const result = await updateAttribute({ data: { ...data, shopId } });
      return result;
    },
    onSuccess: (result) => {
      toast.success(
        `Attribute "${result.attribute?.name}" updated successfully!`,
      );
      invalidateAttributes();
      if (result.attribute?.id) {
        queryClient.invalidateQueries({
          queryKey: vendorAttributesKeys.detail(shopId, result.attribute.id),
        });
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update attribute");
    },
  });

  const deleteAttributeMutation = useMutation({
    mutationFn: async (attributeId: string) => {
      const result = await deleteAttribute({
        data: { id: attributeId, shopId },
      });
      return result;
    },
    onSuccess: () => {
      toast.success("Attribute deleted successfully");
      invalidateAttributes();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete attribute");
    },
  });

  const mutationState: VendorAttributeMutationState = {
    creatingId: createAttributeMutation.isPending ? "new" : null,
    deletingId: deleteAttributeMutation.isPending
      ? (deleteAttributeMutation.variables ?? null)
      : null,
    updatingId: updateAttributeMutation.isPending
      ? (updateAttributeMutation.variables?.id ?? null)
      : null,
    isAnyMutating:
      createAttributeMutation.isPending ||
      updateAttributeMutation.isPending ||
      deleteAttributeMutation.isPending,
  };

  return {
    createAttribute: createAttributeMutation.mutateAsync,
    updateAttribute: updateAttributeMutation.mutateAsync,
    deleteAttribute: deleteAttributeMutation.mutateAsync,
    isCreating: createAttributeMutation.isPending,
    isUpdating: updateAttributeMutation.isPending,
    isDeleting: deleteAttributeMutation.isPending,
    mutationState,
    isAttributeMutating: (id: string) =>
      mutationState.deletingId === id || mutationState.updatingId === id,
  };
};

export const useAttributes = (shopId: string) => {
  const mutations = useAttributeMutations(shopId);

  return {
    attributesQueryOptions: (params: Omit<ListAttributesQuery, "shopId">) =>
      attributesQueryOptions({ ...params, shopId }),
    attributeByIdQueryOptions: (id: string) =>
      attributeByIdQueryOptions(id, shopId),
    queryKeys: vendorAttributesKeys,
    ...mutations,
  };
};
