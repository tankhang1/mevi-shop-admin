import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { partnerApi } from "../api/partner.api";
import type {
  CreatePayoutInput,
  CreateShopPartnerUserInput,
  GetPartnerReportParams,
  ListPartnerContactRequestsParams,
  ListPartnerProfilesParams,
  ResetUserPasswordInput,
  UnifiedCreatePartnerInput,
  UpdateCommissionRateInput,
  UpdateContactRequestStatusInput,
  UpdatePartnerSuspensionInput,
  UpdatePartnerTypeInput,
  UpdatePartnerVerificationInput,
} from "../types";

export const partnerKeys = {
  all: ["partner"] as const,
  contactRequests: () => [...partnerKeys.all, "contact-requests"] as const,
  contactStatusCounts: (keyword?: string) =>
    [...partnerKeys.contactRequests(), "status-counts", keyword ?? ""] as const,
  contactRequestList: (params?: ListPartnerContactRequestsParams) =>
    [...partnerKeys.contactRequests(), "list", params ?? {}] as const,
  contactRequestDetail: (id: number | string) =>
    [...partnerKeys.contactRequests(), "detail", String(id)] as const,
  profiles: () => [...partnerKeys.all, "profiles"] as const,
  profileList: (params?: ListPartnerProfilesParams) =>
    [...partnerKeys.profiles(), "list", params ?? {}] as const,
  profileDetail: (id: number | string) =>
    [...partnerKeys.profiles(), "detail", String(id)] as const,
  orderStats: (id: number | string) =>
    [...partnerKeys.profiles(), "order-stats", String(id)] as const,
  commissionSummary: (id: number | string) =>
    [...partnerKeys.profiles(), "commission-summary", String(id)] as const,
  commissionPayouts: (id: number | string, params?: { page?: number; size?: number }) =>
    [...partnerKeys.profiles(), "commission-payouts", String(id), params ?? {}] as const,
  report: (id: number | string, params?: GetPartnerReportParams) =>
    [...partnerKeys.profiles(), "report", String(id), params ?? {}] as const,
};

// ── Contact Requests Hooks ──

export function usePartnerContactStatusCounts(keyword?: string) {
  return useQuery({
    queryKey: partnerKeys.contactStatusCounts(keyword),
    queryFn: () => partnerApi.getContactStatusCounts(keyword),
    placeholderData: (prev) => prev,
  });
}

export function usePartnerContactRequests(
  params?: ListPartnerContactRequestsParams,
) {
  return useQuery({
    queryKey: partnerKeys.contactRequestList(params),
    queryFn: () => partnerApi.getContactRequests(params),
    placeholderData: (prev) => prev,
  });
}

export function usePartnerContactRequestDetail(
  id: number | string | undefined,
) {
  return useQuery({
    queryKey: partnerKeys.contactRequestDetail(id ?? ""),
    queryFn: () => partnerApi.getContactRequestById(id!),
    enabled: Boolean(id),
  });
}

export function useUpdateContactRequestStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: number | string;
      input: UpdateContactRequestStatusInput;
    }) => partnerApi.updateContactRequestStatus(id, input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: partnerKeys.contactRequests(),
      });
      queryClient.invalidateQueries({
        queryKey: partnerKeys.contactRequestDetail(variables.id),
      });
    },
  });
}

export function useCreateShopPartnerUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateShopPartnerUserInput) =>
      partnerApi.createShopPartnerUser(input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: partnerKeys.contactRequests(),
      });
      queryClient.invalidateQueries({ queryKey: partnerKeys.profiles() });
    },
  });
}

export function useCreateUnifiedPartner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UnifiedCreatePartnerInput) =>
      partnerApi.createUnifiedPartner(input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: partnerKeys.contactRequests(),
      });
      queryClient.invalidateQueries({ queryKey: partnerKeys.profiles() });
    },
  });
}

export function useResetUserPassword() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ResetUserPasswordInput) =>
      partnerApi.resetUserPassword(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: partnerKeys.profiles() });
    },
  });
}

// ── Partner Profiles Hooks (Admin) ──

export function usePartnerProfiles(params?: ListPartnerProfilesParams) {
  return useQuery({
    queryKey: partnerKeys.profileList(params),
    queryFn: () => partnerApi.getProfiles(params),
    placeholderData: (prev) => prev,
  });
}

export function usePartnerProfileDetail(id: number | string | undefined) {
  return useQuery({
    queryKey: partnerKeys.profileDetail(id ?? ""),
    queryFn: () => partnerApi.getProfileById(id!),
    enabled: Boolean(id),
  });
}

export function useUpdatePartnerType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: number | string;
      input: UpdatePartnerTypeInput;
    }) => partnerApi.updatePartnerType(id, input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: partnerKeys.profiles() });
      queryClient.invalidateQueries({
        queryKey: partnerKeys.profileDetail(variables.id),
      });
    },
  });
}

export function useUpdatePartnerSuspension() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: number | string;
      input: UpdatePartnerSuspensionInput;
    }) => partnerApi.updateSuspension(id, input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: partnerKeys.profiles() });
      queryClient.invalidateQueries({
        queryKey: partnerKeys.profileDetail(variables.id),
      });
    },
  });
}

export function useUpdatePartnerVerification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: number | string;
      input: UpdatePartnerVerificationInput;
    }) => partnerApi.updateVerification(id, input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: partnerKeys.profiles() });
      queryClient.invalidateQueries({
        queryKey: partnerKeys.profileDetail(variables.id),
      });
    },
  });
}

// ── Hoa hồng, Thống kê & Báo cáo Hooks (Mục 13) ──

export function usePartnerOrderStats(id: number | string | undefined) {
  return useQuery({
    queryKey: partnerKeys.orderStats(id ?? ""),
    queryFn: () => partnerApi.getOrderStats(id!),
    enabled: Boolean(id),
  });
}

export function usePartnerCommissionSummary(id: number | string | undefined) {
  return useQuery({
    queryKey: partnerKeys.commissionSummary(id ?? ""),
    queryFn: () => partnerApi.getCommissionSummary(id!),
    enabled: Boolean(id),
  });
}

export function usePartnerCommissionPayouts(
  id: number | string | undefined,
  params?: { page?: number; size?: number },
) {
  return useQuery({
    queryKey: partnerKeys.commissionPayouts(id ?? "", params),
    queryFn: () => partnerApi.getCommissionPayouts(id!, params),
    enabled: Boolean(id),
  });
}

export function useUpdatePartnerCommissionRate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: number | string;
      input: UpdateCommissionRateInput;
    }) => partnerApi.updateCommissionRate(id, input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: partnerKeys.profileDetail(variables.id),
      });
      queryClient.invalidateQueries({
        queryKey: partnerKeys.commissionSummary(variables.id),
      });
      queryClient.invalidateQueries({
        queryKey: partnerKeys.profiles(),
      });
      queryClient.invalidateQueries({
        queryKey: ["agencies"],
      });
    },
  });
}

export function useCreatePartnerCommissionPayout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: number | string;
      input?: CreatePayoutInput;
    }) => partnerApi.createCommissionPayout(id, input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: partnerKeys.commissionSummary(variables.id),
      });
      queryClient.invalidateQueries({
        queryKey: partnerKeys.commissionPayouts(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

export function usePartnerReport(
  id: number | string | undefined,
  params?: GetPartnerReportParams,
) {
  return useQuery({
    queryKey: partnerKeys.report(id ?? "", params),
    queryFn: () => partnerApi.getReport(id!, params),
    enabled: Boolean(id),
  });
}


