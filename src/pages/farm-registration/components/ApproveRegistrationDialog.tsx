import { useState } from "react";
import {
  Button,
  Checkbox,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  useToast,
} from "@Team-Trung-Vu-Khang/eco-shared-ui";
import placeholder from "@/assets/images/image-placeholder.webp";
import {
  type FarmRegistration,
  useApproveRegistration,
} from "@/features/farm-registration";
import { useProductGroups } from "@/features/product-group";
import { getErrorMessage } from "@/lib/api-error";
import { formatVnd } from "@/lib/format";

interface Props {
  registration: FarmRegistration | null;
  onOpenChange: (open: boolean) => void;
}

/** Approve = create the product (SKU, final price, groups) with the farm's quantity as opening stock */
export function ApproveRegistrationDialog({
  registration,
  onOpenChange,
}: Props) {
  return (
    <Dialog open={!!registration} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        {registration && (
          <Body r={registration} onDone={() => onOpenChange(false)} />
        )}
      </DialogContent>
    </Dialog>
  );
}

const skuFrom = (name: string) =>
  name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/gi, "d")
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 20);

function Body({ r, onDone }: { r: FarmRegistration; onDone: () => void }) {
  const { toast } = useToast();
  const approve = useApproveRegistration();
  const { data: groups } = useProductGroups({ size: 200, shopId: r.shopId });
  const [sku, setSku] = useState(() => skuFrom(r.name));
  const [price, setPrice] = useState(String(r.proposedPrice));
  const [salePrice, setSalePrice] = useState("");
  const [groupIds, setGroupIds] = useState<string[]>([]);

  const p = Number(price);
  const sp = salePrice ? Number(salePrice) : null;
  const error = !sku.trim()
    ? "Vui lòng nhập mã sản phẩm"
    : !(p > 0)
      ? "Giá bán không hợp lệ"
      : sp !== null && !(sp > 0 && sp < p)
        ? "Giá khuyến mãi phải nhỏ hơn giá bán"
        : null;

  const onApprove = async () => {
    try {
      await approve.mutateAsync({
        id: r.id,
        data: {
          sku: sku.trim(),
          price: p,
          salePrice: sp,
          productGroupIds: groupIds,
        },
      });
      toast({
        title: "Đã duyệt — sản phẩm đã được tạo",
        description: `${r.name} · tồn kho ban đầu ${r.quantity}`,
      });
      onDone();
    } catch (e) {
      toast({
        variant: "destructive",
        title: "Không thể duyệt",
        description: getErrorMessage(e),
      });
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Duyệt sản phẩm từ nông hộ</DialogTitle>
      </DialogHeader>

      <div className="flex gap-3 rounded-lg border bg-muted/40 p-3">
        <img
          src={r.images[0] || placeholder}
          alt=""
          className="h-16 w-16 shrink-0 rounded-md border object-cover"
        />
        <div className="min-w-0 text-sm">
          <div className="font-medium">{r.name}</div>
          <div className="text-xs text-muted-foreground">
            {r.farmName} · {r.farmLocation}
          </div>
          <div className="mt-1 text-xs">
            {r.category}
            {r.packaging && ` · ${r.packaging}`} · đề xuất{" "}
            {formatVnd(r.proposedPrice)} · SL {r.quantity}
          </div>
          {r.certifications.length > 0 && (
            <div className="mt-0.5 text-xs text-emerald-700">
              {r.certifications.join(", ")}
            </div>
          )}
        </div>
      </div>
      {r.description && (
        <p className="text-sm text-muted-foreground">{r.description}</p>
      )}

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="space-y-1.5 sm:col-span-3">
          <Label htmlFor="ap-sku">
            Mã sản phẩm<span className="text-destructive"> *</span>
          </Label>
          <Input
            id="ap-sku"
            className="font-mono"
            value={sku}
            onChange={(e) => setSku(e.target.value.toUpperCase())}
          />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="ap-price">
            Giá bán<span className="text-destructive"> *</span>
          </Label>
          <Input
            id="ap-price"
            type="number"
            min={0}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="ap-sale">Giá KM</Label>
          <Input
            id="ap-sale"
            type="number"
            min={0}
            value={salePrice}
            onChange={(e) => setSalePrice(e.target.value)}
          />
        </div>
      </div>

      {(groups?.items.length ?? 0) > 0 && (
        <div className="space-y-1.5">
          <Label>Thêm vào nhóm sản phẩm</Label>
          <div className="grid gap-1.5 sm:grid-cols-2">
            {groups!.items.map((g) => (
              <label
                key={g.id}
                className="flex cursor-pointer items-center gap-2 rounded-md border px-2.5 py-1.5 text-sm"
              >
                <Checkbox
                  checked={groupIds.includes(g.id)}
                  onCheckedChange={(v) =>
                    setGroupIds((ids) =>
                      v ? [...ids, g.id] : ids.filter((x) => x !== g.id),
                    )
                  }
                />
                {g.name}
              </label>
            ))}
          </div>
        </div>
      )}

      {error && <p className="text-xs text-destructive">{error}</p>}
      <DialogFooter>
        <Button variant="outline" onClick={onDone}>
          Huỷ
        </Button>
        <Button
          disabled={!!error || approve.isPending}
          onClick={() => void onApprove()}
        >
          Duyệt & tạo sản phẩm
        </Button>
      </DialogFooter>
    </>
  );
}
