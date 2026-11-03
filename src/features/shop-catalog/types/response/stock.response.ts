import type { UserRef } from "@/types/api";
import type { BaseUnit, StockMovementChannel, StockMovementSource, StockMovementStatus, StockMovementType } from "../enums";

export interface StockMovement {
  id: number;
  /** PTK-yyMMdd-HHmmssSSS */
  code: string;
  product: { id: number; code: string; title: string };
  /** null for phiếu theo đơn vị tính; `id` null when the variant was deleted */
  variant: { id: number | null; title: string; sku: string } | null;
  /** Unit at creation for phiếu theo đơn vị tính; null for quy cách */
  baseUnit: BaseUnit | null;
  type: StockMovementType;
  source: StockMovementSource | null;
  channel: StockMovementChannel;
  productionZone: { id: number; name: string } | null;
  workspace: { id: number; name: string } | null;
  productionSubject: { id: number; name: string } | null;
  /** Signed; may be fractional for đơn vị tính */
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
