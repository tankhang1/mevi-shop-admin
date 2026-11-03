import axios from "axios";
import {
  applyFieldErrors,
  fieldErrorMessage,
  getFieldErrors,
} from "@/lib/api-error";
import { SELL_UNIT_SHORT } from "./constants";
import type { BaseUnit } from "./types/enums";

export { applyFieldErrors, fieldErrorMessage, getFieldErrors };

/** 503 = storefront not updated, change was NOT saved — show a retry */
export const isStorefrontSyncError = (error: unknown) =>
  axios.isAxiosError(error) && error.response?.status === 503;

/** FE product URL: `/products/<handle>-i.<id>` */
export const productPath = (p: { handle: string; id: number }) =>
  `/products/${p.handle}-i.${p.id}`;

/** 409 — e.g. deleting a category that still has products, or a stock movement no longer PENDING */
export const isConflictError = (error: unknown) =>
  axios.isAxiosError(error) && error.response?.status === 409;

/** "Bao 5kg" for quy cách, "Đơn vị tính (kg)" for đơn vị tính rows/phiếu */
export const stockItemLabel = (x: { variant: { title: string } | null; baseUnit?: BaseUnit | null; unit?: { unit: BaseUnit } | null }) =>
  x.variant?.title ?? `Đơn vị tính (${(x.baseUnit ?? x.unit?.unit) ? SELL_UNIT_SHORT[(x.baseUnit ?? x.unit?.unit)!] : "—"})`;

/**
 * Product form ↔ backend: `baseUnit` is the form's `sellingUnit`. "required" = no selling mode picked;
 * "invalid" while đơn vị tính is off = BE refused removing it (unit stock ≠ 0) — shown on the mode cards.
 */
export const productFieldAlias =
  (sellByUnit: boolean) =>
  (path: string, reason: string): string | { path: string; message: string } => {
    if (path !== "baseUnit") return path;
    if (reason.endsWith(".required")) return "sellByUnit";
    if (reason.endsWith(".invalid"))
      return {
        path: sellByUnit ? "sellingUnit" : "sellByUnit",
        message: "Chỉ đổi / bỏ đơn vị tính khi tồn kho đơn vị tính bằng 0 (nông sản chỉ được kg hoặc lít)",
      };
    return "sellingUnit";
  };

/** Per-what label for prices/quantities: "kg" for đơn vị tính, quy cách title otherwise */
export const stockPerLabel = (x: { variant: { title: string } | null; baseUnit?: BaseUnit | null }) =>
  x.baseUnit ? SELL_UNIT_SHORT[x.baseUnit] : (x.variant?.title ?? "—");
