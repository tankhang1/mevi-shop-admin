import { useMutation } from "@tanstack/react-query";
import { productPhotoApi } from "../../api";
import type { PhotoFormat } from "../../types";

export function useUploadProductPhoto() {
  return useMutation({
    mutationFn: ({ file, format }: { file: File; format?: PhotoFormat }) => productPhotoApi.upload(file, format),
  });
}
