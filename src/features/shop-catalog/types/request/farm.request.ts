import type { PageParams } from "@/types/api";

/** Only nông hộ having a vườn that fits the product's Cây trồng (+ Giống, when set) */
export type FarmZoneGroupListParams = PageParams & { productionSubjectId?: number; productionSubjectVariantId?: number };

export interface FarmSubjectListParams extends PageParams {
  /** Defaults to CROP in the api */
  domainCode?: string;
}

export interface FarmSubjectVariantListParams extends PageParams {
  domainCode?: string;
  subjectId: number;
}

/** `keyword` matches zone name/code, seed name and workspace name/code (phone 84… or 0… both work) */
export interface FarmZoneListParams {
  workspaceId: number;
  productionSubjectId?: number;
  /** Only when the product has a Giống */
  productionSubjectVariantId?: number;
  keyword?: string;
  page?: number;
  size?: number;
}
