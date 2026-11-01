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
  STOCK_LIMITS,
  fieldErrorMessage,
  getFieldErrors,
  isStorefrontSyncError,
  useCatalogProduct,
  useSetLowStockThresholds,
} from "@/features/shop-catalog";
import { getErrorMessage } from "@/lib/api-error";

const nf = new Intl.NumberFormat("vi-VN");

/** "Cảnh báo hàng tồn" (§2.6): per quy cách threshold, empty = no warning. `productId` null = closed */
export function LowStockThresholdDialog({
  productId,
  focusVariantId,
  onOpenChange,
}: {
  productId: number | null;
  /** Highlight one quy cách (e.g. opened from an inventory row) */
  focusVariantId?: number;
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
  focusVariantId?: number;
  save: ReturnType<typeof useSetLowStockThresholds>;
  onDone: () => void;
}) {
  const { toast } = useToast();
  const [values, setValues] = useState<Record<number, string>>(() =>
    Object.fromEntries(product.variants.map((v) => [v.id, v.lowStockThreshold != null ? String(v.lowStockThreshold) : ""])),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submit = async () => {
    const thresholds = product.variants.map((v) => {
      const raw = values[v.id]?.trim();
      return { variantId: v.id, threshold: raw ? Number(raw) : null };
    });
    if (thresholds.some((t) => t.threshold != null && (!Number.isInteger(t.threshold) || t.threshold < 0 || t.threshold > STOCK_LIMITS.quantity))) {
      toast({ variant: "destructive", title: "Ngưỡng phải là số nguyên từ 0 đến 100.000.000" });
      return;
    }
    setErrors({});
    try {
      await save.mutateAsync({ id: product.id, thresholds });
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
        <p className="text-sm text-muted-foreground">Quy cách “Sắp hết” khi tồn kho ≤ ngưỡng. Để trống = không cảnh báo.</p>
      </div>
      <div className="space-y-3">
        {product.variants.map((v, i) => (
          <div
            key={v.id}
            className={`grid grid-cols-[minmax(0,1fr)_140px] items-center gap-3 rounded-lg px-2 py-1.5 ${v.id === focusVariantId ? "bg-primary/5 ring-1 ring-primary/30" : ""}`}
          >
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
                disabled={save.isPending}
                autoFocus={v.id === focusVariantId}
                onChange={(e) => setValues((s) => ({ ...s, [v.id]: e.target.value }))}
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
