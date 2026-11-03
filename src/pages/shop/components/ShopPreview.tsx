import { BadgeCheck, MapPin } from "lucide-react";
import { Card } from "@Team-Trung-Vu-Khang/eco-shared-ui";
import type { PartnerProfile } from "@/features/partner";
import type { StorefrontProfileValues } from "@/features/storefront";

type Props = {
  values: Partial<StorefrontProfileValues>;
  profile?: Pick<PartnerProfile, "verified" | "createdAt"> | null;
};

/** Mirrors the header of mevi-shop's /shops/:slug page so sellers see what customers see */
export function ShopPreview({ values: v, profile }: Props) {
  const color = v.brandColor || "#214c3a";
  const joinedYear = profile?.createdAt
    ? new Date(profile.createdAt).getFullYear()
    : new Date().getFullYear();

  return (
    <Card className="overflow-hidden">
      <div
        className="relative aspect-[16/6] bg-muted"
        style={{ background: v.coverImageUrl ? undefined : color }}
      >
        {v.coverImageUrl && (
          <img
            src={v.coverImageUrl}
            alt="Ảnh bìa gian hàng"
            className="h-full w-full object-cover"
          />
        )}
        <span className="absolute right-2 top-2 rounded-md bg-black/50 px-2 py-0.5 text-[11px] font-medium text-white">
          Xem trước gian hàng
        </span>
      </div>
      <div className="px-5 pb-5">
        <div className="relative z-10 -mt-8 flex items-end gap-3">
          <div
            className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-4 border-card bg-card text-xl font-bold text-white shadow"
            style={{ background: v.logoUrl ? undefined : color }}
          >
            {v.logoUrl ? (
              <img
                src={v.logoUrl}
                alt="Logo gian hàng"
                className="h-full w-full object-cover"
              />
            ) : (
              (v.name || "?").charAt(0).toUpperCase()
            )}
          </div>
        </div>
        <div className="mt-3">
          <h3 className="flex items-center gap-1.5 text-lg font-bold">
            <span className="truncate">{v.name || "Tên gian hàng"}</span>
            {profile?.verified && (
              <BadgeCheck
                className="h-5 w-5 shrink-0 text-sky-600"
                aria-label="Mevi xác minh"
              />
            )}
          </h3>
          <p className="text-sm text-muted-foreground">
            {v.slogan || "Slogan ngắn gọn của gian hàng"}
          </p>
          <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" /> {v.province || "Tỉnh/Thành phố"}
            {profile && <> · Tham gia {joinedYear}</>}
          </p>
        </div>
        {v.description && (
          <p className="mt-4 line-clamp-4 text-sm text-muted-foreground">
            {v.description}
          </p>
        )}
        <div
          className="mt-4 h-1.5 rounded-full"
          style={{ background: color }}
          title="Màu thương hiệu"
        />
      </div>
    </Card>
  );
}
