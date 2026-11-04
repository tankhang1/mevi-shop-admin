import { useEffect, useState } from "react";
import { Check, ChevronsUpDown, Loader2, Store } from "lucide-react";
import {
  Button,
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  Popover,
  PopoverContent,
  PopoverTrigger,
  cn,
} from "@Team-Trung-Vu-Khang/eco-shared-ui";
import { useAccess } from "@/features/auth";
import { useShop, useShops } from "@/features/shop/hooks/use-shops";

interface ShopComboboxProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
}

const DEBOUNCE_MS = 300;

export function ShopCombobox({
  value,
  onChange,
  className,
  placeholder = "Tất cả gian hàng",
}: ShopComboboxProps) {
  const { isRoot } = useAccess();
  const [open, setOpen] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");
  const [selectedLabel, setSelectedLabel] = useState<string>("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedKeyword(keyword.trim());
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [keyword]);

  // Gọi API tìm kiếm gian hàng theo keyword
  const { data: shopData, isLoading, isFetching } = useShops(
    { keyword: debouncedKeyword || undefined, size: 50 },
    isRoot,
  );

  // Khi value khác "all" và chưa có selectedLabel, fetch thông tin shop đó
  const { data: initialShop } = useShop(
    value && value !== "all" && !selectedLabel ? value : undefined,
  );

  const shops = shopData?.items ?? [];

  // Xác định nhãn hiển thị trên trigger button
  const displayLabel = () => {
    if (!value || value === "all") return placeholder;
    const found = shops.find((s) => s.id === value);
    if (found) return found.name;
    if (initialShop?.name) return initialShop.name;
    if (selectedLabel) return selectedLabel;
    return `Gian hàng #${value}`;
  };

  const isSearching = isLoading || isFetching;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "h-9 w-full justify-between font-normal md:w-52!",
            className,
          )}
        >
          <span className="flex items-center gap-1.5 truncate">
            <Store className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <span className="truncate">{displayLabel()}</span>
          </span>
          <ChevronsUpDown className="ml-1.5 h-3.5 w-3.5 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-[280px] p-0"
        align="start"
      >
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Tìm kiếm gian hàng theo API..."
            value={keyword}
            onValueChange={setKeyword}
          />

          <CommandList className="max-h-60">
            {isSearching ? (
              <div className="flex items-center justify-center gap-2 py-6 text-xs text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Đang tìm kiếm...</span>
              </div>
            ) : (
              <>
                <CommandEmpty className="py-4 text-center text-xs text-muted-foreground">
                  Không tìm thấy gian hàng nào
                </CommandEmpty>

                <CommandGroup>
                  <CommandItem
                    value="all"
                    onSelect={() => {
                      onChange("all");
                      setSelectedLabel("");
                      setOpen(false);
                    }}
                    className="cursor-pointer"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        !value || value === "all" ? "opacity-100" : "opacity-0",
                      )}
                    />
                    <span className="font-medium text-primary">Tất cả gian hàng</span>
                  </CommandItem>

                  {shops.map((shop) => (
                    <CommandItem
                      key={shop.id}
                      value={shop.id}
                      onSelect={() => {
                        onChange(shop.id);
                        setSelectedLabel(shop.name);
                        setOpen(false);
                      }}
                      className="cursor-pointer"
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value === shop.id ? "opacity-100" : "opacity-0",
                        )}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{shop.name}</p>
                        {shop.location && (
                          <p className="truncate text-[11px] text-muted-foreground">
                            {shop.location}
                          </p>
                        )}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
