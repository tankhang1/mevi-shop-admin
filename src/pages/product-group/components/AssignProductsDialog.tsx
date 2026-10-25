import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import {
  Button,
  Checkbox,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  useToast,
} from "@Team-Trung-Vu-Khang/eco-shared-ui";
import placeholder from "@/assets/images/image-placeholder.webp";
import {
  EmptyBlock,
  LoadingBlock,
  StatusPill,
} from "@/components/common/ui-bits";
import { PRODUCT_STATUS, useProducts } from "@/features/product";
import {
  type ProductGroupDetail,
  useSetGroupProducts,
} from "@/features/product-group";
import { getErrorMessage } from "@/lib/api-error";
import { formatVnd } from "@/lib/format";

interface Props {
  group: ProductGroupDetail;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Tick the shop's products that belong in this group */
export function AssignProductsDialog({ group, open, onOpenChange }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        {/* Mounted only while open, so the selection starts from the saved members each time */}
        <AssignBody group={group} onDone={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}

function AssignBody({
  group,
  onDone,
}: {
  group: ProductGroupDetail;
  onDone: () => void;
}) {
  const { toast } = useToast();
  const save = useSetGroupProducts();
  const { data: page, isLoading } = useProducts({
    shopId: group.shopId,
    size: 200,
  });
  const [picked, setPicked] = useState(() => new Set(group.productIds));
  const [keyword, setKeyword] = useState("");

  const products = useMemo(() => {
    const k = keyword.trim().toLowerCase();
    const rows = page?.items ?? [];
    return k
      ? rows.filter((p) => `${p.name} ${p.sku}`.toLowerCase().includes(k))
      : rows;
  }, [page, keyword]);

  const toggle = (id: string) =>
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const onSave = async () => {
    try {
      await save.mutateAsync({ id: group.id, productIds: [...picked] });
      toast({
        title: "Đã cập nhật sản phẩm trong nhóm",
        description: `${group.name} · ${picked.size} sản phẩm`,
      });
      onDone();
    } catch (e) {
      toast({
        variant: "destructive",
        title: "Không thể lưu",
        description: getErrorMessage(e),
      });
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Chọn sản phẩm cho “{group.name}”</DialogTitle>
      </DialogHeader>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Tìm theo tên, mã sản phẩm..."
          className="pl-9!"
        />
      </div>
      <div className="-mx-1 max-h-[50vh] overflow-y-auto px-1">
        {isLoading ? (
          <LoadingBlock />
        ) : products.length === 0 ? (
          <EmptyBlock>Không có sản phẩm phù hợp.</EmptyBlock>
        ) : (
          <ul className="divide-y">
            {products.map((p) => (
              <li key={p.id}>
                <label className="flex cursor-pointer items-center gap-3 rounded-md px-1 py-2.5 hover:bg-muted/50">
                  <Checkbox
                    checked={picked.has(p.id)}
                    onCheckedChange={() => toggle(p.id)}
                  />
                  <img
                    src={p.images[0] || placeholder}
                    alt=""
                    className="h-10 w-10 shrink-0 rounded-md border object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{p.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {p.sku} · {formatVnd(p.salePrice ?? p.price)}
                    </div>
                  </div>
                  <StatusPill {...PRODUCT_STATUS[p.status]} />
                </label>
              </li>
            ))}
          </ul>
        )}
      </div>
      <DialogFooter className="items-center sm:justify-between">
        <span className="text-sm text-muted-foreground">
          Đã chọn {picked.size} sản phẩm
        </span>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onDone}>
            Huỷ
          </Button>
          <Button onClick={() => void onSave()} disabled={save.isPending}>
            Lưu
          </Button>
        </div>
      </DialogFooter>
    </>
  );
}
