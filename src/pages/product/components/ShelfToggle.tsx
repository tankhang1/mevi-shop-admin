import { Switch, cn, useToast } from "@Team-Trung-Vu-Khang/eco-shared-ui";
import { type Product, useSetProductListing } from "@/features/product";
import { getErrorMessage } from "@/lib/api-error";

interface Props {
  product: Product;
  /** pause = "Tạm dừng kinh doanh" (on = not listed, product tables); shelf = "Lên kệ" (on = listed, shop page) */
  mode?: "pause" | "shelf";
  /** Show the switch's name next to it */
  showLabel?: boolean;
}

/** Listing switch. Only approved products can be sold */
export function ShelfToggle({ product, mode = "pause", showLabel }: Props) {
  const { toast } = useToast();
  const setListing = useSetProductListing();
  const canList = product.status === "approved";
  const label = mode === "shelf" ? "Lên kệ" : "Tạm dừng kinh doanh";
  const on = canList && (mode === "shelf" ? product.listed : !product.listed);

  const toggle = async (checked: boolean) => {
    const listed = mode === "shelf" ? checked : !checked;
    try {
      await setListing.mutateAsync({ id: product.id, listed });
      toast({
        title: mode === "shelf" ? (listed ? "Đã lên kệ" : "Đã gỡ khỏi kệ") : listed ? "Đã mở bán lại" : "Đã tạm dừng kinh doanh",
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
      title={canList ? undefined : "Sản phẩm cần được duyệt trước khi kinh doanh"}
      className={cn("inline-flex items-center gap-2", canList && "cursor-pointer")}
    >
      {showLabel && (
        <span className={cn("whitespace-nowrap text-sm", on ? "font-medium text-primary" : "text-muted-foreground")}>{label}</span>
      )}
      <Switch
        checked={on}
        disabled={!canList || setListing.isPending}
        onCheckedChange={(v) => void toggle(v)}
        aria-label={label}
      />
    </label>
  );
}
