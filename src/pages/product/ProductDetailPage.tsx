import { useState } from "react";
import { Link, useLocation, useParams } from "wouter";
import { Pencil, Trash2 } from "lucide-react";
import {
  Button,
  DeleteDialog,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  useToast,
} from "@Team-Trung-Vu-Khang/eco-shared-ui";
import { usePageActions } from "@/app/layouts/page-header.store";
import { BackLink } from "@/components/common/BackLink";
import { EmptyBlock, LoadingBlock, StatusPill } from "@/components/common/ui-bits";
import { ROUTES } from "@/config/routes";
import { BUSINESS_STATUS, businessStatusOf, useDeleteProduct, useProduct } from "@/features/product";
import { getErrorMessage } from "@/lib/api-error";
import { formatDate } from "@/lib/format";
import { StockMovementTable } from "@/pages/inventory/components/StockMovementTable";
import { ProductInfo } from "./components/ProductInfo";
import { ProductStockCard } from "./components/ProductStockCard";
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
        <StatusPill {...BUSINESS_STATUS[businessStatusOf(product)]} />
        <span className="text-xs text-muted-foreground">Tạo lúc {formatDate(product.createdAt)}</span>
      </div>

      <Tabs defaultValue="info" className="space-y-3">
        <div className="-mx-1 overflow-x-auto px-1 [scrollbar-width:none]">
          <TabsList>
            <TabsTrigger value="info">Thông tin</TabsTrigger>
            <TabsTrigger value="sales">Lịch sử bán hàng</TabsTrigger>
            <TabsTrigger value="imports">Lịch sử nhập hàng</TabsTrigger>
            <TabsTrigger value="stock">Tồn kho hiện tại</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="info" className="mt-0 space-y-5">
          <ProductInfo product={product} />
          <ProductReviews productId={product.id} />
        </TabsContent>
        <TabsContent value="sales" className="mt-0">
          <StockMovementTable productId={product.id} type="out" />
        </TabsContent>
        <TabsContent value="imports" className="mt-0">
          <StockMovementTable productId={product.id} type="in" />
        </TabsContent>
        <TabsContent value="stock" className="mt-0">
          <ProductStockCard product={product} />
        </TabsContent>
      </Tabs>

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
