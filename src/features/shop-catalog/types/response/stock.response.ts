import type { UserRef } from "@/types/api";
import type { StockMovementChannel, StockMovementSource, StockMovementStatus, StockMovementType } from "../enums";

export interface StockMovement {
  id: number;
  /** PTK-yyMMdd-HHmmssSSS */
  code: string;
  product: { id: number; code: string; title: string };
  /** `id` is null when the variant was deleted */
  variant: { id: number | null; title: string; sku: string };
  type: StockMovementType;
  source: StockMovementSource | null;
  channel: StockMovementChannel;
  productionZone: { id: number; name: string } | null;
  workspace: { id: number; name: string } | null;
  productionSubject: { id: number; name: string } | null;
  /** Signed */
  quantity: number;
  unitCost: number | null;
  note: string | null;
  status: StockMovementStatus;
  rejectReason: string | null;
  createdBy: UserRef | null;
  reviewedBy: UserRef | null;
  reviewedAt: string | null;
  cancelledBy: UserRef | null;
  cancelledAt: string | null;
  createdAt: string;
}

export interface StockMovementStatusCounts {
  pending: number;
  approved: number;
  rejected: number;
  cancelled: number;
  total: number;
}
