import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { dashboardKeys } from "@/features/dashboard/hooks/use-dashboard";
import { reviewApi } from "../api/review.api";
import type { ReviewListParams } from "../types";

export const reviewKeys = {
  all: ["reviews"] as const,
  list: (params: ReviewListParams) => [...reviewKeys.all, "list", params] as const,
  stats: (productId?: string) => [...reviewKeys.all, "stats", productId ?? "all"] as const,
};

export function useReviews(params: ReviewListParams = {}) {
  return useQuery({
    queryKey: reviewKeys.list(params),
    queryFn: () => reviewApi.list(params),
    placeholderData: keepPreviousData,
  });
}

export function useReviewStats(productId?: string) {
  return useQuery({ queryKey: reviewKeys.stats(productId), queryFn: () => reviewApi.stats({ productId }) });
}

function useInvalidateReviews() {
  const qc = useQueryClient();
  return () =>
    Promise.all([
      qc.invalidateQueries({ queryKey: reviewKeys.all }),
      qc.invalidateQueries({ queryKey: dashboardKeys.all }),
    ]);
}

export function useReplyReview() {
  const invalidate = useInvalidateReviews();
  return useMutation({
    mutationFn: ({ id, content }: { id: string; content: string }) => reviewApi.reply(id, content),
    onSuccess: invalidate,
  });
}

export function useSetReviewHidden() {
  const invalidate = useInvalidateReviews();
  return useMutation({
    mutationFn: ({ id, hidden }: { id: string; hidden: boolean }) => reviewApi.setHidden(id, hidden),
    onSuccess: invalidate,
  });
}
