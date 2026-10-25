import { useState } from "react";
import type { ReactNode } from "react";
import { Clock, FileText, Package, ShieldCheck, Sprout, Thermometer } from "lucide-react";
import { cn } from "@Team-Trung-Vu-Khang/eco-shared-ui";
import placeholder from "@/assets/images/image-placeholder.webp";
import type { ProductInput } from "@/features/product";
import { FARM_TYPE, useFarms } from "@/features/farm";
import { formatVnd } from "@/lib/format";

type Props = { product: Partial<ProductInput> & Pick<ProductInput, "price"> & { shopName?: string } };

const discountOf = (price: number, original?: number | null) =>
  original && original > price && price ? Math.min(99, Math.round((1 - price / original) * 100)) : 0;

function Section({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <section className="space-y-3 rounded-2xl border bg-card p-4 shadow-sm sm:p-5">
      <h3 className="flex items-center gap-2 text-base font-bold text-foreground">
        <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">{icon}</span>
        {title}
      </h3>
      {children}
    </section>
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
    : [{ name: p.packaging ?? "", price: p.salePrice || p.price, originalPrice: p.salePrice ? p.price : null }];
  const suppliers = p.suppliers?.length ? p.suppliers : p.farmId ? [{ farmId: p.farmId, importPrice: 0 }] : [];
  const [variantIndex, setVariantIndex] = useState(0);
  const v = variants[Math.min(variantIndex, variants.length - 1)];
  const discount = discountOf(v.price, v.originalPrice);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
      <div className="space-y-3 lg:sticky lg:top-4 lg:self-start">
        <div className="relative aspect-square overflow-hidden rounded-2xl border bg-muted">
          <img src={images[active] || images[0] || placeholder} alt="" className="h-full w-full object-cover" />
          {discount > 0 && (
            <span className="absolute left-3 top-3 rounded-full bg-[#c8643c] px-3 py-1 text-sm font-bold text-white">-{discount}%</span>
          )}
        </div>
        {images.length > 1 && (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(64px,1fr))] gap-2">
            {images.map((src, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActive(i)}
                className={cn(
                  "aspect-square overflow-hidden rounded-xl border-2 transition",
                  i === active ? "border-primary" : "border-transparent opacity-60 hover:opacity-100",
                )}
              >
                <img src={src} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {p.shopName && <span className="font-medium text-muted-foreground">{p.shopName}</span>}
            <span className="rounded-full bg-[#c8643c] px-3 py-1 font-semibold text-white">
              {p.category || "Chưa chọn nhóm"}
            </span>
            <span className="rounded-md border border-foreground/20 bg-card px-2 py-1 font-mono font-medium text-foreground">{p.sku || "—"}</span>
          </div>
          <h2 className="text-2xl font-bold leading-tight text-[#1f5a44] sm:text-3xl">{p.name || "Chưa đặt tên"}</h2>
          {!!p.certifications?.length && (
            <div className="flex flex-wrap gap-1.5">
              {p.certifications.map((c) => (
                <span key={c} className="inline-flex items-center gap-1 rounded-full border border-emerald-600/30 bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-900">
                  <ShieldCheck className="h-3.5 w-3.5" /> {c}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Price + quy cách */}
        <div className="rounded-2xl border border-[#1f5a44]/20 bg-[#1f5a44]/[0.06] p-4 shadow-sm sm:p-5">
          <div className="flex flex-wrap items-end gap-x-3 gap-y-1">
            <span className="text-3xl font-extrabold tabular-nums text-[#1f5a44]">{formatVnd(v.price)}</span>
            {discount > 0 && (
              <span className="pb-1 text-lg font-medium text-foreground/60 line-through tabular-nums">{formatVnd(v.originalPrice!)}</span>
            )}
          </div>
          <div className="mt-4 space-y-2">
            <p className="text-xs font-bold uppercase tracking-wide text-foreground/70">Quy cách</p>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-2">
              {variants.map((x, i) => {
                const d = discountOf(x.price, x.originalPrice);
                const on = i === variantIndex;
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setVariantIndex(i)}
                    className={cn(
                      "rounded-xl border px-3 py-2 text-left transition",
                      on ? "border-[#1f5a44] bg-[#1f5a44] text-white shadow" : "border-foreground/15 bg-card hover:border-[#1f5a44]/60",
                    )}
                  >
                    <span className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-semibold">{x.name || `Quy cách ${i + 1}`}</span>
                      {d > 0 && <span className={cn("shrink-0 rounded px-1 text-[11px] font-bold", on ? "bg-white/20 text-white" : "bg-[#c8643c]/10 text-[#c8643c]")}>-{d}%</span>}
                    </span>
                    <span className={cn("mt-0.5 block text-sm font-medium tabular-nums", on ? "text-white/90" : "text-foreground/70")}>{formatVnd(x.price)}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bảo quản */}
        <Section icon={<Package className="h-4 w-4" />} title="Bảo quản">
          <dl className="grid gap-3 sm:grid-cols-2">
            <div className="flex items-start gap-3 rounded-xl border border-primary/15 bg-primary/[0.06] p-3">
              <Clock className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div>
                <dt className="text-xs text-muted-foreground">Hạn sử dụng</dt>
                <dd className="text-sm font-semibold">{p.shelfLife || "—"}</dd>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-xl border border-primary/15 bg-primary/[0.06] p-3">
              <Thermometer className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div>
                <dt className="text-xs text-muted-foreground">Hướng dẫn bảo quản</dt>
                <dd className="text-sm font-semibold">{p.storage || "—"}</dd>
              </div>
            </div>
          </dl>
        </Section>

        {/* Nông hộ */}
        <Section icon={<Sprout className="h-4 w-4" />} title="Nông hộ cung cấp">
          {suppliers.length ? (
            <ul className="space-y-2">
              {suppliers.map((s, i) => {
                const f = farms?.find((x) => x.id === s.farmId);
                const initials = (f?.ownerName ?? f?.name ?? "?").split(" ").slice(-1)[0]?.[0] ?? "?";
                return (
                  <li key={i} className="flex items-center gap-3 rounded-xl border border-foreground/10 bg-muted/40 p-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#1f5a44] text-sm font-semibold text-white">
                      {initials}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold">{f?.name ?? "Chưa chọn nông hộ"}</span>
                      {f && (
                        <span className="block truncate text-xs text-muted-foreground">
                          {FARM_TYPE[f.type]} · {f.location}
                        </span>
                      )}
                    </span>
                    <span className="shrink-0 text-right">
                      <span className="block text-[11px] font-semibold uppercase tracking-wide text-foreground/60">Giá nhập</span>
                      <span className="text-base font-bold tabular-nums text-[#1f5a44]">{s.importPrice ? formatVnd(s.importPrice) : "—"}</span>
                    </span>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="rounded-xl border border-dashed p-4 text-center text-sm text-muted-foreground">Không có nông hộ — sản phẩm tự sản xuất.</p>
          )}
        </Section>

        {/* Mô tả */}
        <Section icon={<FileText className="h-4 w-4" />} title="Mô tả">
          <p className="whitespace-pre-line text-sm leading-relaxed text-foreground/80">{p.description || "Chưa có mô tả."}</p>
        </Section>
      </div>
    </div>
  );
}
