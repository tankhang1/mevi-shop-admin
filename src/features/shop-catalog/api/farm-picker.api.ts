import { API_ENDPOINTS } from "@/config/api-endpoints";
import { realApiClient } from "@/lib/axios";
import type { SpringPage } from "@/types/api";
import type { FarmSubject, FarmSubjectListParams, FarmZone, FarmZoneGroup, FarmZoneGroupListParams, FarmZoneListParams } from "../types";

const EP = API_ENDPOINTS.admin.catalog;

export const farmPickerApi = {
  zoneGroups: async (params: FarmZoneGroupListParams) =>
    (await realApiClient.get<SpringPage<FarmZoneGroup>>(EP.farmZoneGroups, { params })).data,

  subjects: async (params: FarmSubjectListParams) =>
    (await realApiClient.get<SpringPage<FarmSubject>>(EP.farmSubjects, { params })).data,

  zones: async (params: FarmZoneListParams) =>
    (await realApiClient.get<SpringPage<FarmZone>>(EP.farmZones, { params })).data,
};
