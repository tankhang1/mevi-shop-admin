import { API_ENDPOINTS } from "@/config/api-endpoints";
import { realApiClient } from "@/lib/axios";
import type { SpringPage } from "@/types/api";
import type { FarmSubject, FarmSubjectListParams, FarmSubjectVariant, FarmSubjectVariantListParams, FarmZone, FarmZoneGroup, FarmZoneGroupListParams, FarmZoneListParams } from "../types";

const EP = API_ENDPOINTS.admin.catalog;

export const farmPickerApi = {
  zoneGroups: async (params: FarmZoneGroupListParams) =>
    (await realApiClient.get<SpringPage<FarmZoneGroup>>(EP.farmZoneGroups, { params })).data,

  subjects: async (params: FarmSubjectListParams) =>
    (await realApiClient.get<SpringPage<FarmSubject>>(EP.farmSubjects, { params: { domainCode: "CROP", ...params } })).data,

  subjectVariants: async (params: FarmSubjectVariantListParams) =>
    (
      await realApiClient.get<SpringPage<FarmSubjectVariant>>(EP.farmSubjectVariants, {
        params: { domainCode: "CROP", page: 0, size: 100, ...params },
      })
    ).data,

  zones: async (params: FarmZoneListParams) =>
    (await realApiClient.get<SpringPage<FarmZone>>(EP.farmZones, { params })).data,
};
