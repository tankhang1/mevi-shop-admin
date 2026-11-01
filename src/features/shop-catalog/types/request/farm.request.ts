import type { PageParams } from "@/types/api";

export type FarmZoneGroupListParams = PageParams;

export interface FarmZoneListParams {
  workspaceId: number;
  page?: number;
  size?: number;
}
