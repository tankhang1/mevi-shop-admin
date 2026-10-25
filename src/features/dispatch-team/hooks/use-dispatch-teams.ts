import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { orderKeys } from "@/features/order/hooks/use-orders";
import { dispatchTeamApi } from "../api/dispatch-team.api";
import type { DispatchTeamInput, DispatchTeamListParams } from "../types";

export const dispatchTeamKeys = {
  all: ["dispatch-teams"] as const,
  list: (params: DispatchTeamListParams) => [...dispatchTeamKeys.all, "list", params] as const,
};

export function useDispatchTeams(params: DispatchTeamListParams = {}, enabled = true) {
  return useQuery({
    queryKey: dispatchTeamKeys.list(params),
    queryFn: () => dispatchTeamApi.list(params),
    placeholderData: keepPreviousData,
    enabled,
  });
}

/** Team changes also move orders between teams */
function useInvalidate() {
  const qc = useQueryClient();
  return () =>
    Promise.all([
      qc.invalidateQueries({ queryKey: dispatchTeamKeys.all }),
      qc.invalidateQueries({ queryKey: orderKeys.all }),
    ]);
}

export function useCreateDispatchTeam() {
  const invalidate = useInvalidate();
  return useMutation({ mutationFn: (data: DispatchTeamInput) => dispatchTeamApi.create(data), onSuccess: invalidate });
}

export function useUpdateDispatchTeam() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<DispatchTeamInput> }) => dispatchTeamApi.update(id, data),
    onSuccess: invalidate,
  });
}

export function useDeleteDispatchTeam() {
  const invalidate = useInvalidate();
  return useMutation({ mutationFn: (id: string) => dispatchTeamApi.remove(id), onSuccess: invalidate });
}

export function useAutoAssignOrders() {
  const invalidate = useInvalidate();
  return useMutation({ mutationFn: () => dispatchTeamApi.autoAssign(), onSuccess: invalidate });
}
