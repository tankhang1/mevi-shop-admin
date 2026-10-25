import { useState } from "react";
import { ArrowRight } from "lucide-react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Textarea,
  cn,
  useToast,
} from "@Team-Trung-Vu-Khang/eco-shared-ui";
import placeholder from "@/assets/images/image-placeholder.webp";
import {
  type InventoryItem,
  MOVEMENT_SOURCE,
  MOVEMENT_TYPE,
  type MovementSource,
  type MovementType,
  useAdjustStock,
  useSetLowStockThreshold,
} from "@/features/inventory";
import { getErrorMessage } from "@/lib/api-error";

interface Props {
  item: InventoryItem | null;
  onOpenChange: (open: boolean) => void;
}

const TYPES: MovementType[] = ["in", "out", "adjust"];
const QTY_LABEL: Record<MovementType, string> = {
  in: "Số lượng nhập",
  out: "Số lượng xuất",
  adjust: "Số lượng thực tế sau kiểm kê",
};

/** Record a stock movement (nhập / xuất / kiểm kê) and tune the low-stock threshold */
export function StockAdjustDialog({ item, onOpenChange }: Props) {
  return (
    <Dialog open={!!item} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        {/* Mounted only while open, so each product starts from a clean form */}
        {item && <AdjustBody item={item} onDone={() => onOpenChange(false)} />}
      </DialogContent>
    </Dialog>
  );
}

function AdjustBody({
  item,
  onDone,
}: {
  item: InventoryItem;
  onDone: () => void;
}) {
  const { toast } = useToast();
  const adjust = useAdjustStock();
  const setThreshold = useSetLowStockThreshold();
  const [type, setType] = useState<MovementType>("in");
  const fromFarm = item.source === "farm";
  const [source, setSource] = useState<MovementSource>(
    fromFarm ? "farm" : "external",
  );
  // Farm stock is additive only — no overwrite by stock count
  const types = fromFarm ? TYPES.filter((t) => t !== "adjust") : TYPES;
  const [qty, setQty] = useState("");
  const [note, setNote] = useState("");
  const [threshold, setThresholdValue] = useState(
    String(item.lowStockThreshold),
  );

  const n = Number(qty);
  const valid =
    qty !== "" && Number.isInteger(n) && n >= 0 && (type === "adjust" || n > 0);
  const after = !valid
    ? null
    : type === "in"
      ? item.stock + n
      : type === "out"
        ? item.stock - n
        : n;
  const error =
    after !== null && after < 0
      ? `Không đủ hàng để xuất (tồn kho: ${item.stock})`
      : after === item.stock
        ? "Tồn kho không thay đổi"
        : null;

  const onSave = async () => {
    try {
      await adjust.mutateAsync({
        productId: item.id,
        data: {
          type,
          quantity: n,
          note,
          source: type === "in" ? source : undefined,
        },
      });
      toast(
        fromFarm
          ? {
              title: "Đã gửi yêu cầu chờ duyệt",
              description: `${MOVEMENT_TYPE[type].label} ${n} · ${item.name}`,
            }
          : {
              title: `${MOVEMENT_TYPE[type].label}: ${item.name}`,
              description: `Tồn kho ${item.stock} → ${after}`,
            },
      );
      onDone();
    } catch (e) {
      toast({
        variant: "destructive",
        title: "Không thể cập nhật",
        description: getErrorMessage(e),
      });
    }
  };

  const onSaveThreshold = async () => {
    try {
      await setThreshold.mutateAsync({
        productId: item.id,
        value: Number(threshold),
      });
      toast({
        title: "Đã lưu ngưỡng cảnh báo",
        description: `${item.name}: ≤ ${threshold}`,
      });
    } catch (e) {
      toast({
        variant: "destructive",
        title: "Không thể lưu",
        description: getErrorMessage(e),
      });
    }
  };

  const thresholdValid =
    threshold !== "" &&
    Number.isInteger(Number(threshold)) &&
    Number(threshold) >= 0;

  return (
    <>
      <DialogHeader>
        <DialogTitle>Cập nhật tồn kho</DialogTitle>
      </DialogHeader>

      <div className="flex items-center gap-3 rounded-lg border bg-muted/40 p-3">
        <img
          src={item.images[0] || placeholder}
          alt=""
          className="h-10 w-10 shrink-0 rounded-md border object-cover"
        />
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-medium">{item.name}</div>
          <div className="font-mono text-xs text-muted-foreground">
            {item.sku}
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-muted-foreground">Tồn kho</div>
          <div className="font-semibold">{item.stock}</div>
        </div>
      </div>

      <div className="space-y-4">
        {fromFarm && (
          <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
            Sản phẩm từ nông hộ: thay đổi được <b>cộng dồn</b> vào tồn kho và
            chỉ áp dụng sau khi chủ gian hàng duyệt.
            {!!item.pendingCount &&
              ` Đang có ${item.pendingCount} yêu cầu chờ duyệt.`}
          </p>
        )}
        <div
          className={cn(
            "grid gap-1 rounded-lg bg-muted p-1",
            types.length === 3 ? "grid-cols-3" : "grid-cols-2",
          )}
        >
          {types.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={cn(
                "rounded-md py-1.5 text-sm font-medium transition-colors",
                type === t
                  ? "bg-background shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {MOVEMENT_TYPE[t].label}
            </button>
          ))}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="qty">{QTY_LABEL[type]}</Label>
          <Input
            id="qty"
            type="number"
            min={0}
            inputMode="numeric"
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            autoFocus
          />
          {after !== null && (
            <p
              className={cn(
                "flex items-center gap-1.5 text-sm",
                error ? "text-destructive" : "text-muted-foreground",
              )}
            >
              {error ?? (
                <>
                  Tồn kho {item.stock} <ArrowRight className="h-3.5 w-3.5" />
                  <span className="font-semibold text-foreground">{after}</span>
                </>
              )}
            </p>
          )}
        </div>

        {type === "in" && !fromFarm && (
          <div className="space-y-1.5">
            <Label>Nguồn nhập</Label>
            <div className="grid grid-cols-2 gap-1 rounded-lg bg-muted p-1">
              {(["external", "farm"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSource(s)}
                  className={cn(
                    "rounded-md py-1.5 text-sm font-medium transition-colors",
                    source === s
                      ? "bg-background shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {MOVEMENT_SOURCE[s]}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="note">Ghi chú</Label>
          <Textarea
            id="note"
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={
              type === "in"
                ? "VD: Nhập lô mới từ vườn"
                : type === "out"
                  ? "VD: Xuất đơn sỉ, hàng hỏng"
                  : "VD: Kiểm kê cuối tháng"
            }
          />
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onDone}>
          Huỷ
        </Button>
        <Button
          onClick={() => void onSave()}
          disabled={!valid || !!error || adjust.isPending}
        >
          {fromFarm ? "Gửi duyệt" : "Xác nhận"}
        </Button>
      </DialogFooter>

      <div className="flex items-end gap-2 border-t pt-4">
        <div className="flex-1 space-y-1.5">
          <Label htmlFor="threshold">Cảnh báo sắp hết khi tồn kho ≤</Label>
          <Input
            id="threshold"
            type="number"
            min={0}
            value={threshold}
            onChange={(e) => setThresholdValue(e.target.value)}
          />
        </div>
        <Button
          variant="outline"
          onClick={() => void onSaveThreshold()}
          disabled={
            !thresholdValid ||
            Number(threshold) === item.lowStockThreshold ||
            setThreshold.isPending
          }
        >
          Lưu ngưỡng
        </Button>
      </div>
    </>
  );
}
