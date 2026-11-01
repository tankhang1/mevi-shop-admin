import { z } from "zod";
import { CATEGORY_LIMITS, HANDLE_PATTERN } from "../constants";
import type { ProductCategory, ProductCategoryInput } from "../types";

export const categorySchema = z.object({
  name: z.string().trim().min(1, "Vui lòng nhập tên nhóm").max(CATEGORY_LIMITS.name, `Tối đa ${CATEGORY_LIMITS.name} ký tự`),
  handle: z
    .string()
    .trim()
    .toLowerCase()
    .max(CATEGORY_LIMITS.handle, `Tối đa ${CATEGORY_LIMITS.handle} ký tự`)
    .refine((v) => !v || HANDLE_PATTERN.test(v), "Chỉ gồm a-z, 0-9 và dấu -, không bắt đầu/kết thúc bằng -, không có --"),
  description: z.string().trim().max(CATEGORY_LIMITS.description, `Tối đa ${CATEGORY_LIMITS.description} ký tự`),
  imageUrl: z.string(),
});

export type CategoryFormValues = z.infer<typeof categorySchema>;

export const toCategoryFormValues = (c?: ProductCategory): CategoryFormValues => ({
  name: c?.name ?? "",
  handle: c?.handle ?? "",
  description: c?.description ?? "",
  imageUrl: c?.imageUrl ?? "",
});

/**
 * Empty strings → null so the backend applies its defaults (handle generated on create, kept on update).
 * Not editable in the UI: PUT overwrites everything, so pass the current `sortOrder` to keep it.
 */
export const toCategoryInput = (v: CategoryFormValues, sortOrder = 0): ProductCategoryInput => ({
  name: v.name,
  handle: v.handle || null,
  description: v.description || null,
  imageUrl: v.imageUrl || null,
  sortOrder,
});
