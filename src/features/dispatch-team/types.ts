import type { ListParams } from "@/types/api";

/** A group of staff that handles the orders of the product groups it owns */
export interface DispatchTeam {
  id: string;
  shopId: string;
  shopName?: string;
  name: string;
  description?: string;
  /** Staff id of the team lead — must also be a member */
  leaderId?: string | null;
  memberIds: string[];
  /** Product groups this team handles — each group belongs to at most one team */
  productGroupIds: string[];
  /** Round-robin pointer: index in memberIds of the next member to receive an order */
  nextMemberIndex?: number;
  active: boolean;
  createdAt: string;
}

/** List rows join names and workload */
export interface DispatchTeamRow extends DispatchTeam {
  members: { id: string; name: string }[];
  productGroups: { id: string; name: string }[];
  /** Assigned orders that are not completed / cancelled */
  openOrders: number;
}

export type DispatchTeamInput = Pick<DispatchTeam, "name" | "description" | "leaderId" | "memberIds" | "productGroupIds"> & {
  shopId?: string;
  active?: boolean;
};

export interface DispatchTeamListParams extends ListParams {
  shopId?: string;
}
