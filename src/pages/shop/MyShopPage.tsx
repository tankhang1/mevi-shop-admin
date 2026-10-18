import { BadgeCheck, ExternalLink, Info } from "lucide-react";
import { Button, useToast } from "@Team-Trung-Vu-Khang/eco-shared-ui";
import { usePageActions } from "@/app/layouts/page-header.store";
import { RequireRole } from "@/components/common/RequireRole";
import { EmptyBlock, LoadingBlock } from "@/components/common/ui-bits";
import { type ShopProfileValues, profileValuesToInput, useMyShop, useUpdateMyShop } from "@/features/shop";
import { getErrorMessage } from "@/lib/api-error";
import { ShopProfileForm } from "./components/ShopProfileForm";

const SHOP_URL = import.meta.env.VITE_SHOP_URL ?? "https://mevi.vn";

function MyShop() {
  const { toast } = useToast();
  const { data: shop, isLoading, isError } = useMyShop();
  const update = useUpdateMyShop();

  usePageActions(
    () =>
      shop && (
        <Button variant="outline" asChild>
          <a href={`${SHOP_URL}/shops/${shop.slug}`} target="_blank" rel="noreferrer">
            <ExternalLink className="mr-1.5 h-4 w-4" /> Xem trang gian hàng
          </a>
        </Button>
      ),
    [shop?.slug],
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
    <div className="space-y-4">
      {shop.verified ? (
        <div className="flex items-center gap-2 rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900">
          <BadgeCheck className="h-4 w-4 shrink-0" /> Gian hàng đã được Mevi xác minh — khách hàng thấy huy hiệu xác minh.
        </div>
      ) : (
        <div className="flex items-start gap-2 rounded-lg border bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          Gian hàng chưa được xác minh. Hoàn thiện đầy đủ thông tin và liên hệ Mevi để được gắn huy hiệu xác minh.
        </div>
      )}
      <ShopProfileForm shop={shop} saving={update.isPending} onSubmit={(v) => void onSubmit(v)} />
    </div>
  );
}

export default function MyShopPage() {
  return (
    <RequireRole shopAdmin>
      <MyShop />
    </RequireRole>
  );
}
