import { z } from "zod";

// ── Banner ──
export const bannerSettingsSchema = z.object({
  autoplay: z.boolean(),
  intervalSeconds: z
    .number()
    .min(1, "Thời gian chờ tối thiểu 1 giây")
    .max(60, "Thời gian chờ tối đa 60 giây"),
});

export const bannerSlideSchema = z.object({
  enabled: z.boolean(),
  imageUrl: z.string().min(1, "Vui lòng chọn ảnh nền banner").max(1000, "URL tối đa 1000 ký tự"),
  badge: z.object({
    enabled: z.boolean(),
    text: z.string().max(80, "Huy hiệu tối đa 80 ký tự"),
  }).refine((b) => !b.enabled || b.text.trim().length > 0, {
    message: "Vui lòng nhập nội dung huy hiệu khi bật",
    path: ["text"],
  }),
  title: z
    .string()
    .min(1, "Vui lòng nhập tiêu đề slide")
    .max(255, "Tiêu đề tối đa 255 ký tự"),
  description: z.string().max(1000, "Mô tả tối đa 1000 ký tự").optional().nullable(),
  cta: z.object({
    enabled: z.boolean(),
    label: z.string().max(80, "Nhãn nút tối đa 80 ký tự"),
    linkType: z.string().max(64, "Loại hành động tối đa 64 ký tự"),
    target: z.string().max(1000, "Đích đến tối đa 1000 ký tự"),
  }).refine((c) => !c.enabled || c.label.trim().length > 0, {
    message: "Vui lòng nhập nhãn nút khi bật",
    path: ["label"],
  }).refine((c) => {
    if (!c.enabled || !c.target.trim()) return true;
    const t = c.target.trim();
    if (/\s/.test(t)) return false;
    if (t.startsWith("//") || t.startsWith("/\\")) return false;
    return true;
  }, {
    message: "Đường dẫn không hợp lệ (không chứa khoảng trắng hoặc //)",
    path: ["target"],
  }),
});

export type BannerSlideFormValues = z.infer<typeof bannerSlideSchema>;

// ── Highlights ──
export const highlightsSettingsSchema = z.object({
  enabled: z.boolean(),
  eyebrow: z.string().max(100, "Dòng dẫn tối đa 100 ký tự").optional().nullable(),
  title: z.string().max(255, "Tiêu đề tối đa 255 ký tự").optional().nullable(),
  description: z.string().max(1000, "Mô tả tối đa 1000 ký tự").optional().nullable(),
});

export const highlightCardSchema = z.object({
  enabled: z.boolean(),
  icon: z.string().min(1, "Vui lòng chọn biểu tượng").max(64, "Biểu tượng tối đa 64 ký tự"),
  title: z.string().min(1, "Vui lòng nhập tiêu đề").max(255, "Tiêu đề tối đa 255 ký tự"),
  description: z.string().max(1000, "Mô tả tối đa 1000 ký tự").optional().nullable(),
  link: z
    .string()
    .max(1000, "Liên kết tối đa 1000 ký tự")
    .optional()
    .nullable()
    .refine((l) => {
      if (!l || !l.trim()) return true;
      const v = l.trim();
      if (v.startsWith("//") || v.startsWith("/\\")) return false;
      return v.startsWith("/") || v.startsWith("https://");
    }, {
      message: "Liên kết phải bắt đầu bằng / hoặc https://",
    }),
});

export type HighlightCardFormValues = z.infer<typeof highlightCardSchema>;

// ── FAQ ──
export const faqSettingsSchema = z.object({
  enabled: z.boolean(),
  eyebrow: z.string().max(100, "Dòng dẫn tối đa 100 ký tự").optional().nullable(),
  title: z.string().max(255, "Tiêu đề tối đa 255 ký tự").optional().nullable(),
});

export const faqQuestionSchema = z.object({
  enabled: z.boolean(),
  question: z.string().min(1, "Vui lòng nhập câu hỏi").max(500, "Câu hỏi tối đa 500 ký tự"),
  answer: z.string().min(1, "Vui lòng nhập câu trả lời").max(5000, "Câu trả lời tối đa 5000 ký tự"),
});

export type FaqQuestionFormValues = z.infer<typeof faqQuestionSchema>;

