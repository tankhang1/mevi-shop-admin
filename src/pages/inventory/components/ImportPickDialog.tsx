import { useState } from "react";
import {
  Button,
  Combobox,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Label,
} from "@Team-Trung-Vu-Khang/eco-shared-ui";
import { type InventoryItem, stockStatusOf } from "@/features/inventory";
import { useProducts } from "@/features/product";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPick: (item: InventoryItem) => void;
}

/** Page-level "Nhập hàng từ Mevi": pick a product first, then the usual import dialog takes over */
export function ImportPickDialog({ open, onOpenChange, onPick }: Props) {
  const { data: page } = useProducts({ size: 200 });
  const [productId, setProductId] = useState("");
  const products = page?.items ?? [];
  const options = products.map((p) => ({ label: `${p.name} · ${p.sku}`, value: p.id }));

  const next = () => {
    const p = products.find((x) => x.id === productId);
    if (!p) return;
    setProductId("");
    onPick({ ...p, productId: p.id, stockStatus: stockStatusOf(p) });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md [&>*]:min-w-0">
        <DialogHeader>
          <DialogTitle>Nhập hàng từ Mevi</DialogTitle>
        </DialogHeader>
        <div className="space-y-1.5">
          <Label>Sản phẩm</Label>
          <Combobox
            options={options}
            value={productId}
            onChange={setProductId}
            placeholder="Chọn sản phẩm cần nhập"
            searchPlaceholder="Tìm theo tên, mã..."
            emptyText="Không tìm thấy sản phẩm"
            className="w-full min-w-0 max-w-full overflow-hidden"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Huỷ
          </Button>
          <Button disabled={!productId} onClick={next}>
            Tiếp tục
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
