import type { ListParams } from "@/types/api";

/** A Mevi-wide group of staff that handles the orders of the product categories (danh mục) it owns — not tied to a shop */
export interface DispatchTeam {
  id: string;
  name: string;
  description?: string;
  /** Staff id of the team lead — must also be a member */
  leaderId?: string | null;
  memberIds: string[];
  /** Danh mục sản phẩm (PRODUCT_CATEGORIES) this team handles — each category belongs to at most one team */
  categories: string[];
  /** Round-robin pointer: index in memberIds of the next member to receive an order */
  nextMemberIndex?: number;
  active: boolean;
  createdAt: string;
}

/** List rows join names and workload */
export interface DispatchTeamRow extends DispatchTeam {
  members: { id: string; name: string }[];
  /** Assigned orders that are not completed / cancelled */
  openOrders: number;
}

export type DispatchTeamInput = Pick<DispatchTeam, "name" | "description" | "leaderId" | "memberIds" | "categories"> & {
  active?: boolean;
};

export type DispatchTeamListParams = ListParams;
