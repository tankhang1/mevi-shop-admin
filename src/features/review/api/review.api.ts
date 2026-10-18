import { API_ENDPOINTS } from "@/config/api-endpoints";
import { apiClient } from "@/lib/axios";
import type { ApiResponse, Paginated } from "@/types/api";
import type { Review, ReviewListParams, ReviewStats } from "../types";

const EP = API_ENDPOINTS.admin.reviews;

export const reviewApi = {
  list: async (params: ReviewListParams) =>
    (await apiClient.get<ApiResponse<Paginated<Review>>>(EP.base, { params })).data.data,
  stats: async (params: Pick<ReviewListParams, "productId"> = {}) =>
    (await apiClient.get<ApiResponse<ReviewStats>>(EP.stats, { params })).data.data,
  /** Empty content removes the reply */
  reply: async (id: string, content: string) =>
    (await apiClient.put<ApiResponse<Review>>(EP.reply(id), { content })).data.data,
  setHidden: async (id: string, hidden: boolean) =>
    (await apiClient.patch<ApiResponse<Review>>(EP.visibility(id), { hidden })).data.data,
};
