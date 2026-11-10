import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@Team-Trung-Vu-Khang/eco-shared-ui";
import { getErrorMessage } from "@/lib/api-error";
import { contentBlockApi } from "../api/content-block.api";
import type {
  BannerBlockData,
  BannerBlockSettings,
  BannerSlideInput,
  BannerSlideItem,
  ContentBlockType,
  FaqBlockData,
  FaqBlockSettings,
  FaqQuestionInput,
  FaqQuestionItem,
  HighlightBlockSettings,
  HighlightCardInput,
  HighlightCardItem,
  HighlightsBlockData,
  PublicContentBlocksResponse,
} from "../types";

export const contentBlockKeys = {
  all: ["content-blocks"] as const,
  block: (block: ContentBlockType) => [...contentBlockKeys.all, block] as const,
  public: (block?: ContentBlockType) =>
    [...contentBlockKeys.all, "public", block] as const,
};

/** Đọc cấu hình và danh sách items của 1 khối */
export function useContentBlock<
  T extends BannerBlockData | HighlightsBlockData | FaqBlockData,
>(block: ContentBlockType) {
  return useQuery<T>({
    queryKey: contentBlockKeys.block(block),
    queryFn: () => contentBlockApi.getBlock<T>(block),
  });
}

/** Đọc dữ liệu công khai cho web public */
export function usePublicContentBlocks(block?: ContentBlockType) {
  return useQuery<PublicContentBlocksResponse>({
    queryKey: contentBlockKeys.public(block),
    queryFn: () => contentBlockApi.getPublic(block),
  });
}

/** Lưu cấu hình khối (Settings) */
export function useUpdateBlockSettings(block: ContentBlockType) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({
      version,
      settings,
    }: {
      version: number;
      settings: BannerBlockSettings | HighlightBlockSettings | FaqBlockSettings;
    }) => contentBlockApi.updateSettings(block, version, settings),
    onSuccess: (updatedBlock) => {
      queryClient.setQueryData(contentBlockKeys.block(block), updatedBlock);
      queryClient.invalidateQueries({
        queryKey: contentBlockKeys.block(block),
      });
      queryClient.invalidateQueries({ queryKey: contentBlockKeys.public() });
      toast({
        title: "Thành công",
        description: "Đã lưu cấu hình khối thành công",
      });
    },
    onError: (err: unknown) => {
      if (axios.isAxiosError(err) && err.response?.status === 409) {
        toast({
          title: "Xung đột dữ liệu",
          description:
            "Nội dung đã được người khác cập nhật. Hệ thống đang tải lại dữ liệu mới nhất.",
          variant: "destructive",
        });
        queryClient.invalidateQueries({
          queryKey: contentBlockKeys.block(block),
        });
        return;
      }
      if (axios.isAxiosError(err) && err.response?.status === 503) {
        toast({
          title: "Lỗi hệ thống tạm thời",
          description:
            "Không thể lưu do cơ sở dữ liệu gián đoạn. Thay đổi chưa được lưu, vui lòng thử lại.",
          variant: "destructive",
        });
        return;
      }
      toast({
        title: "Lỗi",
        description: getErrorMessage(err, "Không thể lưu cấu hình khối"),
        variant: "destructive",
      });
    },
  });
}

/** Thêm item mới vào khối (POST /items) */
export function useCreateBlockItem<
  TItem extends BannerSlideItem | HighlightCardItem | FaqQuestionItem,
  TInput extends BannerSlideInput | HighlightCardInput | FaqQuestionInput,
>(block: ContentBlockType) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (item: TInput) =>
      contentBlockApi.createItem<TItem>(block, item),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: contentBlockKeys.block(block),
      });
      queryClient.invalidateQueries({ queryKey: contentBlockKeys.public() });
      toast({
        title: "Thành công",
        description: "Đã thêm mới thành công",
      });
    },
    onError: (err: unknown) => {
      if (axios.isAxiosError(err) && err.response?.status === 503) {
        toast({
          title: "Lỗi hệ thống tạm thời",
          description:
            "Không thể thêm mới do hệ thống gián đoạn. Thay đổi chưa được lưu, vui lòng thử lại.",
          variant: "destructive",
        });
        return;
      }
      toast({
        title: "Lỗi",
        description: getErrorMessage(err, "Không thể thêm mới"),
        variant: "destructive",
      });
    },
  });
}

/** Sửa / Bật tắt item (PUT /items/{id}?version=) kèm Optimistic Update */
export function useUpdateBlockItem<
  TItem extends BannerSlideItem | HighlightCardItem | FaqQuestionItem,
  TInput extends BannerSlideInput | HighlightCardInput | FaqQuestionInput,
>(block: ContentBlockType) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({
      id,
      version,
      item,
    }: {
      id: string;
      version: number;
      item: TInput;
    }) => contentBlockApi.updateItem<TItem>(block, id, version, item),
    onMutate: async ({ id, item }) => {
      await queryClient.cancelQueries({
        queryKey: contentBlockKeys.block(block),
      });
      const previousBlock = queryClient.getQueryData<
        BannerBlockData | HighlightsBlockData | FaqBlockData
      >(contentBlockKeys.block(block));

      if (previousBlock && Array.isArray(previousBlock.items)) {
        queryClient.setQueryData<
          BannerBlockData | HighlightsBlockData | FaqBlockData
        >(contentBlockKeys.block(block), {
          ...previousBlock,
          items: (
            previousBlock.items as (
              | BannerSlideItem
              | HighlightCardItem
              | FaqQuestionItem
            )[]
          ).map((it) =>
            it.id === id ? ({ ...it, ...item } as unknown as TItem) : it,
          ),
        } as BannerBlockData | HighlightsBlockData | FaqBlockData);
      }

      return { previousBlock };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: contentBlockKeys.block(block),
      });
      queryClient.invalidateQueries({ queryKey: contentBlockKeys.public() });
      toast({
        title: "Thành công",
        description: "Đã cập nhật thành công",
      });
    },
    onError: (err: unknown, _vars, context) => {
      if (context?.previousBlock) {
        queryClient.setQueryData(
          contentBlockKeys.block(block),
          context.previousBlock,
        );
      }
      if (axios.isAxiosError(err) && err.response?.status === 409) {
        toast({
          title: "Xung đột dữ liệu",
          description:
            "Nội dung đã được người khác cập nhật. Vui lòng kiểm tra lại dữ liệu.",
          variant: "destructive",
        });
        queryClient.invalidateQueries({
          queryKey: contentBlockKeys.block(block),
        });
        return;
      }
      if (axios.isAxiosError(err) && err.response?.status === 503) {
        toast({
          title: "Lỗi hệ thống tạm thời",
          description:
            "Không thể cập nhật do hệ thống gián đoạn. Thay đổi chưa được lưu, vui lòng thử lại.",
          variant: "destructive",
        });
        return;
      }
      toast({
        title: "Lỗi",
        description: getErrorMessage(err, "Không thể cập nhật"),
        variant: "destructive",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: contentBlockKeys.block(block),
      });
      queryClient.invalidateQueries({ queryKey: contentBlockKeys.public() });
    },
  });
}

/** Xóa item (DELETE /items/{id}) */
export function useDeleteBlockItem(block: ContentBlockType) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => contentBlockApi.deleteItem(block, id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: contentBlockKeys.block(block),
      });
      queryClient.invalidateQueries({ queryKey: contentBlockKeys.public() });
      toast({
        title: "Thành công",
        description: "Đã xóa thành công",
      });
    },
    onError: (err: unknown) => {
      toast({
        title: "Lỗi",
        description: getErrorMessage(err, "Không thể xóa item"),
        variant: "destructive",
      });
    },
  });
}

/** Đổi thứ tự items (PUT /items/order) kèm Optimistic Update */
export function useReorderBlockItems(block: ContentBlockType) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (ids: string[]) => contentBlockApi.reorderItems(block, ids),
    onMutate: async (ids: string[]) => {
      // 1. Cancel ongoing queries for this block to avoid overwriting optimistic state
      await queryClient.cancelQueries({
        queryKey: contentBlockKeys.block(block),
      });

      // 2. Snapshot current state for rollback
      const previousBlock = queryClient.getQueryData<
        BannerBlockData | HighlightsBlockData | FaqBlockData
      >(contentBlockKeys.block(block));

      // 3. Optimistically reorder in cache
      if (previousBlock && Array.isArray(previousBlock.items)) {
        const itemMap = new Map(previousBlock.items.map((it) => [it.id, it]));
        const reorderedItems = ids.map((id) => itemMap.get(id)).filter(Boolean);

        queryClient.setQueryData(contentBlockKeys.block(block), {
          ...previousBlock,
          items: reorderedItems,
        });
      }

      return { previousBlock };
    },
    onError: (err: unknown, _ids, context) => {
      // Revert cache to previous snapshot
      if (context?.previousBlock) {
        queryClient.setQueryData(
          contentBlockKeys.block(block),
          context.previousBlock,
        );
      }

      if (axios.isAxiosError(err) && err.response?.status === 409) {
        toast({
          title: "Xung đột thứ tự",
          description:
            "Danh sách đã bị thay đổi bởi người khác. Đã hoàn tác vị trí và tải lại dữ liệu mới.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Lỗi đổi thứ tự",
        description: getErrorMessage(
          err,
          "Không thể thay đổi thứ tự, đã hoàn tác về vị trí cũ.",
        ),
        variant: "destructive",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: contentBlockKeys.block(block),
      });
      queryClient.invalidateQueries({ queryKey: contentBlockKeys.public() });
    },
  });
}
