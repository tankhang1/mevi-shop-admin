import { ExternalLink } from "lucide-react";
import { Button, useToast } from "@Team-Trung-Vu-Khang/eco-shared-ui";
import { usePageActions } from "@/app/layouts/page-header.store";
import { RequireRole } from "@/components/common/RequireRole";
import { EmptyBlock, LoadingBlock, StatusPill } from "@/components/common/ui-bits";
import { type ShopProfileValues, profileValuesToInput, useMyShop, useUpdateMyShop } from "@/features/shop";
import { getErrorMessage } from "@/lib/api-error";
import { ShopProfileForm } from "./components/ShopProfileForm";
import { ShopShelf } from "./components/ShopShelf";

const SHOP_URL = import.meta.env.VITE_SHOP_URL ?? "https://mevi.vn";
function MyShop() {
  const { toast } = useToast();
  const { data: shop, isLoading, isError } = useMyShop();
  const update = useUpdateMyShop();

  usePageActions(
    () =>
      shop && (
        <>
          {shop.verified ? (
            <StatusPill label="Đã xác minh" className="bg-sky-100 text-sky-800" />
          ) : (
            <span title="Hoàn thiện đầy đủ thông tin và liên hệ Mevi để được gắn huy hiệu xác minh">
              <StatusPill label="Chưa xác minh" className="bg-muted text-muted-foreground" />
            </span>
          )}
          <Button variant="outline" asChild className="px-2.5 sm:px-4">
            <a href={`${SHOP_URL}/shops/${shop.slug}`} target="_blank" rel="noreferrer" aria-label="Xem trang gian hàng">
              <ExternalLink className="h-4 w-4 sm:mr-1.5" />
              <span className="max-sm:hidden">Xem trang gian hàng</span>
            </a>
          </Button>
        </>
      ),
    [shop?.slug, shop?.verified],
  );

  if (isLoading) return <LoadingBlock />;
  if (isError || !shop) return <EmptyBlock>Không tải được thông tin gian hàng.</EmptyBlock>;

  const onSubmit = async (values: ShopProfileValues) => {
    try {
      await update.mutateAsync(profileValuesToInput(values));
      toast({ title: "Đã lưu thông tin gian hàng" });
    } catch (e) {
      toast({ variant: "destructive", title: "Không thể lưu", description: getErrorMessage(e) });
    }
  };

  return (
    <ShopProfileForm
      shop={shop}
      saving={update.isPending}
      onSubmit={(v) => void onSubmit(v)}
      extraTabs={[{ value: "shelf", label: "Sản phẩm kinh doanh", content: <ShopShelf /> }]}
    />
  );
}

export default function MyShopPage() {
  return (
    <RequireRole shopAdmin>
      <MyShop />
    </RequireRole>
  );
}
