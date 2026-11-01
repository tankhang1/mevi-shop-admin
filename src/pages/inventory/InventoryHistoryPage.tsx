import { useState } from "react";
import { Link, useParams } from "wouter";
import { ArrowDownToLine, CheckCircle2, Clock, ListOrdered, SlidersHorizontal } from "lucide-react";
import { Button, Card, StatsCard } from "@Team-Trung-Vu-Khang/eco-shared-ui";
import placeholder from "@/assets/images/image-placeholder.webp";
import { usePageActions } from "@/app/layouts/page-header.store";
import { BackLink } from "@/components/common/BackLink";
import { EmptyBlock, LoadingBlock } from "@/components/common/ui-bits";
import { ROUTES } from "@/config/routes";
import { useCatalogProduct, useStockMovementCounts } from "@/features/shop-catalog";
import { CatalogStockMovementTable } from "./components/CatalogStockMovementTable";
import { type StockDialogMode, StockReceiptDialog } from "./components/StockReceiptDialog";

const nf = new Intl.NumberFormat("vi-VN");

/** One product's stock per quy cách + its full stock movement history */
export default function InventoryHistoryPage() {
  const params = useParams<{ productId: string }>();
  const id = Number(params.productId) || undefined;
  const { data: product, isLoading, isError } = useCatalogProduct(id);
  const { data: counts } = useStockMovementCounts({ productId: id });
  const [dialog, setDialog] = useState<StockDialogMode | null>(null);

  usePageActions(
    () =>
      product && (
        <>
          <Button variant="outline" onClick={() => setDialog("ADJUSTMENT")}>
            <SlidersHorizontal className="mr-1.5 h-4 w-4" /> Điều chỉnh
          </Button>
          <Button onClick={() => setDialog("MEVI")}>
            <ArrowDownToLine className="mr-1.5 h-4 w-4" /> Nhập hàng
          </Button>
        </>
      ),
    [product?.id],
  );

  if (isLoading) return <LoadingBlock />;
  if (isError || !product) return <EmptyBlock>Không tìm thấy sản phẩm.</EmptyBlock>;

  const total = product.variants.reduce((s, v) => s + v.inventoryQuantity, 0);

  return (
    <div className="space-y-5">
      <BackLink to={ROUTES.inventory} label="Kho sản phẩm" />

      <Card className="space-y-4 p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-4">
          <img
            src={product.media[0]?.thumbnailUrl || product.media[0]?.url || placeholder}
            alt=""
            className="h-14 w-14 shrink-0 rounded-lg border object-cover"
          />
          <div className="min-w-0 flex-1">
            <Link href={ROUTES.productDetail(String(product.id))} className="font-semibold hover:underline">
              {product.title}
            </Link>
            <div className="font-mono text-xs text-muted-foreground">{product.code}</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-muted-foreground">Tổng hàng tồn</div>
            <span className="text-2xl font-semibold tabular-nums">{nf.format(total)}</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {product.variants.map((v) => (
            <div key={v.id} className="rounded-lg border bg-muted/30 p-3">
              <div className="truncate text-xs text-muted-foreground">{v.title}</div>
              <div
                className={`text-lg font-semibold tabular-nums ${v.inventoryQuantity === 0 ? "text-red-600" : v.lowStock ? "text-amber-700" : ""}`}
              >
                {nf.format(v.inventoryQuantity)}
              </div>
              {v.lowStockThreshold != null && (
                <div className="text-[11px] text-muted-foreground">Cảnh báo ≤ {nf.format(v.lowStockThreshold)}</div>
              )}
            </div>
          ))}
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatsCard title="Tổng số phiếu" value={counts ? nf.format(counts.total) : "—"} icon={ListOrdered} />
        <StatsCard title="Đã duyệt / áp dụng" value={counts ? nf.format(counts.approved) : "—"} icon={CheckCircle2} />
        <StatsCard title="Chờ duyệt" value={counts ? nf.format(counts.pending) : "—"} icon={Clock} />
      </div>

      <CatalogStockMovementTable productId={product.id} />

      <StockReceiptDialog productId={dialog ? product.id : null} mode={dialog ?? undefined} onOpenChange={(o) => !o && setDialog(null)} />
    </div>
  );
}
