import { Link, useParams } from "wouter";
import { BadgeCheck, Eye, EyeOff, Package, ShoppingCart } from "lucide-react";
import { Button, Label, Switch, useToast } from "@Team-Trung-Vu-Khang/eco-shared-ui";
import { usePageActions } from "@/app/layouts/page-header.store";
import { BackLink } from "@/components/common/BackLink";
import { RequireRole } from "@/components/common/RequireRole";
import { EmptyBlock, LoadingBlock } from "@/components/common/ui-bits";
import { ROUTES } from "@/config/routes";
import { type Shop, type ShopProfileValues, profileValuesToInput, useShop, useUpdateShop } from "@/features/shop";
import { getErrorMessage } from "@/lib/api-error";
import { ShopProfileForm } from "./components/ShopProfileForm";

function ShopDetail() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { data: shop, isLoading, isError } = useShop(id);
  const update = useUpdateShop();

  usePageActions(
    () => (
      <>
        <Button variant="outline" asChild>
          <Link href={`${ROUTES.products}?shopId=${id}`}>
            <Package className="mr-1.5 h-4 w-4" /> Sản phẩm
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href={`${ROUTES.orders}?shopId=${id}`}>
            <ShoppingCart className="mr-1.5 h-4 w-4" /> Đơn hàng
          </Link>
        </Button>
      </>
    ),
    [id],
  );

  if (isLoading) return <LoadingBlock />;
  if (isError || !shop) return <EmptyBlock>Không tìm thấy gian hàng.</EmptyBlock>;

  const patch = async (data: Parameters<typeof update.mutateAsync>[0]["data"], done: string) => {
    try {
      await update.mutateAsync({ id: shop.id, data });
      toast({ title: done });
    } catch (e) {
      toast({ variant: "destructive", title: "Không thể lưu", description: getErrorMessage(e) });
    }
  };

  const flag = (key: keyof Pick<Shop, "verified" | "active">, label: string, on: string, off: string, Icon: typeof Eye) => (
    <div className="flex items-center gap-3 rounded-lg border bg-card px-4 py-3">
      <Icon className="h-4 w-4 text-muted-foreground" />
      <div className="min-w-0 flex-1">
        <Label htmlFor={key} className="font-medium">
          {label}
        </Label>
        <p className="text-xs text-muted-foreground">{shop[key] ? on : off}</p>
      </div>
      <Switch
        id={key}
        checked={shop[key]}
        disabled={update.isPending}
        onCheckedChange={(v) => void patch({ [key]: v }, `${label}: ${v ? "bật" : "tắt"}`)}
      />
    </div>
  );

  return (
    <div className="space-y-4">
      <BackLink to={ROUTES.shops} label="Danh sách gian hàng" />
      <div className="grid gap-3 sm:grid-cols-2">
        {flag("verified", "Mevi xác minh", "Khách hàng thấy huy hiệu xác minh", "Chưa gắn huy hiệu", BadgeCheck)}
        {flag("active", "Hiển thị trên cửa hàng", "Gian hàng và sản phẩm đang hiển thị", "Đang ẩn khỏi cửa hàng", shop.active ? Eye : EyeOff)}
      </div>
      <ShopProfileForm
        shop={shop}
        saving={update.isPending}
        onSubmit={(v: ShopProfileValues) => void patch(profileValuesToInput(v), "Đã lưu thông tin gian hàng")}
      />
    </div>
  );
}

export default function ShopDetailPage() {
  return (
    <RequireRole root>
      <ShopDetail />
    </RequireRole>
  );
}
