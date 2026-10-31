import { Switch, cn, useToast } from "@Team-Trung-Vu-Khang/eco-shared-ui";
import { type Product, useSetProductListing } from "@/features/product";
import { getErrorMessage } from "@/lib/api-error";

interface Props {
  product: Product;
  /** pause = "Tạm ngưng kinh doanh" (on = not listed, product tables); shelf = "Lên kệ" (on = listed, shop page) */
  mode?: "pause" | "shelf";
  /** Show the switch's name next to it */
  showLabel?: boolean;
}

/** Listing switch: Đang kinh doanh ↔ Tạm ngưng kinh doanh */
export function ShelfToggle({ product, mode = "pause", showLabel }: Props) {
  const { toast } = useToast();
  const setListing = useSetProductListing();
  const label = mode === "shelf" ? "Lên kệ" : "Tạm ngưng kinh doanh";
  const on = mode === "shelf" ? product.listed : !product.listed;

  const toggle = async (checked: boolean) => {
    const listed = mode === "shelf" ? checked : !checked;
    try {
      await setListing.mutateAsync({ id: product.id, listed });
      toast({
        title: mode === "shelf" ? (listed ? "Đã lên kệ" : "Đã gỡ khỏi kệ") : listed ? "Đã mở bán lại" : "Đã tạm ngưng kinh doanh",
        description: product.name,
      });
    } catch (e) {
      toast({ variant: "destructive", title: "Không thể cập nhật", description: getErrorMessage(e) });
    }
  };

  return (
    // Stop clicks reaching the table row, which would otherwise open the detail page
    <label
      onClick={(e) => e.stopPropagation()}
      className="inline-flex cursor-pointer items-center gap-2"
    >
      {showLabel && (
        <span className={cn("whitespace-nowrap text-sm", on ? "font-medium text-primary" : "text-muted-foreground")}>{label}</span>
      )}
      <Switch
        checked={on}
        disabled={setListing.isPending}
        onCheckedChange={(v) => void toggle(v)}
        aria-label={label}
      />
    </label>
  );
}
