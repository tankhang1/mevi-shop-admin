import { useLocation } from "wouter";
import { useToast } from "@Team-Trung-Vu-Khang/eco-shared-ui";
import { BackLink } from "@/components/common/BackLink";
import { ROUTES } from "@/config/routes";
import { EMPTY_PRODUCT, type ProductFormValues, formValuesToInput, useCreateProduct } from "@/features/product";
import { getErrorMessage } from "@/lib/api-error";
import { ProductStepperForm } from "./components/form/ProductStepperForm";

export default function ProductCreatePage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const create = useCreateProduct();

  const onSubmit = async (values: ProductFormValues) => {
    try {
      const created = await create.mutateAsync(formValuesToInput(values));
      toast({ title: "Đã tạo sản phẩm", description: "Sản phẩm đang chờ duyệt trước khi hiển thị trên cửa hàng." });
      navigate(ROUTES.productDetail(created.id));
    } catch (e) {
      toast({ variant: "destructive", title: "Không thể lưu", description: getErrorMessage(e) });
    }
  };

  return (
    <div className="space-y-4">
      <BackLink to={ROUTES.products} label="Danh sách sản phẩm" />
      <ProductStepperForm
        defaultValues={EMPTY_PRODUCT}
        submitLabel="Tạo sản phẩm"
        isSubmitting={create.isPending}
        onSubmit={onSubmit}
        onCancel={() => navigate(ROUTES.products)}
      />
    </div>
  );
}
