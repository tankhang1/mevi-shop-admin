import axios from "axios";
import type { ApiErrorResponse } from "@/types/api";

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
export function applyFieldErrors(error: unknown, setError: (name: never, e: { message: string }) => void) {
  const entries = Object.entries(getFieldErrors(error));
  entries.forEach(([path, reason]) =>
    setError(path.replace(/\[(\d+)\]/g, ".$1") as never, { message: fieldErrorMessage(reason) }),
  );
  return entries.length;
}
