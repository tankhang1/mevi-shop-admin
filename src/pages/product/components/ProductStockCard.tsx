import { useState } from "react";
import { BellRing, Layers, Package } from "lucide-react";
import {
  Button,
  Card,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  useToast,
} from "@Team-Trung-Vu-Khang/eco-shared-ui";
import { StatusPill } from "@/components/common/ui-bits";
import {
  type CatalogProduct,
  applyFieldErrors,
  isStorefrontSyncError,
  useSetLowStockThresholds,
} from "@/features/shop-catalog";
import { getErrorMessage } from "@/lib/api-error";

const nf = new Intl.NumberFormat("vi-VN");

const STOCK_PILL = {
  out: { label: "Hết hàng", className: "bg-red-100 text-red-700" },
  low: { label: "Sắp hết", className: "bg-amber-100 text-amber-800" },
  in: { label: "Còn hàng", className: "bg-emerald-100 text-emerald-800" },
};
const stockOf = (qty: number, low: boolean) => (qty === 0 ? "out" : low ? "low" : "in");

/** "Tồn kho hiện tại" tab: total, per quy cách with its warning threshold */
export function ProductStockCard({ product: p }: { product: CatalogProduct }) {
  const [editing, setEditing] = useState(false);
  const total = p.variants.reduce((s, v) => s + v.inventoryQuantity, 0);
  const anyLow = p.variants.some((v) => v.lowStock);

  return (
    <div className="space-y-4">
      <Card className="flex flex-wrap items-center gap-4 p-4 sm:p-5">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Package className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-xs text-muted-foreground">Tổng hàng tồn</div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-2xl font-semibold tabular-nums">{nf.format(total)}</span>
            <StatusPill {...STOCK_PILL[stockOf(total, anyLow)]} />
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
          <BellRing className="mr-1.5 h-4 w-4" /> Cảnh báo hàng tồn
        </Button>
      </Card>

      <Card className="p-4 sm:p-5">
        <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold">
          <Layers className="h-4 w-4 text-muted-foreground" /> Theo quy cách
        </h4>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {p.variants.map((v) => (
            <div key={v.id} className="rounded-lg border bg-muted/30 p-3">
              <div className="truncate text-xs text-muted-foreground">{v.title}</div>
              <div
                className={`text-lg font-semibold tabular-nums ${v.inventoryQuantity === 0 ? "text-red-600" : v.lowStock ? "text-amber-700" : ""}`}
              >
                {nf.format(v.inventoryQuantity)}
              </div>
              <div className="text-[11px] text-muted-foreground">
                {v.lowStockThreshold != null ? `Cảnh báo ≤ ${nf.format(v.lowStockThreshold)}` : "Chưa đặt cảnh báo"}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <ThresholdDialog product={p} open={editing} onOpenChange={setEditing} />
    </div>
  );
}

/** PUT /products/{id}/low-stock-thresholds — empty = no warning */
function ThresholdDialog({ product, open, onOpenChange }: { product: CatalogProduct; open: boolean; onOpenChange: (o: boolean) => void }) {
  const { toast } = useToast();
  const save = useSetLowStockThresholds();
  const [values, setValues] = useState<Record<number, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const reset = () => {
    setValues(Object.fromEntries(product.variants.map((v) => [v.id, v.lowStockThreshold != null ? String(v.lowStockThreshold) : ""])));
    setErrors({});
  };

  const submit = async () => {
    const thresholds = product.variants.map((v) => {
      const raw = values[v.id]?.trim();
      return { variantId: v.id, threshold: raw ? Number(raw) : null };
    });
    if (thresholds.some((t) => t.threshold != null && (!Number.isInteger(t.threshold) || t.threshold < 0 || t.threshold > 100_000_000))) {
      toast({ variant: "destructive", title: "Ngưỡng phải là số nguyên từ 0 đến 100.000.000" });
      return;
    }
    try {
      await save.mutateAsync({ id: product.id, thresholds });
      toast({ title: "Đã lưu cảnh báo hàng tồn", description: product.title });
      onOpenChange(false);
    } catch (e) {
      const next: Record<string, string> = {};
      applyFieldErrors(e, ((name: string, err: { message: string }) => (next[name] = err.message)) as never);
      setErrors(next);
      toast({
        variant: "destructive",
        title: isStorefrontSyncError(e) ? "Chưa cập nhật được trang shop, vui lòng thử lại" : "Không thể lưu",
        description: getErrorMessage(e),
      });
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (o) reset();
        onOpenChange(o);
      }}
    >
      <DialogContent className="max-w-md" onOpenAutoFocus={reset}>
        <DialogHeader>
          <DialogTitle>Cảnh báo hàng tồn</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">Quy cách “Sắp hết” khi tồn kho ≤ ngưỡng. Để trống = không cảnh báo.</p>
        <div className="space-y-3">
          {product.variants.map((v, i) => (
            <div key={v.id} className="grid grid-cols-[minmax(0,1fr)_140px] items-center gap-3">
              <div className="min-w-0">
                <div className="truncate text-sm font-medium">{v.title}</div>
                <div className="text-xs text-muted-foreground">Tồn {nf.format(v.inventoryQuantity)}</div>
              </div>
              <div>
                <Input
                  type="number"
                  min={0}
                  placeholder="Không cảnh báo"
                  value={values[v.id] ?? ""}
                  onChange={(e) => setValues((s) => ({ ...s, [v.id]: e.target.value }))}
                />
                {errors[`thresholds.${i}.threshold`] && (
                  <p className="mt-1 text-xs text-destructive">{errors[`thresholds.${i}.threshold`]}</p>
                )}
              </div>
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" disabled={save.isPending} onClick={() => onOpenChange(false)}>
            Huỷ
          </Button>
          <Button disabled={save.isPending} onClick={() => void submit()}>
            {save.isPending ? "Đang lưu..." : "Lưu"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
