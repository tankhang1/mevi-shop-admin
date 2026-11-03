import { useCallback, useRef } from "react";

export interface UseDeferredImageUploadOptions<TType extends string = string> {
  uploadFn: (type: TType, file: File) => Promise<string>;
}

/**
 * Hook hỗ trợ hoãn upload ảnh (defer upload) đến khi submit form
 * và cache lại kết quả upload theo thông tin file để không upload lại.
 */
export function useDeferredImageUpload<TType extends string = string>({
  uploadFn,
}: UseDeferredImageUploadOptions<TType>) {
  // Cache lưu kết quả upload: key -> uploadedUrl
  const cacheRef = useRef<Map<string, string>>(new Map());

  // Lưu các file đang chờ upload theo fieldKey
  const pendingFilesRef = useRef<Map<string, File>>(new Map());

  /** Ghi nhận hoặc xóa file chờ upload cho một trường */
  const setPendingFile = useCallback((fieldKey: string, file: File | null) => {
    if (!file) {
      pendingFilesRef.current.delete(fieldKey);
    } else {
      pendingFilesRef.current.set(fieldKey, file);
    }
  }, []);

  /**
   * Upload ảnh nếu có file mới được chọn, hoặc lấy từ cache nếu đã upload trước đó.
   * Nếu không có file mới được chọn, trả về currentUrl (ảnh cũ hoặc rỗng).
   */
  const uploadWithCache = useCallback(
    async (
      fieldKey: string,
      type: TType,
      currentUrl?: string,
    ): Promise<string> => {
      const file = pendingFilesRef.current.get(fieldKey);

      // Nếu không có file mới chờ upload, giữ nguyên URL hiện tại
      if (!file) {
        return currentUrl || "";
      }

      // Tạo cache key đơn giản dựa trên loại ảnh và thuộc tính của file
      const cacheKey = `${type}_${file.name}_${file.size}_${file.lastModified}`;

      if (cacheRef.current.has(cacheKey)) {
        return cacheRef.current.get(cacheKey)!;
      }

      // Chưa có trong cache -> gọi hàm upload thực tế
      const uploadedUrl = await uploadFn(type, file);
      cacheRef.current.set(cacheKey, uploadedUrl);
      return uploadedUrl;
    },
    [uploadFn],
  );

  /** Reset danh sách file chờ upload (sau khi lưu thành công hoặc hoàn tác form) */
  const resetPendingFiles = useCallback(() => {
    pendingFilesRef.current.clear();
  }, []);

  /** Kiểm tra xem có file nào đang chờ upload hay không */
  const hasPendingFiles = useCallback(() => {
    return pendingFilesRef.current.size > 0;
  }, []);

  return {
    setPendingFile,
    uploadWithCache,
    resetPendingFiles,
    hasPendingFiles,
  };
}
