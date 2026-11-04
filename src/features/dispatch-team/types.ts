import type { ListParams } from "@/types/api";

export interface DispatchMember {
  id: string;
  name: string;
  fullName?: string;
}

export interface DispatchCategory {
  id: number | string;
  name: string;
}

/** Nhóm điều phối xử lý đơn theo danh mục sản phẩm (BE notice 2026-11-03) */
export interface DispatchTeam {
  id: string;
  name: string;
  code?: string;
  description?: string;
  leaderId?: string | null;
  memberIds: string[];
  categories: string[];
  categoryIds?: number[];
  nextMemberIndex?: number;
  active: boolean;
  createdAt: string;
  updatedAt?: string;

  // New spec fields
  leader?: DispatchMember | null;
  members?: DispatchMember[];
  memberCount?: number;
  categoryObjects?: DispatchCategory[];
  processingCount?: number;
  openOrders?: number;
}

/** List row joins names and workload */
export interface DispatchTeamRow extends DispatchTeam {
  members: DispatchMember[];
  openOrders: number;
}

export interface DispatchTeamInput {
  name: string;
  description?: string;
  active?: boolean;
  memberUserIds?: (number | string)[];
  leaderUserId?: number | string | null;
  categoryIds?: (number | string)[];

  // Compatibility aliases
  memberIds?: string[];
  leaderId?: string | null;
  categories?: string[];
}

export interface AssignOrdersResult {
  assigned: number;
  remaining: number;
  unmatched?: number;
}

export interface DispatchTeamListParams extends ListParams {
  keyword?: string;
}
