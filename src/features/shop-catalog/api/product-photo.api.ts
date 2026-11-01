import { API_ENDPOINTS } from "@/config/api-endpoints";
import { realApiClient } from "@/lib/axios";
import type { PhotoFormat, ProductPhotoUpload } from "../types";

export const productPhotoApi = {
  upload: async (file: File, format: PhotoFormat = "WEBP") => {
    const body = new FormData();
    body.append("file", file);
    return (
      await realApiClient.post<ProductPhotoUpload>(API_ENDPOINTS.admin.catalog.productPhotos, body, {
        params: { format },
        headers: { "Content-Type": "multipart/form-data" },
      })
    ).data;
  },
};
