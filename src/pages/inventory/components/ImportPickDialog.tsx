import { useEffect, useState } from "react";
import { ChevronRight, Loader2, PackageSearch } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  cn,
} from "@Team-Trung-Vu-Khang/eco-shared-ui";
import placeholder from "@/assets/images/image-placeholder.webp";
import { useCatalogProducts } from "@/features/shop-catalog";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPick: (productId: number) => void;
}

const nf = new Intl.NumberFormat("vi-VN");

/** Page-level "Nhập hàng": search a product on the API; picking one opens the stock dialog */
export function ImportPickDialog({ open, onOpenChange, onPick }: Props) {
  const [input, setInput] = useState("");
  const [keyword, setKeyword] = useState("");
  const { data, isFetching } = useCatalogProducts({ keyword: keyword || undefined, size: 20 });
  const products = data?.content ?? [];

  useEffect(() => {
    const t = setTimeout(() => setKeyword(input.trim()), 300);
    return () => clearTimeout(t);
  }, [input]);

  const pick = (id: number) => {
    setInput("");
    onPick(id);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg gap-3 p-0 [&>*]:min-w-0">
        <DialogHeader className="px-5 pt-5">
          <DialogTitle>Nhập hàng</DialogTitle>
          <DialogDescription>Chọn sản phẩm cần nhập hoặc điều chỉnh tồn kho.</DialogDescription>
        </DialogHeader>

        {/* shouldFilter=false: the API already searched by keyword (tên, mã, handle, SKU) */}
        <Command shouldFilter={false} className="rounded-none border-t bg-transparent">
          <div className="relative">
            <CommandInput placeholder="Tìm theo tên, mã sản phẩm, SKU..." value={input} onValueChange={setInput} />
            {isFetching && <Loader2 className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />}
          </div>
          <CommandList className="max-h-80 px-2 pb-2">
            {!data ? (
              <div className="flex justify-center py-10 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            ) : (
              <>
                <CommandEmpty>
                  <div className="flex flex-col items-center gap-2 py-6 text-sm text-muted-foreground">
                    <PackageSearch className="h-8 w-8 opacity-40" />
                    Không tìm thấy sản phẩm
                  </div>
                </CommandEmpty>
                <CommandGroup heading={keyword ? `${data.totalElements} kết quả` : "Sản phẩm mới cập nhật"}>
                  {products.map((p) => (
                    <CommandItem
                      key={p.id}
                      value={String(p.id)}
                      onSelect={() => pick(p.id)}
                      // cmdk highlights the first row by default — keep it subtle so it doesn't read as "selected"
                      className="group cursor-pointer gap-3 rounded-lg px-2.5 py-2 data-[selected=true]:bg-muted data-[selected=true]:text-foreground"
                    >
                      <img src={p.thumbnailUrl || placeholder} alt="" className="h-11 w-11 shrink-0 rounded-md border object-cover" />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium">{p.title}</div>
                        <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                          <span className="font-mono">{p.code}</span>
                          <span>·</span>
                          <span>{p.variantCount} quy cách</span>
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <div className="text-[11px] text-muted-foreground">Tồn kho</div>
                        <div
                          className={cn(
                            "text-sm font-semibold tabular-nums",
                            p.totalInventory === 0 ? "text-red-600" : p.lowStock ? "text-amber-700" : "text-foreground",
                          )}
                        >
                          {nf.format(p.totalInventory)}
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-data-[selected=true]:opacity-100" />
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
