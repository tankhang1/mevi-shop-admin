/** Step title owning each top-level field — the stepper can't jump, so error toasts name the step */
const FIELD_STEP: [string, string][] = [
  ["media", "Hình ảnh"],
  ["supplySources", "Nguồn cung nông sản"],
  ["variants", "Hình thức bán & giá"],
  ["sellByUnit", "Hình thức bán & giá"],
  ["sellingUnit", "Hình thức bán & giá"],
  ["unitSku", "Hình thức bán & giá"],
  ["unitPrice", "Hình thức bán & giá"],
  ["unitCompareAtPrice", "Hình thức bán & giá"],
];

/** "Kiểm tra lại bước: Hình thức bán & giá" for the form's current errors */
export function errorStepsHint(errors: object) {
  const steps = new Set(
    Object.keys(errors).map((k) => FIELD_STEP.find(([f]) => f === k)?.[1] ?? "Thông tin cơ bản"),
  );
  return steps.size ? `Kiểm tra lại bước: ${[...steps].join(", ")}.` : "Kiểm tra lại các trường được đánh dấu.";
}
