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
