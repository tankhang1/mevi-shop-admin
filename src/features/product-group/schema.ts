import { z } from "zod";

export const productGroupSchema = z.object({
  name: z.string().trim().min(1, "Vui lòng nhập tên nhóm").max(60, "Tối đa 60 ký tự"),
  description: z.string().trim().max(300, "Tối đa 300 ký tự").optional(),
  imageUrl: z.string().optional(),
  shopId: z.string().optional(),
});

export type ProductGroupFormValues = z.infer<typeof productGroupSchema>;
