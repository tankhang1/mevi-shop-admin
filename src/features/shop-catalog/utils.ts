import axios from "axios";
import type { ApiErrorResponse } from "@/types/api";
import { SELL_UNIT_SHORT } from "./constants";
import type { BaseUnit } from "./types/enums";

/** `fieldErrors` of a 400 response, e.g. `{ "variants[1].sku": "api.message.validation.duplicate" }` */
export function getFieldErrors(error: unknown): Record<string, string> {
  if (!axios.isAxiosError(error) || error.response?.status !== 400) return {};
  return (error.response.data as ApiErrorResponse | undefined)?.fieldErrors ?? {};
}

/** 503 = storefront not updated, change was NOT saved — show a retry */
export const isStorefrontSyncError = (error: unknown) => axios.isAxiosError(error) && error.response?.status === 503;

/** FE product URL: `/products/<handle>-i.<id>` */
export const productPath = (p: { handle: string; id: number }) => `/products/${p.handle}-i.${p.id}`;

/** 409 — e.g. deleting a category that still has products, or a stock movement no longer PENDING */
export const isConflictError = (error: unknown) => axios.isAxiosError(error) && error.response?.status === 409;

const REASON_LABEL: Record<string, string> = {
  "api.message.validation.required": "Bắt buộc",
  "api.message.validation.invalidFormat": "Sai định dạng",
  "api.message.validation.outOfRange": "Ngoài giới hạn cho phép",
  "api.message.validation.invalid": "Không hợp lệ",
  "api.message.validation.duplicate": "Đã được sử dụng",
  "api.message.validation.notFound": "Không tồn tại",
  "api.message.validation.inactive": "Đã ngưng hoạt động",
};

/** Reason key → Vietnamese message */
export const fieldErrorMessage = (reason: string) => REASON_LABEL[reason] ?? reason;

/**
 * Backend `fieldErrors` → react-hook-form paths (`variants[1].sku` → `variants.1.sku`).
 * Returns how many were applied, so the caller can fall back to a toast when 0.
 */
export function applyFieldErrors(
  error: unknown,
  setError: (name: never, e: { message: string }) => void,
  /** Rename a backend path to the form's own field (optionally with a clearer message) */
  alias?: (path: string, reason: string) => string | { path: string; message: string },
) {
  const entries = Object.entries(getFieldErrors(error));
  entries.forEach(([path, reason]) => {
    const a = alias?.(path, reason) ?? path;
    const target = typeof a === "string" ? { path: a, message: fieldErrorMessage(reason) } : a;
    setError(target.path.replace(/\[(\d+)\]/g, ".$1") as never, { message: target.message });
  });
  return entries.length;
}

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
