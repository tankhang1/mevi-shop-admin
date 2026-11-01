import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation } from "wouter";
import { useToast } from "@Team-Trung-Vu-Khang/eco-shared-ui";
import { BackLink } from "@/components/common/BackLink";
import { ROUTES } from "@/config/routes";
import {
  type CatalogProductFormValues,
  EMPTY_CATALOG_PRODUCT,
  applyFieldErrors,
  catalogFormValuesToInput,
  catalogProductSchema,
  isStorefrontSyncError,
  useCreateCatalogProduct,
} from "@/features/shop-catalog";
import { getErrorMessage } from "@/lib/api-error";
import { ProductStepperForm } from "./components/form/ProductStepperForm";

export default function ProductCreatePage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const create = useCreateCatalogProduct();
  const form = useForm<CatalogProductFormValues>({
    resolver: zodResolver(catalogProductSchema),
    defaultValues: EMPTY_CATALOG_PRODUCT,
    mode: "onTouched",
  });

  const onSubmit = async (values: CatalogProductFormValues) => {
    try {
      const created = await create.mutateAsync(catalogFormValuesToInput(values));
      toast({ title: "Đã tạo sản phẩm", description: created.title });
      navigate(ROUTES.productDetail(String(created.id)));
    } catch (e) {
      const n = applyFieldErrors(e, form.setError);
      toast({
        variant: "destructive",
        title: isStorefrontSyncError(e) ? "Chưa cập nhật được trang shop, vui lòng thử lại" : "Không thể lưu",
        description: n ? "Kiểm tra lại các trường được đánh dấu." : getErrorMessage(e),
      });
    }
  };

  return (
    <div className="space-y-4">
      <BackLink to={ROUTES.products} label="Danh mục sản phẩm" />
      <ProductStepperForm
        form={form}
        submitLabel="Tạo sản phẩm"
        isSubmitting={create.isPending}
        onSubmit={onSubmit}
        onCancel={() => navigate(ROUTES.products)}
      />
    </div>
  );
}
