import {
  queryOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createTag,
  deleteTag,
  getTagById,
  getTags,
  updateTag,
} from "@/lib/functions/vendor/tag";
import type {
  CreateTagInput,
  UpdateTagInput,
} from "@/lib/validators/shared/tag-query";
import type { ListTagsQuery } from "@/types/tags";

export const vendorTagsKeys = {
  all: (shopId: string) => ["vendor", "tags", shopId] as const,
  lists: (shopId: string) => [...vendorTagsKeys.all(shopId), "list"] as const,
  list: (params: ListTagsQuery) =>
    [...vendorTagsKeys.lists(params.shopId), params] as const,
  details: (shopId: string) =>
    [...vendorTagsKeys.all(shopId), "detail"] as const,
  detail: (shopId: string, id: string) =>
    [...vendorTagsKeys.details(shopId), id] as const,
};

const defaultParams: Partial<ListTagsQuery> = {
  limit: 10,
  offset: 0,
  sortBy: "sortOrder",
  sortDirection: "asc",
};

export const tagsQueryOptions = (params: ListTagsQuery) =>
  queryOptions({
    queryKey: vendorTagsKeys.list(params),
    queryFn: () => getTags({ data: { ...defaultParams, ...params } }),
    enabled: !!params.shopId,
  });

export const tagByIdQueryOptions = (id: string, shopId: string) =>
  queryOptions({
    queryKey: vendorTagsKeys.detail(shopId, id),
    queryFn: () => getTagById({ data: { id, shopId } }),
    enabled: !!id && !!shopId,
  });

export interface VendorTagMutationState {
  creatingId: string | null;
  deletingId: string | null;
  updatingId: string | null;
  isAnyMutating: boolean;
}

export const useTagMutations = (shopId: string) => {
  const queryClient = useQueryClient();

  const invalidateTags = () => {
    queryClient.invalidateQueries({
      queryKey: vendorTagsKeys.all(shopId),
    });
  };

  const createTagMutation = useMutation({
    mutationFn: async (
      data: Omit<CreateTagInput, "shopId"> & { name: string },
    ) => {
      const result = await createTag({ data: { ...data, shopId } });
      return result;
    },
    onSuccess: (result) => {
      toast.success(`Tag "${result.tag?.name}" created successfully!`);
      invalidateTags();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create tag");
    },
  });

  const updateTagMutation = useMutation({
    mutationFn: async (
      data: Omit<UpdateTagInput, "shopId"> & { id: string },
    ) => {
      const result = await updateTag({ data: { ...data, shopId } });
      return result;
    },
    onSuccess: (result) => {
      toast.success(`Tag "${result.tag?.name}" updated successfully!`);
      invalidateTags();
      if (result.tag?.id) {
        queryClient.invalidateQueries({
          queryKey: vendorTagsKeys.detail(shopId, result.tag.id),
        });
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update tag");
    },
  });

  const deleteTagMutation = useMutation({
    mutationFn: async (tagId: string) => {
      const result = await deleteTag({
        data: { id: tagId, shopId },
      });
      return result;
    },
    onSuccess: () => {
      toast.success("Tag deleted successfully");
      invalidateTags();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete tag");
    },
  });

  const mutationState: VendorTagMutationState = {
    creatingId: createTagMutation.isPending ? "new" : null,
    deletingId: deleteTagMutation.isPending
      ? (deleteTagMutation.variables ?? null)
      : null,
    updatingId: updateTagMutation.isPending
      ? (updateTagMutation.variables?.id ?? null)
      : null,
    isAnyMutating:
      createTagMutation.isPending ||
      updateTagMutation.isPending ||
      deleteTagMutation.isPending,
  };

  return {
    createTag: createTagMutation.mutateAsync,
    updateTag: updateTagMutation.mutateAsync,
    deleteTag: deleteTagMutation.mutateAsync,
    isCreating: createTagMutation.isPending,
    isUpdating: updateTagMutation.isPending,
    isDeleting: deleteTagMutation.isPending,
    mutationState,
    isTagMutating: (id: string) =>
      mutationState.deletingId === id || mutationState.updatingId === id,
  };
};

export const useTags = (shopId: string) => {
  const mutations = useTagMutations(shopId);

  return {
    tagsQueryOptions: (params: Omit<ListTagsQuery, "shopId">) =>
      tagsQueryOptions({ ...params, shopId }),
    tagByIdQueryOptions: (id: string) => tagByIdQueryOptions(id, shopId),
    queryKeys: vendorTagsKeys,
    ...mutations,
  };
};
