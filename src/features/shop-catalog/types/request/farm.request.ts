import type { PageParams } from "@/types/api";

/** `productionSubjectId`: only nông hộ having a vườn growing that cây trồng */
export type FarmZoneGroupListParams = PageParams & { productionSubjectId?: number };

export type FarmSubjectListParams = PageParams;

/** `keyword` matches zone name/code, seed name and workspace name/code (phone 84… or 0… both work) */
export interface FarmZoneListParams {
  workspaceId: number;
  productionSubjectId?: number;
  keyword?: string;
  page?: number;
  size?: number;
}
