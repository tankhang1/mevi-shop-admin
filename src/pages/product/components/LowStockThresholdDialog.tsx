import { useState } from "react";
import { Loader2 } from "lucide-react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  useToast,
} from "@Team-Trung-Vu-Khang/eco-shared-ui";
import { EmptyBlock, LoadingBlock } from "@/components/common/ui-bits";
import {
  type CatalogProduct,
  SELL_UNIT_SHORT,
  STOCK_LIMITS,
  fieldErrorMessage,
  getFieldErrors,
  isStorefrontSyncError,
  useCatalogProduct,
  useSetLowStockThresholds,
} from "@/features/shop-catalog";
import { getErrorMessage } from "@/lib/api-error";

const nf = new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 3 });
const UNIT = "unit";

/** "Cảnh báo hàng tồn" (§2.6): per quy cách threshold, empty = no warning. `productId` null = closed */
export function LowStockThresholdDialog({
  productId,
  focusVariantId,
  onOpenChange,
}: {
  productId: number | null;
  /** Highlight one row (e.g. opened from an inventory row); null = đơn vị tính */
  focusVariantId?: number | null;
  onOpenChange: (open: boolean) => void;
}) {
  const { data: product, isLoading } = useCatalogProduct(productId ?? undefined);
  const save = useSetLowStockThresholds();
  return (
    <Dialog open={productId != null} onOpenChange={(o) => !save.isPending && onOpenChange(o)}>
      <DialogContent className="max-w-md">
        {isLoading ? (
          <LoadingBlock />
        ) : !product ? (
          <EmptyBlock>Không tìm thấy sản phẩm.</EmptyBlock>
        ) : (
          <Body key={product.id} product={product} focusVariantId={focusVariantId} save={save} onDone={() => onOpenChange(false)} />
        )}
      </DialogContent>
    </Dialog>
  );
}

function Body({
  product,
  focusVariantId,
  save,
  onDone,
}: {
  product: CatalogProduct;
  focusVariantId?: number | null;
  save: ReturnType<typeof useSetLowStockThresholds>;
  onDone: () => void;
}) {
  const { toast } = useToast();
  // Đơn vị tính row first (variantId null, decimals allowed), then quy cách
  const rows = [
    ...(product.baseUnit
      ? [
          {
            key: UNIT,
            variantId: null,
            title: `Đơn vị tính (${SELL_UNIT_SHORT[product.baseUnit]})`,
            stock: product.unitInventoryQuantity ?? 0,
            threshold: product.unitLowStockThreshold,
            decimal: true,
          },
        ]
      : []),
    ...product.variants.map((v) => ({
      key: String(v.id),
      variantId: v.id as number | null,
      title: v.title,
      stock: v.inventoryQuantity,
      threshold: v.lowStockThreshold ?? null,
      decimal: false,
    })),
  ];
  const focusKey = focusVariantId === null ? UNIT : focusVariantId != null ? String(focusVariantId) : undefined;
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(rows.map((r) => [r.key, r.threshold != null ? String(r.threshold) : ""])),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submit = async () => {
    const thresholds = rows.map((r) => {
      const raw = values[r.key]?.trim();
      return { variantId: r.variantId, threshold: raw ? Number(raw) : null, raw, decimal: r.decimal };
    });
    const bad = thresholds.some(
      (t) =>
        t.threshold != null &&
        (t.threshold < 0 ||
          t.threshold > STOCK_LIMITS.quantity ||
          (t.decimal ? !/^\d+(\.\d{1,3})?$/.test(t.raw!) : !Number.isInteger(t.threshold))),
    );
    if (bad) {
      toast({ variant: "destructive", title: "Ngưỡng từ 0 đến 100.000.000 — quy cách là số nguyên, đơn vị tính tối đa 3 số lẻ" });
      return;
    }
    setErrors({});
    try {
      await save.mutateAsync({ id: product.id, thresholds: thresholds.map(({ variantId, threshold }) => ({ variantId, threshold })) });
      toast({ title: "Đã lưu cảnh báo hàng tồn", description: product.title });
      onDone();
    } catch (e) {
      const fe = getFieldErrors(e);
      setErrors(Object.fromEntries(Object.entries(fe).map(([k, r]) => [k.replace(/\[(\d+)\]/g, ".$1"), fieldErrorMessage(r)])));
      toast({
        variant: "destructive",
        title: isStorefrontSyncError(e) ? "Chưa cập nhật được trang shop, vui lòng thử lại" : "Không thể lưu",
        description: getErrorMessage(e),
      });
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Cảnh báo hàng tồn</DialogTitle>
      </DialogHeader>
      <div>
        <p className="truncate text-sm font-medium">{product.title}</p>
        <p className="text-sm text-muted-foreground">“Sắp hết” khi tồn kho riêng ≤ ngưỡng. Để trống = không cảnh báo.</p>
      </div>
      <div className="space-y-3">
        {rows.map((r, i) => (
          <div
            key={r.key}
            className={`grid grid-cols-[minmax(0,1fr)_140px] items-center gap-3 rounded-lg px-2 py-1.5 ${r.key === focusKey ? "bg-primary/5 ring-1 ring-primary/30" : ""}`}
          >
            <div className="min-w-0">
              <div className="truncate text-sm font-medium">{r.title}</div>
              <div className="text-xs text-muted-foreground">Tồn {nf.format(r.stock)}</div>
            </div>
            <div>
              <Input
                type="number"
                min={0}
                step={r.decimal ? "0.001" : "1"}
                placeholder="Không cảnh báo"
                value={values[r.key] ?? ""}
                disabled={save.isPending}
                autoFocus={r.key === focusKey}
                onChange={(e) => setValues((s) => ({ ...s, [r.key]: e.target.value }))}
              />
              {errors[`thresholds.${i}.threshold`] && <p className="mt-1 text-xs text-destructive">{errors[`thresholds.${i}.threshold`]}</p>}
            </div>
          </div>
        ))}
      </div>
      <DialogFooter>
        <Button variant="outline" disabled={save.isPending} onClick={onDone}>
          Huỷ
        </Button>
        <Button disabled={save.isPending} onClick={() => void submit()}>
          {save.isPending && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
          {save.isPending ? "Đang lưu..." : "Lưu"}
        </Button>
      </DialogFooter>
    </>
  );
}
