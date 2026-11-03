import type { UseFormReturn } from "react-hook-form";
import { useWatch } from "react-hook-form";
import { SchemaStepperForm, type SchemaStep } from "@/components/form";
import { type CatalogProductFormValues, catalogProductSchema } from "@/features/shop-catalog";
import { BasicInfoSection, ImagesSection, ReviewSection, SuppliersSection, VariantsSection } from "./sections";

type F = CatalogProductFormValues;

interface Props {
  /** Owned by the page so it can map backend `fieldErrors` back onto fields */
  form: UseFormReturn<F>;
  submitLabel: string;
  isSubmitting?: boolean;
  onSubmit: (values: F) => void;
  onCancel: () => void;
}

export function ProductStepperForm({ form, ...props }: Props) {
  const agricultural = useWatch({ control: form.control, name: "agricultural" });

  const steps: SchemaStep<F>[] = [
    {
      id: "info",
      title: "Thông tin cơ bản",
      description: "Tên, mã, nhóm sản phẩm",
      fields: [
        "title",
        "code",
        "handle",
        "categoryId",
        "description",
        "active",
        "agricultural",
        "productionSubjectId",
        "baseUnit",
        "shelfLifeValue",
        "shelfLifeUnit",
        "storageCondition",
        "storageInstructions",
        "certifications",
      ],
      content: <BasicInfoSection />,
    },
    {
      id: "images",
      title: "Hình ảnh",
      description: "Ảnh bìa và thư viện ảnh",
      fields: ["media"],
      content: <ImagesSection />,
    },
    ...(agricultural
      ? [
          {
            id: "suppliers",
            title: "Nguồn cung nông sản",
            description: "Liên kết vườn (không bắt buộc)",
            fields: ["supplySources"] as (keyof F & string)[],
            content: <SuppliersSection />,
          },
        ]
      : []),
    {
      id: "variants",
      title: "Hình thức bán & giá",
      description: "Đơn vị tính, quy cách, giá",
      fields: ["sellByUnit", "sellingUnit", "unitPrice", "unitCompareAtPrice", "sellByPackage", "variants"],
      content: <VariantsSection />,
    },
    {
      id: "review",
      title: "Xác nhận",
      description: "Kiểm tra trước khi lưu",
      fields: [],
      content: <ReviewSection />,
    },
  ];

  return <SchemaStepperForm form={form} schema={catalogProductSchema} steps={steps} {...props} />;
}
