import type { PhotoFormat } from "../enums";

export interface UploadProductPhotoInput {
  file: File;
  /** Stored format; WEBP recommended for web (falls back to JPEG if the server lacks the codec) */
  format?: PhotoFormat;
  /** Optional — admin screens omit it; set only when uploading for a farm workspace */
  workspaceId?: number;
  /** 0–100 */
  onProgress?: (percent: number) => void;
  signal?: AbortSignal;
}
