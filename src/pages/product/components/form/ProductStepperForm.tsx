import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SchemaStepperForm, type SchemaStep } from "@/components/form";
import { type ProductFormValues, productSchema } from "@/features/product";
import {
  BasicInfoSection,
  ImagesSection,
  ReviewSection,
  SuppliersSection,
  VariantsSection,
} from "./sections";

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

  const isAgricultural = useWatch({
    control: form.control,
    name: "isAgricultural",
  });

  const steps: SchemaStep<ProductFormValues>[] = [
    {
      id: "info",
      title: "Thông tin cơ bản",
      description: "Tên, mã, nhóm sản phẩm",
      fields: [
        "name",
        "sku",
        "category",
        "description",
        "shelfLife",
        "storage",
        "certifications",
        "isAgricultural",
        "cropId",
        "baseUnit",
      ],
      content: <BasicInfoSection />,
    },
    {
      id: "images",
      title: "Hình ảnh",
      description: "Ảnh bìa và thư viện ảnh",
      fields: ["images"],
      content: <ImagesSection />,
    },
    ...(isAgricultural
      ? [
          {
            id: "suppliers",
            title: "Liên kết cung ứng",
            description: "Nông hộ & vườn canh tác",
            fields: [
              "farmId",
              "regionId",
              "sources",
            ] as (keyof ProductFormValues & string)[],
            content: <SuppliersSection />,
          },
        ]
      : []),
    {
      id: "variants",
      title: "Quy cách & giá",
      description: "Giá bán, giá gốc",
      fields: ["variants"],
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

  return (
    <SchemaStepperForm
      form={form}
      schema={productSchema}
      steps={steps}
      {...props}
    />
  );
}
