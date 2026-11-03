import { useState } from "react";
import { Link, useLocation, useParams } from "wouter";
import { History, Pencil, Trash2 } from "lucide-react";
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
import { MockBadge } from "@/components/common/MockBadge";
import { EmptyBlock, LoadingBlock } from "@/components/common/ui-bits";
import { ROUTES } from "@/config/routes";
import { useAccess } from "@/features/auth";
import { isStorefrontSyncError, useCatalogProduct, useDeleteCatalogProduct } from "@/features/shop-catalog";
import { getErrorMessage } from "@/lib/api-error";
import { formatDate } from "@/lib/format";
import { CatalogStatusToggle } from "./components/CatalogStatusToggle";
import { ProductInfo } from "./components/ProductInfo";
import { CatalogStockMovementTable } from "@/pages/inventory/components/CatalogStockMovementTable";
import { StockMovementTable } from "@/pages/inventory/components/StockMovementTable";
import { ProductReviews } from "./components/ProductReviews";
import { ProductStockCard } from "./components/ProductStockCard";

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id) || undefined;
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { isRoot } = useAccess();
  const { data: product, isLoading, isError } = useCatalogProduct(id);
  const del = useDeleteCatalogProduct();
  const [confirmOpen, setConfirmOpen] = useState(false);

  usePageActions(
    () =>
      product && isRoot ? (
        <>
          <Button variant="outline" className="px-2.5 sm:px-4" onClick={() => setConfirmOpen(true)} aria-label="Xoá">
            <Trash2 className="h-4 w-4 text-destructive sm:mr-1.5" />
            <span className="max-sm:hidden">Xoá</span>
          </Button>
          <Button asChild>
            <Link href={ROUTES.productEdit(String(product.id))}>
              <Pencil className="mr-1.5 h-4 w-4" /> <span className="sm:hidden">Sửa</span>
              <span className="max-sm:hidden">Chỉnh sửa</span>
            </Link>
          </Button>
        </>
      ) : null,
    [product?.id, isRoot],
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
      toast({ title: "Đã xoá sản phẩm", description: product.title });
      navigate(ROUTES.products);
    } catch (e) {
      toast({
        variant: "destructive",
        title: isStorefrontSyncError(e) ? "Chưa cập nhật được trang shop, vui lòng thử lại" : "Không thể xoá",
        description: getErrorMessage(e),
      });
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <BackLink to={ROUTES.products} label="Danh mục sản phẩm" />
        {isRoot && (
          <label className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            Tạm ngưng kinh doanh <CatalogStatusToggle product={product} />
          </label>
        )}
        <span className="text-xs text-muted-foreground">
          Tạo lúc {formatDate(product.createdAt)} · Cập nhật {formatDate(product.updatedAt)}
        </span>
      </div>

      <Tabs defaultValue="info" className="space-y-3">
        <div className="-mx-1 overflow-x-auto px-1 [scrollbar-width:none]">
          <TabsList>
            <TabsTrigger value="info">Thông tin</TabsTrigger>
            <TabsTrigger value="sales" className="gap-1.5">
              Lịch sử bán hàng <MockBadge />
            </TabsTrigger>
            <TabsTrigger value="imports">Lịch sử tồn kho</TabsTrigger>
            <TabsTrigger value="stock">Tồn kho hiện tại</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="info" className="mt-0 space-y-5">
          <ProductInfo product={product} />
          {/* Reviews API not ready — still on mocks */}
          <ProductReviews productId={String(product.id)} />
        </TabsContent>
        {/* No orders API yet */}
        <TabsContent value="sales" className="mt-0">
          <StockMovementTable productId={String(product.id)} type="out" />
        </TabsContent>
        <TabsContent value="imports" className="mt-0">
          <CatalogStockMovementTable productId={product.id} />
        </TabsContent>
        <TabsContent value="stock" className="mt-0 space-y-3">
          <ProductStockCard product={product} />
          <Button variant="outline" size="sm" asChild>
            <Link href={ROUTES.inventoryHistory(String(product.id))}>
              <History className="mr-1.5 h-4 w-4" /> Quản lý kho
            </Link>
          </Button>
        </TabsContent>
      </Tabs>

      <DeleteDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Xoá sản phẩm?"
        description={`Sản phẩm "${product.title}" sẽ bị xoá khỏi admin và cửa hàng. Mã sản phẩm và SKU không dùng lại được.`}
        onConfirm={() => void onDelete()}
        loading={del.isPending}
      />
    </div>
  );
}
