import { API_ENDPOINTS } from "@/config/api-endpoints";
import { realApiClient } from "@/lib/axios";
import type { SpringPage } from "@/types/api";
import type {
  CreateShopPartnerUserInput,
  ListPartnerContactRequestsParams,
  ListPartnerProfilesParams,
  PartnerContactRequest,
  PartnerProfile,
  PartnerProfileDetail,
  UpdateContactRequestStatusInput,
  UpdatePartnerSuspensionInput,
  UpdatePartnerTypeInput,
  UpdatePartnerVerificationInput,
} from "../types";

const CONTACT_EP = API_ENDPOINTS.admin.partnerContactRequests;
const PROFILE_EP = API_ENDPOINTS.admin.partnerProfiles;
const USERS_EP = API_ENDPOINTS.admin.users;

export const partnerApi = {
  // ── Yêu cầu liên hệ hợp tác ──
  getContactRequests: async (params?: ListPartnerContactRequestsParams) => {
    const res = await realApiClient.get<SpringPage<PartnerContactRequest>>(
      CONTACT_EP.base,
      { params },
    );
    return res.data;
  },

  getContactRequestById: async (id: number | string) => {
    const res = await realApiClient.get<PartnerContactRequest>(
      CONTACT_EP.detail(id),
    );
    return res.data;
  },

  updateContactRequestStatus: async (
    id: number | string,
    input: UpdateContactRequestStatusInput,
  ) => {
    const res = await realApiClient.put<PartnerContactRequest>(
      CONTACT_EP.status(id),
      input,
    );
    return res.data;
  },

  createShopPartnerUser: async (input: CreateShopPartnerUserInput) => {
    const res = await realApiClient.post(USERS_EP.shopPartners, input);
    return res.data;
  },

  // ── Hồ sơ đối tác & Gian hàng (Admin) ──
  getProfiles: async (params?: ListPartnerProfilesParams) => {
    const res = await realApiClient.get<SpringPage<PartnerProfile>>(
      PROFILE_EP.base,
      { params },
    );
    return res.data;
  },

  getProfileById: async (id: number | string) => {
    const res = await realApiClient.get<PartnerProfileDetail>(
      PROFILE_EP.detail(id),
    );
    return res.data;
  },

  updatePartnerType: async (
    id: number | string,
    input: UpdatePartnerTypeInput,
  ) => {
    const res = await realApiClient.put<PartnerProfile>(
      PROFILE_EP.partnerType(id),
      input,
    );
    return res.data;
  },

  updateSuspension: async (
    id: number | string,
    input: UpdatePartnerSuspensionInput,
  ) => {
    const res = await realApiClient.put<PartnerProfile>(
      PROFILE_EP.suspension(id),
      input,
    );
    return res.data;
  },

  updateVerification: async (
    id: number | string,
    input: UpdatePartnerVerificationInput,
  ) => {
    const res = await realApiClient.put<PartnerProfile>(
      PROFILE_EP.verification(id),
      input,
    );
    return res.data;
  },

  syncPublicStorefront: async (id: number | string) => {
    const res = await realApiClient.post(PROFILE_EP.sync(id));
    return res.data;
  },
};
