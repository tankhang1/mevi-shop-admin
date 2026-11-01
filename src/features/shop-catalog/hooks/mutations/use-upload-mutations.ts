import { useMutation } from "@tanstack/react-query";
import { productPhotoApi } from "../../api";
import type { UploadProductPhotoInput } from "../../types";

/** One file per call; run in parallel for multi-select */
export function useUploadProductPhoto() {
  return useMutation({ mutationFn: (input: UploadProductPhotoInput) => productPhotoApi.upload(input) });
}
