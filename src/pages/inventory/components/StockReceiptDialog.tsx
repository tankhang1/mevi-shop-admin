import { useState } from "react";
import { ArrowRight, Building2, Loader2, SlidersHorizontal, Sprout } from "lucide-react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
  cn,
  useToast,
} from "@Team-Trung-Vu-Khang/eco-shared-ui";
import placeholder from "@/assets/images/image-placeholder.webp";
import { EmptyBlock, LoadingBlock } from "@/components/common/ui-bits";
import {
  type CatalogProduct,
  SELL_UNIT_SHORT,
  STOCK_LIMITS,
  fieldErrorMessage,
  getFieldErrors,
  isStorefrontSyncError,
  useCatalogProduct,
  useCreateStockAdjustment,
  useCreateStockReceipt,
} from "@/features/shop-catalog";
import { getErrorMessage } from "@/lib/api-error";
import { formatVnd } from "@/lib/format";

export type StockDialogMode = "MEVI" | "FARM" | "ADJUSTMENT";

interface Props {
  /** Product to stock; null = closed */
  productId: number | null;
  /** Preselect a quy cách (e.g. from an inventory row); null = đơn vị tính */
  variantId?: number | null;
  mode?: StockDialogMode;
  onOpenChange: (open: boolean) => void;
}

const MODES: { value: StockDialogMode; label: string; hint: string; icon: typeof Sprout }[] = [
  { value: "MEVI", label: "Nhập từ Mevi", hint: "Cộng tồn kho ngay", icon: Building2 },
  { value: "FARM", label: "Nhập từ Nông hộ", hint: "Chờ duyệt mới cộng", icon: Sprout },
  { value: "ADJUSTMENT", label: "Điều chỉnh", hint: "Kiểm kê, hàng hỏng...", icon: SlidersHorizontal },
];

/** Nhập hàng (§2.5.1) / điều chỉnh tồn kho (§2.5.2) for one product */
export function StockReceiptDialog({ productId, variantId, mode, onOpenChange }: Props) {
  const { data: product, isLoading } = useCatalogProduct(productId ?? undefined);
  return (
    <Dialog open={productId != null} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md [&>*]:min-w-0">
        {isLoading ? (
          <LoadingBlock />
        ) : !product ? (
          <EmptyBlock>Không tìm thấy sản phẩm.</EmptyBlock>
        ) : (
          // Keyed so each product starts from a clean form
          <Body key={product.id} product={product} variantId={variantId} initialMode={mode} onDone={() => onOpenChange(false)} />
        )}
      </DialogContent>
    </Dialog>
  );
}

const sourceKey = (s: CatalogProduct["supplySources"][number]) => String(s.productionZone.id);

/** Select value of the đơn vị tính option */
const UNIT = "unit";

/** What a phiếu targets: one quy cách, or the product's đơn vị tính */
interface StockItem {
  key: string;
  variantId: number | null;
  title: string;
  stock: number;
  /** đơn vị tính allows 3 decimals; quy cách must be integers */
  decimal: boolean;
}

const stockItems = (p: CatalogProduct): StockItem[] => [
  ...(p.baseUnit
    ? [
        {
          key: UNIT,
          variantId: null,
          title: `Đơn vị tính (${SELL_UNIT_SHORT[p.baseUnit]})`,
          stock: p.unitInventoryQuantity ?? 0,
          decimal: true,
        },
      ]
    : []),
  ...p.variants.map((x) => ({ key: String(x.id), variantId: x.id, title: x.title, stock: x.inventoryQuantity, decimal: false })),
];

const DECIMAL_3 = /^-?\d+(\.\d{1,3})?$/;
/** Avoid 0.1 + 0.2 noise in the "after" preview */
const round3 = (n: number) => Math.round(n * 1000) / 1000;

function Body({
  product: p,
  variantId,
  initialMode,
  onDone,
}: {
  product: CatalogProduct;
  variantId?: number | null;
  initialMode?: StockDialogMode;
  onDone: () => void;
}) {
  const { toast } = useToast();
  const receipt = useCreateStockReceipt();
  const adjust = useCreateStockAdjustment();
  const canFarm = p.agricultural && p.supplySources.length > 0;

  const [mode, setMode] = useState<StockDialogMode>(initialMode === "FARM" && !canFarm ? "MEVI" : (initialMode ?? "MEVI"));
  const items = stockItems(p);
  const [variant, setVariant] = useState(
    variantId === null ? UNIT : String(variantId ?? p.variants[0]?.id ?? (p.baseUnit ? UNIT : "")),
  );
  const [source, setSource] = useState(p.supplySources[0] ? sourceKey(p.supplySources[0]) : "");
  const [qty, setQty] = useState("");
  const [unitCost, setUnitCost] = useState("");
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const v = items.find((x) => x.key === variant);
  const s = p.supplySources.find((x) => sourceKey(x) === source);
  const isAdjust = mode === "ADJUSTMENT";
  const n = Number(qty);
  const cost = Number(unitCost);
  const max = STOCK_LIMITS.quantity;

  const qtyShapeOk = v?.decimal ? DECIMAL_3.test(qty) : Number.isInteger(n);
  const qtyValid = qty !== "" && qtyShapeOk && (isAdjust ? n !== 0 && Math.abs(n) <= max : n > 0 && n <= max);
  const costValid = isAdjust || (unitCost !== "" && Number.isInteger(cost) && cost >= 0);
  const valid = !!v && qtyValid && costValid && (mode !== "FARM" || !!s) && (!isAdjust || !!note.trim());
  const after = v ? round3(v.stock + (qtyValid ? n : 0)) : 0;
  const pending = receipt.isPending || adjust.isPending;

  const onSave = async () => {
    if (!v) return;
    setErrors({});
    try {
      if (isAdjust) {
        await adjust.mutateAsync({ productId: p.id, data: { variantId: v.variantId, quantity: n, note: note.trim() } });
        toast({ title: "Đã điều chỉnh tồn kho", description: `${p.title} · ${v.title}: ${v.stock} → ${after}` });
      } else {
        await receipt.mutateAsync({
          productId: p.id,
          data: {
            variantId: v.variantId,
            source: mode,
            ...(mode === "FARM" && s && { productionZoneId: s.productionZone.id }),
            quantity: n,
            unitCost: cost,
            note: note.trim() || null,
          },
        });
        toast({
          title: mode === "FARM" ? "Đã tạo phiếu nhập, chờ duyệt" : "Đã nhập hàng",
          description: `${p.title} · ${v.title}: +${n}`,
        });
      }
      onDone();
    } catch (e) {
      const fe = getFieldErrors(e);
      setErrors(Object.fromEntries(Object.entries(fe).map(([k, r]) => [k, fieldErrorMessage(r)])));
      toast({
        variant: "destructive",
        title: isStorefrontSyncError(e) ? "Chưa cập nhật được trang shop, vui lòng thử lại" : "Không thể lưu phiếu",
        description: Object.keys(fe).length ? "Kiểm tra lại các trường được đánh dấu." : getErrorMessage(e),
      });
    }
  };

  const err = (key: string) => errors[key] && <p className="text-xs text-destructive">{errors[key]}</p>;

  return (
    <>
      <DialogHeader>
        <DialogTitle>{isAdjust ? "Điều chỉnh tồn kho" : "Nhập hàng"}</DialogTitle>
      </DialogHeader>

      <div className="flex items-center gap-3 rounded-lg border bg-muted/40 p-3">
        <img src={p.media[0]?.thumbnailUrl || p.media[0]?.url || placeholder} alt="" className="h-10 w-10 shrink-0 rounded-md border object-cover" />
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-medium">{p.title}</div>
          <div className="font-mono text-xs text-muted-foreground">{p.code}</div>
        </div>
      </div>

      <div className="min-w-0 space-y-4">
        <div className="grid grid-cols-3 gap-2">
          {MODES.map((m) => {
            const disabled = m.value === "FARM" && !canFarm;
            return (
              <button
                key={m.value}
                type="button"
                disabled={disabled}
                title={disabled ? "Chỉ sản phẩm nông sản có nguồn cung mới nhập từ nông hộ" : undefined}
                onClick={() => setMode(m.value)}
                className={cn(
                  "flex flex-col items-start gap-1 rounded-xl border p-2.5 text-left transition disabled:cursor-not-allowed disabled:opacity-40",
                  mode === m.value ? "border-primary bg-primary/5 ring-1 ring-primary" : "hover:border-primary/50",
                )}
              >
                <span className="flex items-center gap-1.5 text-xs font-semibold">
                  <m.icon className={cn("h-3.5 w-3.5", mode === m.value ? "text-primary" : "text-muted-foreground")} />
                  {m.label}
                </span>
                <span className="text-[11px] leading-tight text-muted-foreground">{m.hint}</span>
              </button>
            );
          })}
        </div>

        {mode === "FARM" && (
          <div className="space-y-1.5">
            <Label>Nông hộ · Vườn</Label>
            <Select value={source} onValueChange={setSource}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Chọn nguồn cung" />
              </SelectTrigger>
              <SelectContent>
                {p.supplySources.map((x) => (
                  <SelectItem key={sourceKey(x)} value={sourceKey(x)}>
                    {x.workspace.name ?? "—"} · {x.productionZone.name ?? `Vườn #${x.productionZone.id} (đã xoá)`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {err("productionZoneId")}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>{p.baseUnit ? "Đơn vị tính / quy cách" : "Quy cách"}</Label>
            <Select value={variant} onValueChange={setVariant}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn" />
              </SelectTrigger>
              <SelectContent>
                {items.map((x) => (
                  <SelectItem key={x.key} value={x.key}>
                    {x.title} (tồn {x.stock})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {err("variantId")}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="qty">{isAdjust ? "Số lượng thay đổi" : "Số lượng"}</Label>
            <Input
              id="qty"
              type="number"
              inputMode={v?.decimal ? "decimal" : "numeric"}
              step={v?.decimal ? "0.001" : "1"}
              min={isAdjust ? undefined : 0}
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              placeholder={v?.decimal ? (isAdjust ? "VD: -1.5" : "VD: 12.5") : isAdjust ? "VD: -2 hoặc 5" : "VD: 20"}
              autoFocus
            />
            {err("quantity")}
          </div>
        </div>

        {!isAdjust && (
          <div className="space-y-1.5">
            <Label htmlFor="unitCost">
              Giá nhập / {v ? (v.variantId === null && p.baseUnit ? SELL_UNIT_SHORT[p.baseUnit] : v.title) : "quy cách"}
              {mode === "FARM" && <span className="ml-1 text-xs font-normal text-muted-foreground">(đề xuất, chốt khi duyệt)</span>}
            </Label>
            <div className="relative">
              <Input
                id="unitCost"
                type="number"
                min={0}
                inputMode="numeric"
                value={unitCost}
                onChange={(e) => setUnitCost(e.target.value)}
                className="pr-20! [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
              />
              <span className="pointer-events-none absolute inset-y-0 right-9 flex items-center text-sm text-muted-foreground">VND</span>
            </div>
            {err("unitCost")}
          </div>
        )}

        {v && qtyValid && (
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-muted/60 px-3 py-2 text-sm">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              Tồn {v.title} {v.stock} <ArrowRight className="h-3.5 w-3.5" />
              <span className={cn("font-semibold", after < 0 ? "text-destructive" : "text-foreground")}>{after}</span>
              {mode === "FARM" && <span className="text-xs">(sau khi duyệt)</span>}
            </span>
            {!isAdjust && costValid && <span className="font-semibold tabular-nums">Thành tiền {formatVnd(Math.round(n * cost))}</span>}
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="note">
            {isAdjust ? "Lý do" : "Ghi chú"}
            {isAdjust && <span className="text-destructive"> *</span>}
          </Label>
          <Textarea
            id="note"
            rows={2}
            maxLength={STOCK_LIMITS.note}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={isAdjust ? "VD: Kiểm kê cuối tháng — 2 bao rách" : "VD: Lô thu hoạch tháng 10"}
          />
          {err("note")}
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" disabled={pending} onClick={onDone}>
          Huỷ
        </Button>
        <Button onClick={() => void onSave()} disabled={!valid || pending}>
          {pending && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
          {mode === "FARM" ? "Tạo phiếu chờ duyệt" : isAdjust ? "Điều chỉnh" : "Nhập hàng"}
        </Button>
      </DialogFooter>
    </>
  );
}
