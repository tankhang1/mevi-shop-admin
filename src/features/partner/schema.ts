import { z } from "zod";
import { VN_PHONE_REGEX, vnPhoneSchema } from "@/lib/regex";

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

export const unifiedPartnerSchema = z.object({
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
  password: z
    .string()
    .trim()
    .refine((val) => !val || val.length >= 6, {
      message: "Mật khẩu nếu nhập phải có ít nhất 6 ký tự",
    })
    .optional()
    .or(z.literal("")),
  shopName: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập tên gian hàng")
    .max(255, "Tên gian hàng tối đa 255 ký tự"),
  handle: z
    .string()
    .trim()
    .optional()
    .or(z.literal("")),
  slogan: z
    .string()
    .trim()
    .optional()
    .or(z.literal("")),
  province: z
    .string()
    .trim()
    .min(1, "Vui lòng chọn Tỉnh / Thành phố"),
  ward: z
    .string()
    .trim()
    .optional()
    .or(z.literal("")),
  detailAddress: z
    .string()
    .trim()
    .max(255, "Địa chỉ chi tiết tối đa 255 ký tự")
    .optional()
    .or(z.literal("")),
});

export type UnifiedPartnerFormValues = z.infer<typeof unifiedPartnerSchema>;

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .trim()
      .min(6, "Mật khẩu mới phải có ít nhất 6 ký tự")
      .max(64, "Mật khẩu tối đa 64 ký tự"),
    confirmPassword: z
      .string()
      .trim()
      .min(6, "Vui lòng nhập lại mật khẩu mới"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không trùng khớp",
    path: ["confirmPassword"],
  });

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export const partnerContactDetailSchema = z
  .object({
    status: z.enum(["NEW", "CONTACTED", "ACCOUNT_CREATED", "REJECTED"]),
    adminNote: z
      .string()
      .trim()
      .max(1000, "Ghi chú tối đa 1000 ký tự")
      .optional()
      .or(z.literal("")),
    needsCreateAccount: z.boolean(),
    fullName: z
      .string()
      .trim()
      .max(255, "Họ và tên tối đa 255 ký tự")
      .optional()
      .or(z.literal("")),
    phoneNumber: z.string().trim().optional().or(z.literal("")),
    audienceType: z.enum(["individual", "business"]),
    shopName: z
      .string()
      .trim()
      .max(255, "Tên gian hàng tối đa 255 ký tự")
      .optional()
      .or(z.literal("")),
    email: z
      .string()
      .trim()
      .email("Định dạng email không hợp lệ")
      .max(255, "Email tối đa 255 ký tự")
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
    province: z.string().trim().optional().or(z.literal("")),
    ward: z.string().trim().optional().or(z.literal("")),
    detailAddress: z
      .string()
      .trim()
      .max(255, "Địa chỉ chi tiết tối đa 255 ký tự")
      .optional()
      .or(z.literal("")),
  })
  .superRefine((data, ctx) => {
    if (data.status === "ACCOUNT_CREATED" && data.needsCreateAccount) {
      if (!data.fullName || data.fullName.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["fullName"],
          message: "Vui lòng nhập họ và tên đối tác",
        });
      }
      if (!data.phoneNumber || data.phoneNumber.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["phoneNumber"],
          message: "Vui lòng nhập số điện thoại",
        });
      } else if (!VN_PHONE_REGEX.test(data.phoneNumber.trim())) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["phoneNumber"],
          message: "Số điện thoại di động Việt Nam không hợp lệ",
        });
      }
      if (!data.shopName || data.shopName.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["shopName"],
          message: "Vui lòng nhập tên gian hàng",
        });
      }
      if (!data.province || data.province.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["province"],
          message: "Vui lòng chọn Tỉnh / Thành phố",
        });
      }
    }
  });

export type PartnerContactDetailFormValues = z.infer<
  typeof partnerContactDetailSchema
>;
