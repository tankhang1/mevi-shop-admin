import { API_ENDPOINTS } from "@/config/api-endpoints";
import { realApiClient } from "@/lib/axios";
import type { SpringPage } from "@/types/api";
import type {
  ShopCustomer,
  ShopCustomerCreateInput,
  ShopCustomerListParams,
  ShopCustomerProfileInput,
  ShopCustomerSummary,
} from "../types";

const EP = API_ENDPOINTS.admin.shopCustomers;

/** Roles: MEVI_ADMIN, MEVI_SUPER_ADMIN, MEVI_SHOP_ADMIN. No X-Workspace-Id. */
export const shopCustomerApi = {
  summary: async () => (await realApiClient.get<ShopCustomerSummary>(EP.summary)).data,

  /** Newest first */
  list: async (params: ShopCustomerListParams = {}) =>
    (await realApiClient.get<SpringPage<ShopCustomer>>(EP.base, { params })).data,

  /** 400 invalid / unknown carrier · 409 phone exists · 502 identity system failed */
  create: async (data: ShopCustomerCreateInput) =>
    (await realApiClient.post<ShopCustomer>(EP.base, data)).data,

  /** Replaces all profile fields · 404 not a customer account */
  updateProfile: async (id: number, data: ShopCustomerProfileInput) =>
    (await realApiClient.put<ShopCustomer>(EP.profile(id), data)).data,
};
