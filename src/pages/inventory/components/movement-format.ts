import type { StockMovement } from "@/features/shop-catalog";

/** API timestamps are UTC — always show them in Vietnam time */
const dt = new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short", timeZone: "Asia/Ho_Chi_Minh" });
export const formatVnDateTime = (iso: string | null | undefined) => (iso ? dt.format(new Date(iso)) : "—");

/** "Mevi" / "Vườn · Nông hộ" / "—" (điều chỉnh) */
export const movementSourceLabel = (m: StockMovement) =>
  m.source === "MEVI"
    ? "Mevi"
    : m.source === "FARM"
      ? [m.productionZone?.name, m.workspace?.name].filter(Boolean).join(" · ") || "Nông hộ"
      : "—";

export const userName = (u: StockMovement["createdBy"]) => u?.fullName ?? (u ? `#${u.id}` : "—");
