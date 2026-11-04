import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { dashboardKeys } from "@/features/dashboard/hooks/use-dashboard";
import { reviewApi } from "../api/review.api";
import type { ReviewListParams, SetReviewVisibilityInput } from "../types";

export const reviewKeys = {
  all: ["reviews"] as const,
  list: (params: ReviewListParams) => [...reviewKeys.all, "list", params] as const,
  stats: (productId?: number) => [...reviewKeys.all, "stats", productId ?? "all"] as const,
};

export function useReviews(params: ReviewListParams = {}) {
  return useQuery({
    queryKey: reviewKeys.list(params),
    queryFn: () => reviewApi.list(params),
    placeholderData: keepPreviousData,
  });
}

export function useReviewStats(productId?: number) {
  return useQuery({ queryKey: reviewKeys.stats(productId), queryFn: () => reviewApi.stats(productId) });
}

function useInvalidateReviews() {
  const qc = useQueryClient();
  return () =>
    Promise.all([
      qc.invalidateQueries({ queryKey: reviewKeys.all }),
      qc.invalidateQueries({ queryKey: dashboardKeys.all }),
    ]);
}

export function useSaveReviewReply() {
  const invalidate = useInvalidateReviews();
  return useMutation({
    mutationFn: ({ id, content }: { id: number; content: string }) => reviewApi.saveReply(id, content),
    onSuccess: invalidate,
  });
}

export function useDeleteReviewReply() {
  const invalidate = useInvalidateReviews();
  return useMutation({
    mutationFn: (id: number) => reviewApi.deleteReply(id),
    onSuccess: invalidate,
  });
}

export function useSetReviewVisibility() {
  const invalidate = useInvalidateReviews();
  return useMutation({
    mutationFn: ({ id, ...data }: SetReviewVisibilityInput & { id: number }) => reviewApi.setVisibility(id, data),
    onSuccess: invalidate,
  });
}
