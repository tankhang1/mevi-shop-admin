import { z } from "zod";
import { vnPhoneSchema } from "@/lib/regex";

export const createPartnerAccountSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập họ và tên đối tác")
    .max(255, "Họ và tên tối đa 255 ký tự"),
  phoneNumber: vnPhoneSchema(),
  audienceType: z.enum(["individual", "business"]),
  email: z
    .string()
    .trim()
    .email("Định dạng email không hợp lệ")
    .max(255, "Email tối đa 255 ký tự")
    .optional()
    .or(z.literal("")),
  province: z
    .string()
    .trim()
    .max(255, "Tỉnh / Thành phố tối đa 255 ký tự")
    .optional()
    .or(z.literal("")),
  password: z
    .string()
    .trim()
    .refine((val) => !val || val.length >= 6, {
      message: "Mật khẩu nếu nhập phải có ít nhất 6 ký tự",
    })
    .optional()
    .or(z.literal("")),
});

export type CreatePartnerAccountFormValues = z.infer<
  typeof createPartnerAccountSchema
>;
