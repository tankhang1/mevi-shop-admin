import type { CommissionStatus } from "./types";

export const DEFAULT_COMMISSION_RATE = 10;

export const COMMISSION_STATUS: Record<CommissionStatus, { label: string; className: string }> = {
  pending: { label: "Chờ đối soát", className: "bg-amber-100 text-amber-800" },
  payable: { label: "Cần thanh toán", className: "bg-sky-100 text-sky-800" },
  paid: { label: "Đã chi trả", className: "bg-emerald-100 text-emerald-800" },
  void: { label: "Huỷ", className: "bg-slate-200 text-slate-600" },
};
