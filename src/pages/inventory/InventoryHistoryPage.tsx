import { useState } from "react";
import { Link, useParams } from "wouter";
import { ArrowDownToLine, ArrowUpFromLine, ListOrdered } from "lucide-react";
import { Button, Card, StatsCard } from "@Team-Trung-Vu-Khang/eco-shared-ui";
import placeholder from "@/assets/images/image-placeholder.webp";
import { usePageActions } from "@/app/layouts/page-header.store";
import { BackLink } from "@/components/common/BackLink";
import { EmptyBlock, LoadingBlock, StatusPill } from "@/components/common/ui-bits";
import { ROUTES } from "@/config/routes";
import { type InventoryItem, STOCK_STATUS, stockStatusOf, useStockMovements } from "@/features/inventory";
import { useProduct } from "@/features/product";
import { StockAdjustDialog } from "./components/StockAdjustDialog";
import { StockMovementTable } from "./components/StockMovementTable";

const nf = new Intl.NumberFormat("vi-VN");

/** One product's stock card + its full nhập hàng / bán history */
export default function InventoryHistoryPage() {
  const { productId } = useParams<{ productId: string }>();
  const { data: product, isLoading, isError } = useProduct(productId);
  // size 1: only the all-time summary is needed here, the table pages on its own
  const { data: movements } = useStockMovements({ productId, size: 1 });
  const [adjusting, setAdjusting] = useState<InventoryItem | null>(null);

  const item: InventoryItem | null = product ? { ...product, productId: product.id, stockStatus: stockStatusOf(product) } : null;

  usePageActions(
    () =>
      item && (
        <Button onClick={() => setAdjusting(item)}>
          <ArrowDownToLine className="mr-1.5 h-4 w-4" /> Nhập hàng
        </Button>
      ),
    [item?.id, item?.stock, item?.lowStockThreshold],
  );

  if (isLoading) return <LoadingBlock />;
  if (isError || !item) return <EmptyBlock>Không tìm thấy sản phẩm.</EmptyBlock>;

  const summary = movements?.summary;

  return (
    <div className="space-y-5">
      <BackLink to={ROUTES.inventory} label="Kho sản phẩm" />

      <Card className="flex flex-wrap items-center gap-4 p-4 sm:p-5">
        <img src={item.images[0] || placeholder} alt="" className="h-14 w-14 shrink-0 rounded-lg border object-cover" />
        <div className="min-w-0 flex-1">
          <Link href={ROUTES.productDetail(item.id)} className="font-semibold hover:underline">
            {item.name}
          </Link>
          <div className="font-mono text-xs text-muted-foreground">{item.sku}</div>
        </div>
        <div className="text-right">
          <div className="text-xs text-muted-foreground">Hàng tồn · cảnh báo ≤ {item.lowStockThreshold}</div>
          <div className="flex items-center justify-end gap-2">
            <span className="text-2xl font-semibold">{nf.format(item.stock)}</span>
            <StatusPill {...STOCK_STATUS[item.stockStatus]} />
          </div>
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatsCard title="Số giao dịch" value={summary ? nf.format(summary.count) : "—"} icon={ListOrdered} />
        <StatsCard title="Tổng nhập" value={summary ? `+${nf.format(summary.totalIn)}` : "—"} icon={ArrowDownToLine} />
        <StatsCard title="Tổng đã bán" value={summary ? `-${nf.format(summary.totalOut)}` : "—"} icon={ArrowUpFromLine} />
      </div>

      <StockMovementTable productId={item.id} />

      <StockAdjustDialog item={adjusting} onOpenChange={(o) => !o && setAdjusting(null)} />
    </div>
  );
}
