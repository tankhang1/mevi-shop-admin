import axios from "axios";
import type { FieldValues, Path, UseFormSetError } from "react-hook-form";
import type { ApiErrorResponse } from "@/types/api";

export const API_VALIDATION_MESSAGES: Record<string, string> = {
  "api.message.validation.required": "Bắt buộc",
  "api.message.validation.invalidFormat": "Sai định dạng",
  "api.message.validation.outOfRange": "Ngoài giới hạn cho phép",
  "api.message.validation.invalid": "Không hợp lệ",
  "api.message.validation.duplicate": "Đã được sử dụng trên hệ thống",
  "api.message.validation.notFound": "Không tồn tại",
  "api.message.validation.inactive": "Đã ngưng hoạt động",
};

/** Reason key → Vietnamese message */
export function fieldErrorMessage(reason: string) {
  return API_VALIDATION_MESSAGES[reason] ?? reason;
}

/** `fieldErrors` of a 400 response, e.g. `{ "phoneNumber": "api.message.validation.duplicate" }` */
export function getFieldErrors(error: unknown): Record<string, string> {
  if (!axios.isAxiosError(error) || error.response?.status !== 400) return {};
  return (error.response.data as ApiErrorResponse | undefined)?.fieldErrors ?? {};
}

/**
 * Backend `fieldErrors` → react-hook-form paths (`variants[1].sku` → `variants.1.sku`).
 * Returns how many were applied, so the caller can fall back to a toast when 0.
 */
export function applyFieldErrors<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
) {
  const entries = Object.entries(getFieldErrors(error));
  entries.forEach(([path, reason]) => {
    setError(path.replace(/\[(\d+)\]/g, ".$1") as Path<T>, {
      type: "server",
      message: fieldErrorMessage(reason),
    });
  });
  return entries.length;
}

/** Human-readable message from an axios / thrown error */
export function getErrorMessage(error: unknown, fallback = "Đã có lỗi xảy ra") {
  if (axios.isAxiosError(error)) {
    const msg = (error.response?.data as { message?: string } | undefined)?.message;
    return msg || error.message || fallback;
  }
  return error instanceof Error ? error.message : fallback;
}
