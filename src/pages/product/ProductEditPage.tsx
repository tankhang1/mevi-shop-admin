import { useLocation, useParams } from "wouter";
import { Info } from "lucide-react";
import { useToast } from "@Team-Trung-Vu-Khang/eco-shared-ui";
import { BackLink } from "@/components/common/BackLink";
import { EmptyBlock, LoadingBlock } from "@/components/common/ui-bits";
import { ROUTES } from "@/config/routes";
import {
  type ProductFormValues,
  formValuesToInput,
  productToFormValues,
  useProduct,
  useUpdateProduct,
} from "@/features/product";
import { getErrorMessage } from "@/lib/api-error";
import { ProductStepperForm } from "./components/form/ProductStepperForm";

export default function ProductEditPage() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { data: product, isLoading, isError } = useProduct(id);
  const update = useUpdateProduct();

  if (isLoading) return <LoadingBlock />;
  if (isError || !product) return <EmptyBlock>Không tìm thấy sản phẩm.</EmptyBlock>;

  const onSubmit = async (values: ProductFormValues) => {
    try {
      await update.mutateAsync({ id, data: formValuesToInput(values) });
      toast({ title: "Đã cập nhật sản phẩm", description: "Sản phẩm được gửi duyệt lại." });
      navigate(ROUTES.productDetail(id));
    } catch (e) {
      toast({ variant: "destructive", title: "Không thể lưu", description: getErrorMessage(e) });
    }
  };

  return (
    <div className="space-y-4">
      <BackLink to={ROUTES.productDetail(id)} label={product.name} />
      {product.status === "approved" && (
        <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          Sản phẩm đang hiển thị trên cửa hàng. Sau khi lưu, sản phẩm sẽ chuyển về "Chờ duyệt".
        </div>
      )}
      <ProductStepperForm
        defaultValues={productToFormValues(product)}
        submitLabel="Lưu thay đổi"
        isSubmitting={update.isPending}
        onSubmit={onSubmit}
        onCancel={() => navigate(ROUTES.productDetail(id))}
      />
    </div>
  );
}
