import { useState } from "react";
import type { ReactNode } from "react";
import { ShieldCheck, Sprout } from "lucide-react";
import { cn } from "@Team-Trung-Vu-Khang/eco-shared-ui";
import placeholder from "@/assets/images/image-placeholder.webp";
import { BASE_UNIT, type BaseUnit, type ProductInput, type ProductSource } from "@/features/product";
import { FARM_TYPE, useFarms } from "@/features/farm";
import { formatVnd } from "@/lib/format";

type Props = {
  product: Omit<Partial<ProductInput>, "sources"> &
    Pick<ProductInput, "price"> & {
      shopName?: string;
      farmName?: string | null;
      regionName?: string | null;
      cropName?: string | null;
      sources?: ProductSource[];
      gardenStock?: Record<number, number>;
      isAgricultural?: boolean;
      baseUnit?: BaseUnit | null;
    };
};

const discountOf = (price: number, original?: number | null) =>
  original && original > price && price ? Math.min(99, Math.round((1 - price / original) * 100)) : 0;

function Section({ title, aside, children, className }: { title: string; aside?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-xl border bg-card p-4 sm:p-5", className)}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold">{title}</h3>
        {aside}
      </div>
      {children}
    </section>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 break-words text-sm font-medium">{children || "—"}</dd>
    </div>
  );
}

/** Read-only product view — the detail page and the form's review step */
export function ProductInfo({ product: p }: Props) {
  const images = p.images ?? [];
  const [active, setActive] = useState(0);
  const { data: farms } = useFarms();
  // Older products only carry the flat packaging / price fields
  const variants = p.variants?.length
    ? p.variants
    : [{ name: p.packaging ?? "", price: p.salePrice || p.price, originalPrice: p.salePrice ? p.price : null, baseQuantity: null }];
  const suppliers = p.suppliers?.length ? p.suppliers : p.farmId ? [{ farmId: p.farmId, importPrice: 0 }] : [];
  const unit = p.baseUnit ? BASE_UNIT[p.baseUnit] : "";
  const first = variants[0];
  const discount = discountOf(first.price, first.originalPrice);

  return (
    <div className="grid gap-5 lg:grid-cols-[420px_minmax(0,1fr)]">
      {/* Ảnh */}
      <div className="space-y-2 lg:sticky lg:top-4 lg:self-start">
        <div className="aspect-square overflow-hidden rounded-xl border bg-muted">
          <img src={images[active] || images[0] || placeholder} alt="" className="h-full w-full object-cover" />
        </div>
        {images.length > 1 && (
          <div className="grid grid-cols-5 gap-2">
            {images.map((src, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActive(i)}
                className={cn(
                  "aspect-square overflow-hidden rounded-lg border-2 transition",
                  i === active ? "border-primary" : "border-transparent opacity-60 hover:opacity-100",
                )}
              >
                <img src={src} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="min-w-0 space-y-4">
        {/* Tiêu đề & giá */}
        <section className="rounded-xl border bg-card p-4 sm:p-5">
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="rounded-md bg-muted px-2 py-0.5 font-medium">{p.category || "Chưa chọn nhóm"}</span>
            <span className="rounded-md bg-muted px-2 py-0.5 font-mono text-muted-foreground">{p.sku || "—"}</span>
            {p.isAgricultural && (
              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 font-medium text-emerald-700">
                <Sprout className="h-3 w-3" /> Nông sản
              </span>
            )}
            {p.shopName && <span className="text-muted-foreground">· {p.shopName}</span>}
          </div>
          <h2 className="mt-2 text-xl font-semibold leading-snug sm:text-2xl">{p.name || "Chưa đặt tên"}</h2>
          <div className="mt-2 flex flex-wrap items-baseline gap-2">
            <span className="text-2xl font-bold tabular-nums text-primary">{formatVnd(first.price)}</span>
            {discount > 0 && (
              <>
                <span className="text-sm text-muted-foreground line-through tabular-nums">{formatVnd(first.originalPrice!)}</span>
                <span className="rounded bg-red-50 px-1.5 text-xs font-semibold text-red-600">-{discount}%</span>
              </>
            )}
          </div>
          {!!p.certifications?.length && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {p.certifications.map((c) => (
                <span key={c} className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs text-muted-foreground">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> {c}
                </span>
              ))}
            </div>
          )}
        </section>

        {/* Quy cách & giá */}
        <Section title="Quy cách & giá" aside={<span className="text-xs text-muted-foreground">{variants.length} quy cách</span>}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs text-muted-foreground">
                  <th className="py-2 pr-3 font-medium">Quy cách</th>
                  {p.isAgricultural && <th className="py-2 pr-3 font-medium">Quy đổi</th>}
                  <th className="py-2 pr-3 text-right font-medium">Giá bán</th>
                  <th className="py-2 text-right font-medium">Giá gốc</th>
                </tr>
              </thead>
              <tbody>
                {variants.map((x, i) => {
                  const d = discountOf(x.price, x.originalPrice);
                  return (
                    <tr key={i} className="border-b last:border-0">
                      <td className="py-2.5 pr-3 font-medium">{x.name || `Quy cách ${i + 1}`}</td>
                      {p.isAgricultural && (
                        <td className="py-2.5 pr-3 text-muted-foreground">{x.baseQuantity ? `${x.baseQuantity} ${unit}` : "—"}</td>
                      )}
                      <td className="whitespace-nowrap py-2.5 pr-3 text-right font-semibold tabular-nums">
                        {formatVnd(x.price)}
                        {d > 0 && <span className="ml-1.5 text-xs font-medium text-red-600">-{d}%</span>}
                      </td>
                      <td className="whitespace-nowrap py-2.5 text-right tabular-nums text-muted-foreground">
                        {d > 0 ? <span className="line-through">{formatVnd(x.originalPrice!)}</span> : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Section>

        {/* Thông tin chung */}
        <Section title="Thông tin chung">
          <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
            {p.isAgricultural && <Field label="Cây trồng / Giống">{p.cropName}</Field>}
            {p.isAgricultural && <Field label="Đơn vị tính cơ bản">{unit}</Field>}
            <Field label="Hạn sử dụng">{p.shelfLife}</Field>
            <Field label="Hướng dẫn bảo quản">{p.storage}</Field>
          </dl>
        </Section>

        {/* Liên kết cung ứng / Nông hộ */}
        {p.isAgricultural ? (
          <Section
            title="Liên kết cung ứng"
            aside={p.sources?.length ? <span className="text-xs text-muted-foreground">{p.sources.length} vườn</span> : undefined}
          >
            {p.sources?.length ? (
              <ul className="divide-y">
                {p.sources.map((s, i) => {
                  const f = farms?.find((x) => x.id === s.farmId);
                  const stock = p.gardenStock?.[s.regionId];
                  return (
                    <li key={i} className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium">{s.regionName ?? `Vườn #${s.regionId}`}</div>
                        <div className="truncate text-xs text-muted-foreground">
                          {s.farmName ?? f?.name ?? "—"}
                          {f && ` · ${FARM_TYPE[f.type]} · ${f.location}`}
                        </div>
                      </div>
                      {stock !== undefined && (
                        <span className="shrink-0 text-sm tabular-nums text-muted-foreground">
                          Tồn <span className="font-semibold text-foreground">{stock}</span> {unit}
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-sm text-destructive">Chưa liên kết vườn nông hộ nào.</p>
            )}
          </Section>
        ) : (
          <Section title="Nông hộ cung cấp">
            {suppliers.length ? (
              <ul className="divide-y">
                {suppliers.map((s, i) => {
                  const f = farms?.find((x) => x.id === s.farmId);
                  return (
                    <li key={i} className="py-2.5 first:pt-0 last:pb-0">
                      <div className="truncate text-sm font-medium">{f?.name ?? "Chưa chọn nông hộ"}</div>
                      {f && (
                        <div className="truncate text-xs text-muted-foreground">
                          {FARM_TYPE[f.type]} · {f.location}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">Sản phẩm tự sản xuất — không qua nông hộ.</p>
            )}
          </Section>
        )}

        {/* Mô tả */}
        <Section title="Mô tả">
          <p className="whitespace-pre-line text-sm leading-relaxed text-foreground/80">{p.description || "Chưa có mô tả."}</p>
        </Section>
      </div>
    </div>
  );
}
