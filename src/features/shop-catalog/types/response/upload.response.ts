export interface StoredFile {
  bucket: string;
  objectKey: string;
  fileUrl: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  etag: string;
}

export interface ProductPhotoUpload extends StoredFile {
  thumbnail: StoredFile & { width: number; height: number };
}
