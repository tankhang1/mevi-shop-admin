import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { farmPickerApi } from "../../api";
import type { FarmZoneGroupListParams, FarmZoneListParams } from "../../types";
import { catalogKeys } from "../query-keys";

export function useFarmZoneGroups(params: FarmZoneGroupListParams = {}) {
  return useQuery({
    queryKey: catalogKeys.zoneGroups(params),
    queryFn: () => farmPickerApi.zoneGroups(params),
    placeholderData: keepPreviousData,
  });
}

export function useFarmZones(workspaceId: number | undefined) {
  const params: FarmZoneListParams = { workspaceId: workspaceId ?? 0, page: 0, size: 100 };
  return useQuery({
    queryKey: catalogKeys.zones(params),
    queryFn: () => farmPickerApi.zones(params),
    enabled: !!workspaceId,
  });
}
