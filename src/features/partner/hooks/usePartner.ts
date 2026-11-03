import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { partnerApi } from "../api/partner.api";
import type {
  CreateShopPartnerUserInput,
  ListPartnerContactRequestsParams,
  ListPartnerProfilesParams,
  UpdateContactRequestStatusInput,
  UpdatePartnerSuspensionInput,
  UpdatePartnerTypeInput,
  UpdatePartnerVerificationInput,
} from "../types";

export const partnerKeys = {
  all: ["partner"] as const,
  contactRequests: () => [...partnerKeys.all, "contact-requests"] as const,
  contactRequestList: (params?: ListPartnerContactRequestsParams) =>
    [...partnerKeys.contactRequests(), "list", params ?? {}] as const,
  contactRequestDetail: (id: number | string) =>
    [...partnerKeys.contactRequests(), "detail", String(id)] as const,
  profiles: () => [...partnerKeys.all, "profiles"] as const,
  profileList: (params?: ListPartnerProfilesParams) =>
    [...partnerKeys.profiles(), "list", params ?? {}] as const,
  profileDetail: (id: number | string) =>
    [...partnerKeys.profiles(), "detail", String(id)] as const,
};

// ── Contact Requests Hooks ──

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

