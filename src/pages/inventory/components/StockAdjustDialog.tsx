import { useState } from "react";
import { ArrowRight, Building2, Sprout } from "lucide-react";
import {
  Button,
  Combobox,
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
import { type InventoryItem, useAdjustStock } from "@/features/inventory";
import { useFarms } from "@/features/farm";
import { getErrorMessage } from "@/lib/api-error";
import { formatVnd } from "@/lib/format";

interface Props {
  item: InventoryItem | null;
  onOpenChange: (open: boolean) => void;
}

type ImportSource = "mevi" | "farm";

const SOURCES: {
  value: ImportSource;
  label: string;
  hint: string;
  icon: typeof Sprout;
}[] = [
  {
    value: "mevi",
    label: "Nhập từ Mevi",
    hint: "Cộng vào hàng tồn ngay",
    icon: Building2,
  },
  {
    value: "farm",
    label: "Nhập từ Nông hộ",
    hint: "Chờ chủ gian hàng duyệt",
    icon: Sprout,
  },
];

/** Nhập hàng from Mevi or a farm. Xuất only happens through orders */
export function StockAdjustDialog({ item, onOpenChange }: Props) {
  return (
    <Dialog open={!!item} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md [&>*]:min-w-0">
        {/* Mounted only while open, so each product starts from a clean form */}
        {item && <ImportBody item={item} onDone={() => onOpenChange(false)} />}
      </DialogContent>
    </Dialog>
  );
}

function ImportBody({
  item,
  onDone,
}: {
  item: InventoryItem;
  onDone: () => void;
}) {
  const { toast } = useToast();
  const adjust = useAdjustStock();
  const { data: farms } = useFarms();

  const isAgri = !!item.isAgricultural;
  const sources = item.sources ?? [];
  const baseUnit = item.baseUnit ?? "kg";

  // Older products have no variant list — fall back to their single packaging
  const variants = item.variants?.length
    ? item.variants.map((v) => v.name)
    : [item.packaging || "Mặc định"];
  const suppliers = item.suppliers ?? [];

  const [source, setSource] = useState<ImportSource>(
    isAgri ? "mevi" : item.source === "farm" ? "farm" : "mevi",
  );
  const [variant, setVariant] = useState(
    item.variant && variants.includes(item.variant)
      ? item.variant
      : variants[0],
  );
  const [regionId, setRegionId] = useState<number | undefined>(
    sources[0]?.regionId,
  );
  const [farmId, setFarmId] = useState(
    suppliers[0]?.farmId ?? item.farmId ?? "",
  );
  const [importPrice, setImportPrice] = useState(
    isAgri && sources[0]?.importPrice
      ? String(sources[0].importPrice)
      : suppliers[0]?.importPrice
        ? String(suppliers[0].importPrice)
        : "",
  );
  const [qty, setQty] = useState("");
  const [note, setNote] = useState("");

  const selectedSource = sources.find((s) => s.regionId === regionId);
  const selectedGardenStock =
    isAgri && regionId && item.gardenStock
      ? (item.gardenStock[regionId] ?? 0)
      : 0;

  const pickRegion = (idStr: string) => {
    const id = Number(idStr);
    setRegionId(id);
    const found = sources.find((s) => s.regionId === id);
    if (found?.importPrice) {
      setImportPrice(String(found.importPrice));
    }
  };

  // The product's own suppliers first, then every other farm
  const farmOptions = [...(farms ?? [])]
    .sort(
      (a, b) =>
        Number(suppliers.some((s) => s.farmId === b.id)) -
        Number(suppliers.some((s) => s.farmId === a.id)),
    )
    .map((f) => ({ label: `${f.name} · ${f.location}`, value: f.id }));

  const pickFarm = (id: string) => {
    setFarmId(id);
    const known = suppliers.find((s) => s.farmId === id)?.importPrice;
    if (known) setImportPrice(String(known));
  };

  const n = Number(qty);
  const price = Number(importPrice);
  const qtyValid = qty !== "" && Number.isInteger(n) && n > 0;
  const priceValid = importPrice !== "" && Number.isInteger(price) && price > 0;
  const farmValid = isAgri ? !!regionId : source === "mevi" || !!farmId;
  const valid = qtyValid && priceValid && farmValid && (isAgri || !!variant);

  const onSave = async () => {
    try {
      await adjust.mutateAsync({
        productId: item.productId,
        data: {
          type: "in",
          source: isAgri ? "mevi" : source,
          variant: isAgri ? undefined : variant,
          quantity: n,
          note,
          importPrice: price,
          ...(isAgri
            ? { regionId, unit: baseUnit }
            : source === "farm"
              ? { farmId }
              : {}),
        },
      });
      toast({
        title: `Đã nhập hàng: ${item.name}`,
        description: isAgri
          ? `+${n} ${baseUnit} vào ${selectedSource?.regionName || "vườn"} (tồn: ${selectedGardenStock} → ${selectedGardenStock + n})`
          : `Hàng tồn ${item.stock} → ${item.stock + n}`,
      });
      onDone();
    } catch (e) {
      toast({
        variant: "destructive",
        title: "Không thể nhập hàng",
        description: getErrorMessage(e),
      });
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Nhập hàng</DialogTitle>
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
          <div className="text-xs text-muted-foreground">Hàng tồn</div>
          <div className="font-semibold">{item.stock}</div>
        </div>
      </div>

      <div className="min-w-0 space-y-4">
        {isAgri ? (
          <>
            <div className="rounded-xl border border-primary/20 bg-primary/[0.04] p-3 text-xs text-primary space-y-0.5">
              <p className="font-semibold flex items-center gap-1.5">
                <Sprout className="h-4 w-4" /> Nhập kho Nông sản
              </p>
              <p className="text-muted-foreground">
                Mevi tự nhập hàng trực tiếp vào vườn nông hộ liên kết. Số lượng
                sẽ được cộng dồn vào tồn vườn ngay lập tức.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label>Vườn liên kết cung ứng</Label>
              {sources.length === 0 ? (
                <p className="text-xs text-destructive">
                  Sản phẩm này chưa được liên kết với vườn nào.
                </p>
              ) : (
                <Select
                  value={String(regionId ?? "")}
                  onValueChange={pickRegion}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Chọn vườn cung ứng" />
                  </SelectTrigger>
                  <SelectContent>
                    {sources.map((s) => {
                      const gStock = item.gardenStock?.[s.regionId] ?? 0;
                      return (
                        <SelectItem key={s.regionId} value={String(s.regionId)}>
                          {s.regionName || `Vườn #${s.regionId}`} ·{" "}
                          {s.farmName || "Nông hộ"} (tồn: {gStock} {baseUnit})
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="qty">Số lượng ({baseUnit})</Label>
                <Input
                  id="qty"
                  type="number"
                  min={1}
                  inputMode="numeric"
                  value={qty}
                  onChange={(e) => setQty(e.target.value)}
                  placeholder={`VD: 50`}
                  autoFocus
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="importPrice">Giá nhập / {baseUnit}</Label>
                <div className="relative">
                  <Input
                    id="importPrice"
                    type="number"
                    min={1}
                    inputMode="numeric"
                    value={importPrice}
                    onChange={(e) => setImportPrice(e.target.value)}
                    className="pr-12! [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-muted-foreground">
                    VND
                  </span>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-2">
              {SOURCES.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setSource(s.value)}
                  className={cn(
                    "flex flex-col items-start gap-1 rounded-xl border p-3 text-left transition",
                    source === s.value
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "hover:border-primary/50",
                  )}
                >
                  <span className="flex items-center gap-1.5 text-sm font-semibold">
                    <s.icon
                      className={cn(
                        "h-4 w-4",
                        source === s.value
                          ? "text-primary"
                          : "text-muted-foreground",
                      )}
                    />
                    {s.label}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {s.hint}
                  </span>
                </button>
              ))}
            </div>

            {source === "farm" && (
              <div className="space-y-1.5">
                <Label>Nông hộ</Label>
                <Combobox
                  options={farmOptions}
                  value={farmId}
                  onChange={pickFarm}
                  placeholder="Chọn nông hộ / HTX"
                  searchPlaceholder="Tìm theo tên, địa phương..."
                  emptyText="Không tìm thấy nông hộ"
                  className="w-full min-w-0 max-w-full overflow-hidden"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Quy cách</Label>
                <Select value={variant} onValueChange={setVariant}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn quy cách" />
                  </SelectTrigger>
                  <SelectContent>
                    {variants.map((v) => (
                      <SelectItem key={v} value={v}>
                        {v}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="qty">Số lượng</Label>
                <Input
                  id="qty"
                  type="number"
                  min={1}
                  inputMode="numeric"
                  value={qty}
                  onChange={(e) => setQty(e.target.value)}
                  autoFocus
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="importPrice">Giá nhập / {variant}</Label>
              <div className="relative">
                <Input
                  id="importPrice"
                  type="number"
                  min={1}
                  inputMode="numeric"
                  value={importPrice}
                  onChange={(e) => setImportPrice(e.target.value)}
                  className="pr-20! [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
                />
                <span className="pointer-events-none absolute inset-y-0 right-9 flex items-center text-sm text-muted-foreground">
                  VND
                </span>
              </div>
            </div>
          </>
        )}

        {qtyValid && (
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-muted/60 px-3 py-2 text-sm">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              {isAgri ? (
                <>
                  Tồn vườn {selectedGardenStock}{" "}
                  <ArrowRight className="h-3.5 w-3.5" />
                  <span className="font-semibold text-foreground">
                    {selectedGardenStock + n} {baseUnit}
                  </span>
                </>
              ) : (
                <>
                  Hàng tồn {item.stock} <ArrowRight className="h-3.5 w-3.5" />
                  <span className="font-semibold text-foreground">
                    {item.stock + n}
                  </span>
                  {source === "farm" && (
                    <span className="text-xs">(sau khi duyệt)</span>
                  )}
                </>
              )}
            </span>
            {priceValid && (
              <span className="font-semibold tabular-nums">
                Thành tiền {formatVnd(n * price)}
              </span>
            )}
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
              source === "farm"
                ? "VD: Lô thu hoạch tháng 10"
                : "VD: Nhập lô mới"
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
          disabled={!valid || adjust.isPending}
        >
          {source === "farm" ? "Gửi duyệt" : "Nhập hàng"}
        </Button>
      </DialogFooter>
    </>
  );
}
