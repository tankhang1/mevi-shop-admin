import { API_ENDPOINTS } from "@/config/api-endpoints";
import { apiClient } from "@/lib/axios";
import type { SpringPage } from "@/types/api";
import type { FarmZone, FarmZoneGroup, FarmZoneGroupListParams, FarmZoneListParams } from "../types";

const EP = API_ENDPOINTS.admin.catalog;

export const farmPickerApi = {
  zoneGroups: async (params: FarmZoneGroupListParams) =>
    (await apiClient.get<SpringPage<FarmZoneGroup>>(EP.farmZoneGroups, { params })).data,

  zones: async (params: FarmZoneListParams) =>
    (await apiClient.get<SpringPage<FarmZone>>(EP.farmZones, { params })).data,
};
