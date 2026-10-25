import { useState } from "react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  cn,
  useToast,
} from "@Team-Trung-Vu-Khang/eco-shared-ui";
import placeholder from "@/assets/images/image-placeholder.webp";
import { type InventoryItem, useSetVariantThresholds } from "@/features/inventory";
import { getErrorMessage } from "@/lib/api-error";

interface Props {
  item: InventoryItem | null;
  onOpenChange: (open: boolean) => void;
}

/** "Sắp hết" threshold per quy cách */
export function StockAlertDialog({ item, onOpenChange }: Props) {
  return (
    <Dialog open={!!item} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md [&>*]:min-w-0">
        {item && <AlertBody item={item} onDone={() => onOpenChange(false)} />}
      </DialogContent>
    </Dialog>
  );
}

function AlertBody({ item, onDone }: { item: InventoryItem; onDone: () => void }) {
  const { toast } = useToast();
  const save = useSetVariantThresholds();
  // Older products have no variant list — fall back to their single packaging
  const names = item.variants?.length ? item.variants.map((v) => v.name) : [item.packaging || "Mặc định"];
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(names.map((n) => [n, String(item.variantThresholds?.[n] ?? item.lowStockThreshold)])),
  );

  const valid = names.every((n) => values[n] !== "" && Number.isInteger(Number(values[n])) && Number(values[n]) >= 0);

  const onSave = async () => {
    try {
      await save.mutateAsync({
        productId: item.productId,
        value: Object.fromEntries(names.map((n) => [n, Number(values[n])])),
      });
      toast({ title: "Đã lưu cảnh báo hàng tồn", description: item.name });
      onDone();
    } catch (e) {
      toast({ variant: "destructive", title: "Không thể lưu", description: getErrorMessage(e) });
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Cảnh báo hàng tồn</DialogTitle>
        <DialogDescription>Báo "Sắp hết" khi hàng tồn của quy cách nhỏ hơn hoặc bằng ngưỡng.</DialogDescription>
      </DialogHeader>

      <div className="flex items-center gap-3 rounded-lg border bg-muted/40 p-3">
        <img src={item.images[0] || placeholder} alt="" className="h-10 w-10 shrink-0 rounded-md border object-cover" />
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-medium">{item.name}</div>
          <div className="font-mono text-xs text-muted-foreground">{item.sku}</div>
        </div>
      </div>

      <div className="divide-y rounded-lg border">
        <div className="grid grid-cols-[minmax(0,1fr)_5rem_7rem] gap-3 px-3 py-2 text-xs font-medium text-muted-foreground">
          <span>Quy cách</span>
          <span className="text-right">Hàng tồn</span>
          <span>Cảnh báo khi ≤</span>
        </div>
        {names.map((n) => {
          const qty = item.variantStock?.[n] ?? 0;
          const low = values[n] !== "" && qty <= Number(values[n]);
          return (
            <div key={n} className="grid grid-cols-[minmax(0,1fr)_5rem_7rem] items-center gap-3 px-3 py-2">
              <span className="truncate text-sm font-medium">{n}</span>
              <span className={cn("text-right text-sm font-semibold tabular-nums", low ? "text-amber-600" : "text-foreground")}>
                {qty}
              </span>
              <Input
                type="number"
                min={0}
                inputMode="numeric"
                value={values[n]}
                onChange={(e) => setValues((v) => ({ ...v, [n]: e.target.value }))}
                aria-label={`Ngưỡng cảnh báo ${n}`}
              />
            </div>
          );
        })}
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onDone}>
          Huỷ
        </Button>
        <Button onClick={() => void onSave()} disabled={!valid || save.isPending}>
          Lưu cảnh báo
        </Button>
      </DialogFooter>
    </>
  );
}
