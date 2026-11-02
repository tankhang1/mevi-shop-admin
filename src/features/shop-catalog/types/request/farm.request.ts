import type { PageParams } from "@/types/api";

export type FarmZoneGroupListParams = PageParams;

/** `keyword` matches zone name/code, seed name and workspace name/code (phone 84… or 0… both work) */
export interface FarmZoneListParams {
  workspaceId: number;
  keyword?: string;
  page?: number;
  size?: number;
}
