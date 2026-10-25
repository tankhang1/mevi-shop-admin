import { z } from "zod";

export const dispatchTeamSchema = z
  .object({
    name: z.string().trim().min(1, "Vui lòng nhập tên nhóm").max(60, "Tối đa 60 ký tự"),
    description: z.string().trim().max(200, "Tối đa 200 ký tự").optional(),
    memberIds: z.array(z.string()).min(1, "Chọn ít nhất một thành viên"),
    leaderId: z.string().nullable().optional(),
    regions: z.array(z.string()),
    shopId: z.string().optional(),
  })
  .refine((v) => !v.leaderId || v.memberIds.includes(v.leaderId), {
    path: ["leaderId"],
    message: "Trưởng nhóm phải là thành viên của nhóm",
  });

export type DispatchTeamFormValues = z.infer<typeof dispatchTeamSchema>;

export const REGION_SUGGESTIONS = ["TP.HCM", "Hà Nội", "Cần Thơ", "Đà Nẵng", "Đà Lạt", "Vinh", "Buôn Ma Thuột"];
