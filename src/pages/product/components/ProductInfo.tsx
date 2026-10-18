import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, cn } from "@Team-Trung-Vu-Khang/eco-shared-ui";
import placeholder from "@/assets/images/image-placeholder.webp";
import type { ProductInput } from "@/features/product";
import { formatVnd } from "@/lib/format";

type Props = { product: Partial<ProductInput> & Pick<ProductInput, "price"> & { shopName?: string } };

const Field = ({ label, value }: { label: string; value?: string | null }) => (
  <div>
    <dt className="text-xs text-muted-foreground">{label}</dt>
    <dd className="mt-0.5 text-sm font-medium">{value || "—"}</dd>
  </div>
);

/** Read-only product view — the detail page and the form's review step */
export function ProductInfo({ product: p }: Props) {
  const images = p.images ?? [];
  const [active, setActive] = useState(0);
  const discount = p.salePrice && p.price ? Math.round((1 - p.salePrice / p.price) * 100) : 0;

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
      <div className="space-y-3">
        <div className="aspect-square overflow-hidden rounded-xl border bg-muted">
          <img src={images[active] || images[0] || placeholder} alt="" className="h-full w-full object-cover" />
        </div>
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto">
            {images.map((src, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActive(i)}
                className={cn(
                  "h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2",
                  i === active ? "border-primary" : "border-transparent opacity-70 hover:opacity-100",
                )}
              >
                <img src={src} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-5">
        <div>
          <p className="text-sm text-muted-foreground">
            {p.shopName && <span className="font-medium text-foreground">{p.shopName} · </span>}
            {p.category || "Chưa chọn danh mục"} · <span className="font-mono">{p.sku || "—"}</span>
          </p>
          <h2 className="mt-1 text-2xl font-bold">{p.name || "Chưa đặt tên"}</h2>
          <div className="mt-3 flex flex-wrap items-baseline gap-3">
            <span className={cn("text-2xl font-bold tabular-nums", discount ? "text-red-600" : "text-foreground")}>
              {formatVnd(p.salePrice || p.price)}
            </span>
            {discount > 0 && (
              <>
                <span className="text-muted-foreground line-through tabular-nums">{formatVnd(p.price)}</span>
                <span className="rounded-md bg-red-50 px-1.5 py-0.5 text-xs font-semibold text-red-600">-{discount}%</span>
              </>
            )}
          </div>
          {!!p.certifications?.length && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {p.certifications.map((c) => (
                <span key={c} className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-800">
                  <ShieldCheck className="h-3.5 w-3.5" /> {c}
                </span>
              ))}
            </div>
          )}
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Quy cách & bảo quản</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-4 sm:grid-cols-2">
              <Field label="Nguồn gốc / vùng trồng" value={p.origin} />
              <Field label="Quy cách đóng gói" value={p.packaging} />
              <Field label="Hạn sử dụng" value={p.shelfLife} />
              <Field label="Hướng dẫn bảo quản" value={p.storage} />
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Mô tả</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-line text-sm text-muted-foreground">{p.description || "Chưa có mô tả."}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
