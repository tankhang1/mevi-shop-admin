import type { ListParams } from "@/types/api";

/** A group of staff that handles a share of the shop's orders, usually split by delivery area */
export interface DispatchTeam {
  id: string;
  shopId: string;
  shopName?: string;
  name: string;
  description?: string;
  /** Staff id of the team lead — must also be a member */
  leaderId?: string | null;
  memberIds: string[];
  /** Matched case-insensitively against the order address, e.g. "TP.HCM", "Cần Thơ" */
  regions: string[];
  active: boolean;
  createdAt: string;
}

/** List rows join names and workload */
export interface DispatchTeamRow extends DispatchTeam {
  members: { id: string; name: string }[];
  /** Assigned orders that are not completed / cancelled */
  openOrders: number;
}

export type DispatchTeamInput = Pick<DispatchTeam, "name" | "description" | "leaderId" | "memberIds" | "regions"> & {
  shopId?: string;
  active?: boolean;
};

export interface DispatchTeamListParams extends ListParams {
  shopId?: string;
}
