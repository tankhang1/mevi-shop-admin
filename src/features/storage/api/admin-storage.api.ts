import { API_ENDPOINTS } from "@/config/api-endpoints";
import { realApiClient } from "@/lib/axios";

export interface StorageFileResponse {
  bucket: string;
  objectKey: string;
  fileUrl: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  etag?: string;
}

export const adminStorageApi = {
  /**
   * Upload file chung qua POST /api/admin/storage/files
   * Dùng namespace theo JWT subject, không cần header X-Workspace-Id
   */
  uploadFile: async (file: File, folder?: string): Promise<StorageFileResponse> => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await realApiClient.post<StorageFileResponse>(
      API_ENDPOINTS.admin.storage.files,
      formData,
      {
        params: folder ? { folder } : undefined,
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
    return res.data;
  },
};

