import { API_ENDPOINTS } from "@/config/api-endpoints";
import { realApiClient } from "@/lib/axios";
import type { ProductMediaInput, ProductPhotoUpload, UploadProductPhotoInput } from "../types";

export const PRODUCT_PHOTO_ACCEPT = ["image/jpeg", "image/png", "image/webp"] as const;
export const PRODUCT_PHOTO_MAX_BYTES = 20 * 1024 * 1024;

/** Same checks the backend does (→ 400) — returns an error message or null */
export function validateProductPhoto(file: File): string | null {
  if (!file.size) return "File rỗng";
  if (!(PRODUCT_PHOTO_ACCEPT as readonly string[]).includes(file.type)) return "Chỉ nhận ảnh JPEG, PNG hoặc WebP";
  if (file.size > PRODUCT_PHOTO_MAX_BYTES) return "Ảnh tối đa 20 MB";
  return null;
}

export const productPhotoApi = {
  /** POST /api/storage/product-photos — 201 with the main image + a 400×400 thumbnail */
  upload: async ({ file, format = "WEBP", workspaceId, onProgress, signal }: UploadProductPhotoInput) => {
    const body = new FormData();
    body.append("file", file);
    return (
      await realApiClient.post<ProductPhotoUpload>(API_ENDPOINTS.admin.catalog.productPhotos, body, {
        params: { format },
        headers: {
          "Content-Type": "multipart/form-data",
          ...(workspaceId != null && { "X-Workspace-Id": String(workspaceId) }),
        },
        signal,
        onUploadProgress: onProgress && ((e) => e.total && onProgress(Math.round((e.loaded / e.total) * 100))),
      })
    ).data;
  },
};

/** Upload response → product `media[]` item */
export const toProductMedia = (res: ProductPhotoUpload, extra?: Pick<ProductMediaInput, "altText" | "cover">) => ({
  url: res.fileUrl,
  thumbnailUrl: res.thumbnail?.fileUrl ?? null,
  ...extra,
}) satisfies ProductMediaInput;
