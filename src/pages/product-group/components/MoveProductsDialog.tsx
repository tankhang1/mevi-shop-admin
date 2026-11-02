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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
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
  useCategories,
} from "@/features/shop-catalog";
import { getErrorMessage } from "@/lib/api-error";
import { CATALOG_STATUS } from "@/pages/product/components/catalog-product-columns";

/** BE accepts 1–100 ids per call */
const MAX_PICK = 100;

interface Props {
  group: ProductCategory;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Pre-ticked products, e.g. from a row action */
  initialIds?: number[];
}

/** Tick products of this group and move them to another one */
export function MoveProductsDialog({ group, open, onOpenChange, initialIds }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        {/* Mounted only while open, so the selection resets each time */}
        {open && <MoveBody group={group} initialIds={initialIds} onDone={() => onOpenChange(false)} />}
      </DialogContent>
    </Dialog>
  );
}

function MoveBody({ group, initialIds, onDone }: { group: ProductCategory; initialIds?: number[]; onDone: () => void }) {
  const { toast } = useToast();
  const move = useBulkSetProductCategory();
  const { data: categories } = useCategories();
  const targets = (categories ?? []).filter((c) => c.id !== group.id);
  const [targetId, setTargetId] = useState("");
  const [input, setInput] = useState("");
  const [keyword, setKeyword] = useState("");
  const [picked, setPicked] = useState<Set<number>>(() => new Set(initialIds));

  useEffect(() => {
    const t = setTimeout(() => setKeyword(input.trim()), 300);
    return () => clearTimeout(t);
  }, [input]);

  const { data, isLoading } = useCatalogProducts({ categoryId: group.id, keyword: keyword || undefined, size: 100 });
  const products = data?.content ?? [];
  const allPicked = products.length > 0 && products.every((p) => picked.has(p.id));

  const toggle = (id: number) =>
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else if (next.size < MAX_PICK) next.add(id);
      return next;
    });

  const toggleAll = () =>
    setPicked((prev) => {
      const next = new Set(prev);
      if (allPicked) products.forEach((p) => next.delete(p.id));
      else products.forEach((p) => next.size < MAX_PICK && next.add(p.id));
      return next;
    });

  const onSave = async () => {
    const target = targets.find((c) => String(c.id) === targetId);
    if (!target) return;
    try {
      await move.mutateAsync({ productIds: [...picked], categoryId: target.id });
      toast({ title: "Đã chuyển nhóm sản phẩm", description: `${picked.size} sản phẩm → ${target.name}` });
      onDone();
    } catch (e) {
      const fields = getFieldErrors(e);
      const notFound = Object.keys(fields).some((k) => k.startsWith("productIds["));
      toast({
        variant: "destructive",
        title: isStorefrontSyncError(e) ? "Chưa cập nhật được trang shop, vui lòng thử lại" : "Không thể chuyển nhóm",
        description: notFound
          ? "Có sản phẩm không còn tồn tại, vui lòng tải lại danh sách."
          : fields.categoryId
            ? "Nhóm đích không còn tồn tại."
            : getErrorMessage(e),
      });
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Chuyển sản phẩm khỏi “{group.name}”</DialogTitle>
      </DialogHeader>
      <Select value={targetId} onValueChange={setTargetId}>
        <SelectTrigger>
          <SelectValue placeholder={targets.length ? "Chọn nhóm đích" : "Chưa có nhóm nào khác"} />
        </SelectTrigger>
        <SelectContent>
          {targets.map((c) => (
            <SelectItem key={c.id} value={String(c.id)}>
              {c.name} · {c.productCount} sản phẩm
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Tìm trong nhóm theo tên, mã, SKU..."
          className="pl-9!"
        />
      </div>
      <div className="-mx-1 max-h-[45vh] overflow-y-auto px-1">
        {isLoading ? (
          <LoadingBlock />
        ) : products.length === 0 ? (
          <EmptyBlock>Không có sản phẩm phù hợp.</EmptyBlock>
        ) : (
          <ul className="divide-y">
            <li>
              <label className="flex cursor-pointer items-center gap-3 rounded-md px-1 py-2 text-sm font-medium hover:bg-muted/50">
                <Checkbox checked={allPicked} onCheckedChange={toggleAll} />
                Chọn tất cả ({products.length})
              </label>
            </li>
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
                    <div className="truncate font-mono text-xs text-muted-foreground">{p.code}</div>
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
          <Button onClick={() => void onSave()} disabled={!picked.size || !targetId || move.isPending}>
            Chuyển nhóm
          </Button>
        </div>
      </DialogFooter>
    </>
  );
}
