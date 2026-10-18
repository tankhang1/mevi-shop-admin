import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SchemaStepperForm, type SchemaStep } from "@/components/form";
import { LoadingBlock } from "@/components/common/ui-bits";
import { useAccess } from "@/features/auth";
import { type ProductFormValues, productSchema, rootProductSchema } from "@/features/product";
import { useShops } from "@/features/shop";
import { BasicInfoSection, ImagesSection, PricingSection, ReviewSection } from "./sections";

const getSteps = (shopOptions?: { label: string; value: string }[]): SchemaStep<ProductFormValues>[] => [
  {
    id: "info",
    title: "Thông tin cơ bản",
    description: "Tên, SKU, danh mục",
    fields: ["shopId", "name", "sku", "category", "description"],
    content: <BasicInfoSection shopOptions={shopOptions} />,
  },
  {
    id: "pricing",
    title: "Giá & quy cách",
    description: "Giá bán, nguồn gốc, bảo quản",
    fields: ["price", "salePrice", "origin", "packaging", "shelfLife", "storage", "certifications"],
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

function StepperFormInner({ defaultValues, isRoot, shopOptions, ...props }: Props & { isRoot: boolean; shopOptions?: { label: string; value: string }[] }) {
  // Root must pick the owning shop; shop admins never see the field
  const schema = isRoot ? rootProductSchema : productSchema;
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: "onTouched",
  });
  return <SchemaStepperForm form={form} schema={schema} steps={getSteps(isRoot ? (shopOptions ?? []) : undefined)} {...props} />;
}

export function ProductStepperForm(props: Props) {
  const { isRoot, isLoading } = useAccess();
  const { data: shops, isLoading: shopsLoading } = useShops({ size: 100 }, isRoot);
  // The schema and steps depend on the role, and useForm only reads them once
  if (isLoading || (isRoot && shopsLoading)) return <LoadingBlock />;
  return <StepperFormInner {...props} isRoot={isRoot} shopOptions={shops?.items.map((s) => ({ label: s.name, value: s.id }))} />;
}
