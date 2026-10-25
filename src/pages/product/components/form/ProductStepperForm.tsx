import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SchemaStepperForm, type SchemaStep } from "@/components/form";
import { type ProductFormValues, productSchema } from "@/features/product";
import { BasicInfoSection, ImagesSection, PricingSection, ReviewSection } from "./sections";

const STEPS: SchemaStep<ProductFormValues>[] = [
  {
    id: "info",
    title: "Thông tin cơ bản",
    description: "Tên, mã, nhóm sản phẩm",
    fields: ["name", "sku", "category", "description"],
    content: <BasicInfoSection />,
  },
  {
    id: "pricing",
    title: "Giá & quy cách",
    description: "Giá bán, nguồn gốc, bảo quản",
    fields: ["price", "salePrice", "origin", "farmId", "packaging", "shelfLife", "storage", "certifications"],
    content: <PricingSection />,
  },
  {
    id: "images",
    title: "Hình ảnh",
    description: "Ảnh bìa và thư viện ảnh",
    fields: ["images"],
    content: <ImagesSection />,
  },
  {
    id: "review",
    title: "Xác nhận",
    description: "Kiểm tra trước khi lưu",
    fields: [],
    content: <ReviewSection />,
  },
];

interface Props {
  defaultValues: ProductFormValues;
  submitLabel: string;
  isSubmitting?: boolean;
  onSubmit: (values: ProductFormValues) => void;
  onCancel: () => void;
}

export function ProductStepperForm({ defaultValues, ...props }: Props) {
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues,
    mode: "onTouched",
  });
  return <SchemaStepperForm form={form} schema={productSchema} steps={STEPS} {...props} />;
}
