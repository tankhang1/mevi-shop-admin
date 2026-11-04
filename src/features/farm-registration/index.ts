import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import { realApiClient } from "@/lib/axios";
import type { ApiResponse, Paginated, SpringPage } from "@/types/api";
import type {
  ApproveRegistrationInput,
  FarmRegistration,
  RegistrationListParams,
  RegistrationStats,
  RegistrationStatus,
} from "./types";

export type * from "./types";

const EP = API_ENDPOINTS.admin.farmRegistrations;

export const REGISTRATION_STATUS: Record<
  RegistrationStatus,
  { label: string; className: string }
> = {
  pending: { label: "Chờ duyệt", className: "bg-amber-100 text-amber-800" },
  approved: { label: "Đã duyệt", className: "bg-emerald-100 text-emerald-800" },
  rejected: { label: "Từ chối", className: "bg-red-100 text-red-700" },
};

const unwrap = <T>(data: unknown): T => {
  if (
    data &&
    typeof data === "object" &&
    "data" in data &&
    (data as { data: unknown }).data !== undefined
  ) {
    return (data as { data: T }).data;
  }
  return data as T;
};

export const farmRegistrationApi = {
  list: async (
    params?: RegistrationListParams,
  ): Promise<Paginated<FarmRegistration>> => {
    const res = await realApiClient.get<
      | SpringPage<FarmRegistration>
      | ApiResponse<Paginated<FarmRegistration>>
      | Paginated<FarmRegistration>
    >(EP.base, { params });
    const raw = unwrap<
      SpringPage<FarmRegistration> | Paginated<FarmRegistration>
    >(res.data);
    if ("content" in raw && Array.isArray(raw.content)) {
      return {
        items: raw.content as FarmRegistration[],
        total: raw.totalElements ?? raw.content.length,
        page: raw.page ?? 0,
        size: raw.size ?? raw.content.length,
      };
    }
    if ("items" in raw && Array.isArray(raw.items)) {
      return raw as Paginated<FarmRegistration>;
    }
    return { items: [], total: 0, page: 0, size: 10 };
  },
  stats: async () => {
    const res = await realApiClient.get<
      RegistrationStats | ApiResponse<RegistrationStats>
    >(EP.stats);
    return unwrap<RegistrationStats>(res.data);
  },
  approve: async (id: string, data: ApproveRegistrationInput) => {
    const res = await realApiClient.post<
      FarmRegistration | ApiResponse<FarmRegistration>
    >(EP.approve(id), data);
    return unwrap<FarmRegistration>(res.data);
  },
  reject: async (id: string, reason: string) => {
    const res = await realApiClient.post<
      FarmRegistration | ApiResponse<FarmRegistration>
    >(EP.reject(id), { reason });
    return unwrap<FarmRegistration>(res.data);
  },
};

const keys = {
  all: ["farm-registrations"] as const,
  list: (p: RegistrationListParams) => [...keys.all, "list", p] as const,
  stats: () => [...keys.all, "stats"] as const,
};

export function useFarmRegistrations(params: RegistrationListParams) {
  return useQuery({
    queryKey: keys.list(params),
    queryFn: () => farmRegistrationApi.list(params),
    placeholderData: keepPreviousData,
  });
}

export function useFarmRegistrationStats() {
  return useQuery({
    queryKey: keys.stats(),
    queryFn: farmRegistrationApi.stats,
  });
}

/** Approving creates a product + opening stock, so products and inventory refresh too */
function useInvalidate() {
  const qc = useQueryClient();
  return () =>
    Promise.all(
      [keys.all, ["products"], ["inventory"], ["product-groups"]].map(
        (queryKey) => qc.invalidateQueries({ queryKey }),
      ),
    );
}

export function useApproveRegistration() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: ApproveRegistrationInput;
    }) => farmRegistrationApi.approve(id, data),
    onSuccess: invalidate,
  });
}

export function useRejectRegistration() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      farmRegistrationApi.reject(id, reason),
    onSuccess: invalidate,
  });
}
