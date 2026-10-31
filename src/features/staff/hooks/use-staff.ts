import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { dispatchTeamKeys } from "@/features/dispatch-team/hooks/use-dispatch-teams";
import { staffApi } from "../api/staff.api";
import type { StaffInput, StaffListParams, StaffStatus } from "../types";

export const staffKeys = {
  all: ["staff"] as const,
  list: (params: StaffListParams) => [...staffKeys.all, "list", params] as const,
};

export function useStaffList(params: StaffListParams = {}) {
  return useQuery({
    queryKey: staffKeys.list(params),
    queryFn: () => staffApi.list(params),
    placeholderData: keepPreviousData,
  });
}

function useInvalidateStaff() {
  const qc = useQueryClient();
  // Team membership lives on the team too
  return () =>
    Promise.all([
      qc.invalidateQueries({ queryKey: staffKeys.all }),
      qc.invalidateQueries({ queryKey: dispatchTeamKeys.all }),
    ]);
}

export function useCreateStaff() {
  const invalidate = useInvalidateStaff();
  return useMutation({ mutationFn: (data: StaffInput) => staffApi.create(data), onSuccess: invalidate });
}

export function useUpdateStaff() {
  const invalidate = useInvalidateStaff();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<StaffInput> & { status?: StaffStatus } }) =>
      staffApi.update(id, data),
    onSuccess: invalidate,
  });
}

export function useDeleteStaff() {
  const invalidate = useInvalidateStaff();
  return useMutation({ mutationFn: (id: string) => staffApi.remove(id), onSuccess: invalidate });
}

export function useResendInvite() {
  const invalidate = useInvalidateStaff();
  return useMutation({ mutationFn: (id: string) => staffApi.resendInvite(id), onSuccess: invalidate });
}
