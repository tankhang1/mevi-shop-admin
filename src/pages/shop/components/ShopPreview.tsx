import { BadgeCheck, MapPin, MessageCircle, Package, Star, Users } from "lucide-react";
import { Card } from "@Team-Trung-Vu-Khang/eco-shared-ui";
import type { Shop, ShopProfileValues } from "@/features/shop";

type Props = {
  values: Partial<ShopProfileValues>;
  /** Read-only stats from the saved shop */
  shop?: Pick<Shop, "verified" | "followers" | "responseRate" | "productCount" | "rating" | "reviewCount" | "joinedAt">;
};

const nf = new Intl.NumberFormat("vi-VN");

/** Mirrors the header of mevi-shop's /shops/:slug page so sellers see what customers see */
export function ShopPreview({ values: v, shop }: Props) {
  const color = v.brandColor || "#214c3a";
  const stats = shop && [
    { icon: Package, label: "Sản phẩm", value: nf.format(shop.productCount) },
    { icon: Star, label: "Đánh giá", value: shop.reviewCount ? `${shop.rating.toFixed(1)} (${shop.reviewCount})` : "—" },
    { icon: Users, label: "Theo dõi", value: nf.format(shop.followers) },
    { icon: MessageCircle, label: "Phản hồi", value: `${shop.responseRate}%` },
  ];

  return (
    <Card className="overflow-hidden">
      <div className="relative aspect-[16/6] bg-muted" style={{ background: v.coverUrl ? undefined : color }}>
        {v.coverUrl && <img src={v.coverUrl} alt="" className="h-full w-full object-cover" />}
        <span className="absolute right-2 top-2 rounded-md bg-black/50 px-2 py-0.5 text-[11px] font-medium text-white">
          Xem trước trang gian hàng
        </span>
      </div>
      <div className="px-5 pb-5">
        <div className="relative z-10 -mt-8 flex items-end gap-3">
          <div
            className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-4 border-card bg-card text-xl font-bold text-white shadow"
            style={{ background: v.logoUrl ? undefined : color }}
          >
            {v.logoUrl ? <img src={v.logoUrl} alt="" className="h-full w-full object-cover" /> : (v.name || "?").charAt(0)}
          </div>
        </div>
        <div className="mt-3">
          <h3 className="flex items-center gap-1.5 text-lg font-bold">
            <span className="truncate">{v.name || "Tên gian hàng"}</span>
            {shop?.verified && <BadgeCheck className="h-5 w-5 shrink-0 text-sky-600" aria-label="Mevi xác minh" />}
          </h3>
          <p className="text-sm text-muted-foreground">{v.tagline || "Slogan ngắn gọn của gian hàng"}</p>
          <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" /> {v.location || "Khu vực"}
            {shop && <> · Tham gia {new Date(shop.joinedAt).getFullYear()}</>}
          </p>
        </div>
        {stats && (
          <dl className="mt-4 grid grid-cols-2 gap-2">
            {stats.map((s) => (
              <div key={s.label} className="rounded-lg bg-muted/60 px-3 py-2">
                <dt className="flex items-center gap-1 text-[11px] text-muted-foreground">
                  <s.icon className="h-3 w-3" /> {s.label}
                </dt>
                <dd className="text-sm font-semibold tabular-nums">{s.value}</dd>
              </div>
            ))}
          </dl>
        )}
        {v.description && <p className="mt-4 line-clamp-4 text-sm text-muted-foreground">{v.description}</p>}
        <div className="mt-4 h-1.5 rounded-full" style={{ background: color }} title="Màu thương hiệu" />
      </div>
    </Card>
  );
}
