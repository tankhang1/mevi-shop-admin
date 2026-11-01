import { Switch, useToast } from "@Team-Trung-Vu-Khang/eco-shared-ui";
import { type CatalogProductListItem, isStorefrontSyncError, useSetCatalogProductStatus } from "@/features/shop-catalog";
import { getErrorMessage } from "@/lib/api-error";

/** "Tạm ngưng kinh doanh" switch (on = INACTIVE) — PUT /products/{id}/status */
export function CatalogStatusToggle({ product }: { product: Pick<CatalogProductListItem, "id" | "title" | "status"> }) {
  const { toast } = useToast();
  const setStatus = useSetCatalogProductStatus();
  const paused = product.status === "INACTIVE";

  const toggle = async (pause: boolean) => {
    try {
      await setStatus.mutateAsync({ id: product.id, status: pause ? "INACTIVE" : "ACTIVE" });
      toast({ title: pause ? "Đã tạm ngưng kinh doanh" : "Đã mở bán lại", description: product.title });
    } catch (e) {
      toast({
        variant: "destructive",
        title: isStorefrontSyncError(e) ? "Chưa cập nhật được trang shop, vui lòng thử lại" : "Không thể cập nhật",
        description: getErrorMessage(e),
      });
    }
  };

  return (
    // Stop clicks reaching the table row, which would otherwise open the detail page
    <span onClick={(e) => e.stopPropagation()} className="inline-flex cursor-pointer items-center">
      <Switch
        checked={paused}
        disabled={setStatus.isPending}
        onCheckedChange={(v) => void toggle(v)}
        aria-label="Tạm ngưng kinh doanh"
      />
    </span>
  );
}
