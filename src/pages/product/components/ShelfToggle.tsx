import { Switch, useToast } from "@Team-Trung-Vu-Khang/eco-shared-ui";
import { type Product, useSetProductListing } from "@/features/product";
import { getErrorMessage } from "@/lib/api-error";

/** "Tạm dừng kinh doanh" switch — on = paused (not listed). Only approved products can be sold */
export function ShelfToggle({ product }: { product: Product }) {
  const { toast } = useToast();
  const setListing = useSetProductListing();
  const canList = product.status === "approved";

  const toggle = async (listed: boolean) => {
    try {
      await setListing.mutateAsync({ id: product.id, listed });
      toast({ title: listed ? "Đã mở bán lại" : "Đã tạm dừng kinh doanh", description: product.name });
    } catch (e) {
      toast({ variant: "destructive", title: "Không thể cập nhật", description: getErrorMessage(e) });
    }
  };

  return (
    // Stop clicks reaching the table row, which would otherwise open the detail page
    <span onClick={(e) => e.stopPropagation()} title={canList ? undefined : "Sản phẩm cần được duyệt trước khi kinh doanh"}>
      <Switch
        checked={canList && !product.listed}
        disabled={!canList || setListing.isPending}
        onCheckedChange={(paused) => void toggle(!paused)}
        aria-label="Tạm dừng kinh doanh"
      />
    </span>
  );
}
