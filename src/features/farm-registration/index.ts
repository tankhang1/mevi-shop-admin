import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import { apiClient } from "@/lib/axios";
import type { ApiResponse, Paginated } from "@/types/api";
import type {
  ApproveRegistrationInput,
  FarmRegistration,
  RegistrationListParams,
  RegistrationStats,
  RegistrationStatus,
} from "./types";

export type * from "./types";

const EP = API_ENDPOINTS.admin.farmRegistrations;

export const REGISTRATION_STATUS: Record<RegistrationStatus, { label: string; className: string }> = {
  pending: { label: "Chờ duyệt", className: "bg-amber-100 text-amber-800" },
  approved: { label: "Đã duyệt", className: "bg-emerald-100 text-emerald-800" },
  rejected: { label: "Từ chối", className: "bg-red-100 text-red-700" },
};

export const farmRegistrationApi = {
  list: async (params: RegistrationListParams) =>
    (await apiClient.get<ApiResponse<Paginated<FarmRegistration>>>(EP.base, { params })).data.data,
  stats: async () => (await apiClient.get<ApiResponse<RegistrationStats>>(EP.stats)).data.data,
  approve: async (id: string, data: ApproveRegistrationInput) =>
    (await apiClient.post<ApiResponse<FarmRegistration>>(EP.approve(id), data)).data.data,
  reject: async (id: string, reason: string) =>
    (await apiClient.post<ApiResponse<FarmRegistration>>(EP.reject(id), { reason })).data.data,
};

const keys = {
  all: ["farm-registrations"] as const,
  list: (p: RegistrationListParams) => [...keys.all, "list", p] as const,
  stats: () => [...keys.all, "stats"] as const,
};

export function useFarmRegistrations(params: RegistrationListParams) {
  return useQuery({ queryKey: keys.list(params), queryFn: () => farmRegistrationApi.list(params), placeholderData: keepPreviousData });
}

export function useFarmRegistrationStats() {
  return useQuery({ queryKey: keys.stats(), queryFn: farmRegistrationApi.stats });
}

/** Approving creates a product + opening stock, so products and inventory refresh too */
function useInvalidate() {
  const qc = useQueryClient();
  return () =>
    Promise.all(
      [keys.all, ["products"], ["inventory"], ["product-groups"]].map((queryKey) => qc.invalidateQueries({ queryKey })),
    );
}

export function useApproveRegistration() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ApproveRegistrationInput }) => farmRegistrationApi.approve(id, data),
    onSuccess: invalidate,
  });
}

export function useRejectRegistration() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => farmRegistrationApi.reject(id, reason),
    onSuccess: invalidate,
  });
}
