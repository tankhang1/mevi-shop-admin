import { z } from "zod";

const optionalText = (max: number) => z.string().trim().max(max, `Tối đa ${max} ký tự`);

export const customerSchema = z
  .object({
    fullName: z.string().trim().min(1, "Vui lòng nhập họ tên").max(255, "Tối đa 255 ký tự"),
    phoneNumber: z
      .string()
      .trim()
      .regex(/^(0|\+?84)\d{9}$/, "Số điện thoại di động không hợp lệ"),
    email: z.union([z.literal(""), z.email("Email không hợp lệ").max(255, "Tối đa 255 ký tự")]),
    audienceType: z.enum(["individual", "cooperative", "business", "other"]),
    audienceTypeOther: optionalText(255),
    operatingArea: optionalText(150),
    province: optionalText(150),
    commune: optionalText(150),
    tags: z.array(z.string().max(50, "Mỗi nhãn tối đa 50 ký tự")).max(10, "Tối đa 10 nhãn"),
    internalNote: optionalText(2000),
  })
  .refine((v) => v.audienceType !== "other" || v.audienceTypeOther.length > 0, {
    path: ["audienceTypeOther"],
    message: "Vui lòng mô tả đối tượng",
  });

export type CustomerFormValues = z.infer<typeof customerSchema>;
