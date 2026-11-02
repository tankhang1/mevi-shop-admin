import { useEffect, useState } from "react";
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
import { EmptyBlock, LoadingBlock, StatusPill } from "@/components/common/ui-bits";
import {
  type ProductCategory,
  getFieldErrors,
  isStorefrontSyncError,
  useBulkSetProductCategory,
  useCatalogProducts,
} from "@/features/shop-catalog";
import { getErrorMessage } from "@/lib/api-error";
import { CATALOG_STATUS } from "@/pages/product/components/catalog-product-columns";

/** BE accepts 1–100 ids per call */
const MAX_PICK = 100;

interface Props {
  group: ProductCategory;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Tick products from other groups and move them into this one */
export function AssignProductsDialog({ group, open, onOpenChange }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        {/* Mounted only while open, so the selection starts empty each time */}
        {open && <AssignBody group={group} onDone={() => onOpenChange(false)} />}
      </DialogContent>
    </Dialog>
  );
}

function AssignBody({ group, onDone }: { group: ProductCategory; onDone: () => void }) {
  const { toast } = useToast();
  const move = useBulkSetProductCategory();
  const [input, setInput] = useState("");
  const [keyword, setKeyword] = useState("");
  const [picked, setPicked] = useState<Set<number>>(() => new Set());

  useEffect(() => {
    const t = setTimeout(() => setKeyword(input.trim()), 300);
    return () => clearTimeout(t);
  }, [input]);

  const { data, isLoading } = useCatalogProducts({ keyword: keyword || undefined, size: 50 });
  const products = (data?.content ?? []).filter((p) => p.category?.id !== group.id);

  const toggle = (id: number) =>
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else if (next.size < MAX_PICK) next.add(id);
      return next;
    });

  const onSave = async () => {
    try {
      await move.mutateAsync({ productIds: [...picked], categoryId: group.id });
      toast({ title: "Đã chuyển sản phẩm vào nhóm", description: `${group.name} · ${picked.size} sản phẩm` });
      onDone();
    } catch (e) {
      const notFound = Object.keys(getFieldErrors(e)).some((k) => k.startsWith("productIds["));
      toast({
        variant: "destructive",
        title: isStorefrontSyncError(e) ? "Chưa cập nhật được trang shop, vui lòng thử lại" : "Không thể chuyển nhóm",
        description: notFound ? "Có sản phẩm không còn tồn tại, vui lòng tải lại danh sách." : getErrorMessage(e),
      });
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Thêm sản phẩm vào “{group.name}”</DialogTitle>
      </DialogHeader>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Tìm theo tên, mã sản phẩm, SKU..."
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
                  <Checkbox checked={picked.has(p.id)} onCheckedChange={() => toggle(p.id)} />
                  <img
                    src={p.thumbnailUrl || placeholder}
                    alt=""
                    className="h-10 w-10 shrink-0 rounded-md border object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{p.title}</div>
                    <div className="truncate text-xs text-muted-foreground">
                      {p.code} · Nhóm hiện tại: {p.category?.name ?? "—"}
                    </div>
                  </div>
                  <StatusPill {...CATALOG_STATUS[p.status]} />
                </label>
              </li>
            ))}
          </ul>
        )}
      </div>
      <DialogFooter className="items-center sm:justify-between">
        <span className="text-sm text-muted-foreground">
          Đã chọn {picked.size}
          {picked.size >= MAX_PICK && ` (tối đa ${MAX_PICK})`} sản phẩm
        </span>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onDone}>
            Huỷ
          </Button>
          <Button onClick={() => void onSave()} disabled={!picked.size || move.isPending}>
            Chuyển vào nhóm
          </Button>
        </div>
      </DialogFooter>
    </>
  );
}
