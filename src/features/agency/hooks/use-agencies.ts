import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ListParams } from "@/types/api";
import { agencyApi } from "../api/agency.api";
import type { Agency, AgencyInput } from "../types";

export const agencyKeys = {
  all: ["agencies"] as const,
  list: (params: ListParams) => [...agencyKeys.all, "list", params] as const,
};

export function useAgencies(params: ListParams = {}) {
  return useQuery({
    queryKey: agencyKeys.list(params),
    queryFn: () => agencyApi.list(params),
    placeholderData: keepPreviousData,
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
