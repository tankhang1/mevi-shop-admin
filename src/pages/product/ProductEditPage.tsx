import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation, useParams } from "wouter";
import { useToast } from "@Team-Trung-Vu-Khang/eco-shared-ui";
import { BackLink } from "@/components/common/BackLink";
import { EmptyBlock, LoadingBlock } from "@/components/common/ui-bits";
import { ROUTES } from "@/config/routes";
import {
  type CatalogProduct,
  type CatalogProductFormValues,
  applyFieldErrors,
  catalogFormValuesToInput,
  catalogProductSchema,
  catalogProductToFormValues,
  isStorefrontSyncError,
  useCatalogProduct,
  useUpdateCatalogProduct,
} from "@/features/shop-catalog";
import { getErrorMessage } from "@/lib/api-error";
import { ProductStepperForm } from "./components/form/ProductStepperForm";

export default function ProductEditPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id) || undefined;
  const { data: product, isLoading, isError } = useCatalogProduct(id);

  if (isLoading) return <LoadingBlock />;
  if (isError || !product) return <EmptyBlock>Không tìm thấy sản phẩm.</EmptyBlock>;
  // Mounted once the product is loaded so the form seeds from it
  return <EditForm product={product} />;
}

function EditForm({ product }: { product: CatalogProduct }) {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const update = useUpdateCatalogProduct();
  const detailHref = ROUTES.productDetail(String(product.id));
  const form = useForm<CatalogProductFormValues>({
    resolver: zodResolver(catalogProductSchema),
    defaultValues: catalogProductToFormValues(product),
    mode: "onTouched",
  });

  const onSubmit = async (values: CatalogProductFormValues) => {
    try {
      await update.mutateAsync({ id: product.id, data: catalogFormValuesToInput(values) });
      toast({ title: "Đã cập nhật sản phẩm", description: values.title });
      navigate(detailHref);
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
      <BackLink to={detailHref} label={product.title} />
      <ProductStepperForm
        form={form}
        submitLabel="Lưu thay đổi"
        isSubmitting={update.isPending}
        onSubmit={onSubmit}
        onCancel={() => navigate(detailHref)}
      />
    </div>
  );
}
