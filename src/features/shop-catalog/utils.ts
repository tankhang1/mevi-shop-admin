import axios from "axios";
import {
  applyFieldErrors,
  fieldErrorMessage,
  getFieldErrors,
} from "@/lib/api-error";

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
