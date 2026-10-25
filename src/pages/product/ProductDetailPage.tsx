import { useState } from "react";
import { Link, useLocation, useParams } from "wouter";
import { AlertCircle, History, Pencil, Trash2 } from "lucide-react";
import { Button, Card, DeleteDialog, useToast } from "@Team-Trung-Vu-Khang/eco-shared-ui";
import { usePageActions } from "@/app/layouts/page-header.store";
import { BackLink } from "@/components/common/BackLink";
import { EmptyBlock, LoadingBlock, StatusPill } from "@/components/common/ui-bits";
import { ROUTES } from "@/config/routes";
import { STOCK_STATUS, stockStatusOf } from "@/features/inventory";
import { PRODUCT_STATUS, useDeleteProduct, useProduct } from "@/features/product";
import { getErrorMessage } from "@/lib/api-error";
import { formatDate } from "@/lib/format";
import { ProductInfo } from "./components/ProductInfo";
import { ProductReviews } from "./components/ProductReviews";

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { data: product, isLoading, isError } = useProduct(id);
  const del = useDeleteProduct();
  const [confirmOpen, setConfirmOpen] = useState(false);

  usePageActions(
    () =>
      product && (
        <>
          <Button variant="outline" className="px-2.5 sm:px-4" onClick={() => setConfirmOpen(true)} aria-label="Xoá">
            <Trash2 className="h-4 w-4 text-destructive sm:mr-1.5" />
            <span className="max-sm:hidden">Xoá</span>
          </Button>
          <Button asChild>
            <Link href={ROUTES.productEdit(product.id)}>
              <Pencil className="mr-1.5 h-4 w-4" /> <span className="sm:hidden">Sửa</span>
              <span className="max-sm:hidden">Chỉnh sửa</span>
            </Link>
          </Button>
        </>
      ),
    [product?.id],
  );

  if (isLoading) return <LoadingBlock />;
  if (isError || !product) {
    return (
      <EmptyBlock>
        Không tìm thấy sản phẩm.{" "}
        <Link href={ROUTES.products} className="text-primary underline">
          Quay lại danh sách
        </Link>
      </EmptyBlock>
    );
  }

  const onDelete = async () => {
    try {
      await del.mutateAsync(product.id);
      toast({ title: "Đã xoá sản phẩm", description: product.name });
      navigate(ROUTES.products);
    } catch (e) {
      toast({ variant: "destructive", title: "Không thể xoá", description: getErrorMessage(e) });
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <BackLink to={ROUTES.products} label="Danh mục sản phẩm" />
        <StatusPill {...PRODUCT_STATUS[product.status]} />
        <span className="text-xs text-muted-foreground">Tạo lúc {formatDate(product.createdAt)}</span>
      </div>

      {product.status === "rejected" && product.rejectionReason && (
        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <p className="font-medium">Bị từ chối</p>
            <p>{product.rejectionReason}</p>
          </div>
        </div>
      )}

      <ProductInfo product={product} />

      <Card className="flex flex-wrap items-center gap-3 p-4">
        <div className="text-sm text-muted-foreground">
          Hàng tồn: <span className="text-base font-semibold text-foreground">{product.stock}</span>
        </div>
        <StatusPill {...STOCK_STATUS[stockStatusOf(product)]} />
        <Button variant="outline" size="sm" className="ml-auto" asChild>
          <Link href={ROUTES.inventoryHistory(product.id)}>
            <History className="mr-1.5 h-4 w-4" /> Lịch sử nhập hàng
          </Link>
        </Button>
      </Card>

      {product.status === "approved" && <ProductReviews productId={product.id} />}

      <DeleteDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Xoá sản phẩm?"
        description={`Sản phẩm "${product.name}" sẽ bị xoá vĩnh viễn và không thể khôi phục.`}
        onConfirm={() => void onDelete()}
        loading={del.isPending}
      />
    </div>
  );
}
