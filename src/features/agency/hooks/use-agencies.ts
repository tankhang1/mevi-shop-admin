import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ListParams } from "@/types/api";
import { agencyApi } from "../api/agency.api";
import type { Agency, AgencyInput, CommissionListParams } from "../types";

export const agencyKeys = {
  all: ["agencies"] as const,
  list: (params: ListParams) => [...agencyKeys.all, "list", params] as const,
  detail: (id: string) => [...agencyKeys.all, "detail", id] as const,
  commissions: (id: string, params: CommissionListParams) => [...agencyKeys.all, "commissions", id, params] as const,
};

export function useAgencies(params: ListParams = {}) {
  return useQuery({
    queryKey: agencyKeys.list(params),
    queryFn: () => agencyApi.list(params),
    placeholderData: keepPreviousData,
  });
}

export function useAgency(id: string | undefined) {
  return useQuery({
    queryKey: agencyKeys.detail(id ?? ""),
    queryFn: () => agencyApi.get(id!),
    enabled: !!id,
  });
}

export function useCreateAgency() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: AgencyInput) => agencyApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: agencyKeys.all }),
  });
}

export function useUpdateAgency() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Agency> }) => agencyApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: agencyKeys.all }),
  });
}

export function useDeleteAgency() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => agencyApi.remove(id),
    onSuccess: (_, id) => {
      qc.removeQueries({ queryKey: agencyKeys.detail(id) });
      return qc.invalidateQueries({ queryKey: agencyKeys.all });
    },
  });
}

export function useAgencyCommissions(id: string | undefined, params: CommissionListParams = {}) {
  return useQuery({
    queryKey: agencyKeys.commissions(id ?? "", params),
    queryFn: () => agencyApi.commissions(id!, params),
    enabled: !!id,
    placeholderData: keepPreviousData,
  });
}

export function usePayoutCommissions() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, orderIds }: { id: string; orderIds: string[] }) => agencyApi.payout(id, orderIds),
    onSuccess: () => qc.invalidateQueries({ queryKey: agencyKeys.all }),
  });
}
