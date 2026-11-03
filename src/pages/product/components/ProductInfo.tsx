import { useState } from "react";
import type { ReactNode } from "react";
import { ShieldCheck, Sprout } from "lucide-react";
import { cn } from "@Team-Trung-Vu-Khang/eco-shared-ui";
import placeholder from "@/assets/images/image-placeholder.webp";
import {
  type CatalogProduct,
  SELL_UNIT_SHORT,
  SHELF_LIFE_UNIT_LABEL,
  STORAGE_CONDITION_LABEL,
} from "@/features/shop-catalog";
import { formatVnd } from "@/lib/format";

/** What the view needs — a saved product, or the form's values on the review step */
export type ProductView = Pick<
  CatalogProduct,
  | "title"
  | "code"
  | "agricultural"
  | "certifications"
  | "media"
  | "shelfLifeValue"
  | "shelfLifeUnit"
  | "storageCondition"
  | "storageInstructions"
  | "description"
  | "supplySources"
  | "productionSubject"
  | "productionSubjectVariant"
  | "baseUnit"
  | "unitSku"
  | "unitPrice"
  | "unitCompareAtPrice"
> & {
  category: { name: string } | null;
  /** Saved product only */
  unitInventoryQuantity?: number | null;
  variants: (Pick<CatalogProduct["variants"][number], "title" | "sku" | "price" | "compareAtPrice" | "unitQuantity"> & {
    inventoryQuantity?: number;
    availableQuantity?: number;
  })[];
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
export function ProductInfo({ product: p }: { product: ProductView }) {
  const images = p.media.map((m) => m.url);
  const [active, setActive] = useState(0);
  const unit = p.baseUnit ? SELL_UNIT_SHORT[p.baseUnit] : null;
  // Headline price: đơn vị tính first, else the first quy cách
  const first =
    unit && p.unitPrice != null
      ? { price: p.unitPrice, compareAtPrice: p.unitCompareAtPrice, suffix: ` / ${unit}` }
      : p.variants[0] && { ...p.variants[0], suffix: "" };
  const discount = first ? discountOf(first.price, first.compareAtPrice) : 0;
  const showStock = p.variants.some((v) => v.inventoryQuantity !== undefined) || p.unitInventoryQuantity != null;

  return (
    <div className="grid gap-5 lg:grid-cols-[420px_minmax(0,1fr)]">
      {/* Ảnh */}
      <div className="space-y-2 lg:sticky lg:top-4 lg:self-start">
        <div className="aspect-square overflow-hidden rounded-xl border bg-muted">
          <img src={images[active] || images[0] || placeholder} alt="" className="h-full w-full object-cover" />
        </div>
        {images.length > 1 && (
          <div className="grid grid-cols-5 gap-2">
            {p.media.map((m, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActive(i)}
                className={cn(
                  "aspect-square overflow-hidden rounded-lg border-2 transition",
                  i === active ? "border-primary" : "border-transparent opacity-60 hover:opacity-100",
                )}
              >
                <img src={m.thumbnailUrl || m.url} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="min-w-0 space-y-4">
        {/* Tiêu đề & giá */}
        <section className="rounded-xl border bg-card p-4 sm:p-5">
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="rounded-md bg-muted px-2 py-0.5 font-medium">{p.category?.name || "Chưa chọn nhóm"}</span>
            <span className="rounded-md bg-muted px-2 py-0.5 font-mono text-muted-foreground">{p.code || "Tự sinh mã"}</span>
            {p.agricultural && (
              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 font-medium text-emerald-700">
                <Sprout className="h-3 w-3" /> Nông sản
              </span>
            )}
          </div>
          <h2 className="mt-2 text-xl font-semibold leading-snug sm:text-2xl">{p.title || "Chưa đặt tên"}</h2>
          {first && (
            <div className="mt-2 flex flex-wrap items-baseline gap-2">
              <span className="text-2xl font-bold tabular-nums text-primary">
                {formatVnd(first.price)}
                <span className="text-sm font-medium text-muted-foreground">{first.suffix}</span>
              </span>
              {discount > 0 && (
                <>
                  <span className="text-sm text-muted-foreground line-through tabular-nums">{formatVnd(first.compareAtPrice!)}</span>
                  <span className="rounded bg-red-50 px-1.5 text-xs font-semibold text-red-600">-{discount}%</span>
                </>
              )}
            </div>
          )}
          {!!p.certifications.length && (
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
        <Section
          title="Hình thức bán & giá"
          aside={
            <span className="text-xs text-muted-foreground">
              {[unit && `Đơn vị tính (${unit})`, p.variants.length && `${p.variants.length} quy cách`].filter(Boolean).join(" · ")}
            </span>
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs text-muted-foreground">
                  <th className="py-2 pr-3 font-medium">Hình thức</th>
                  <th className="py-2 pr-3 font-medium">SKU</th>
                  <th className="py-2 pr-3 text-right font-medium">Giá bán</th>
                  <th className="py-2 pr-3 text-right font-medium">Giá gốc</th>
                  {showStock && <th className="py-2 pr-3 text-right font-medium">Tồn kho</th>}
                  {showStock && <th className="py-2 text-right font-medium">Khả dụng</th>}
                </tr>
              </thead>
              <tbody>
                {unit && (
                  <tr className="border-b bg-primary/[0.03]">
                    <td className="py-2.5 pr-3 font-medium">Theo đơn vị tính ({unit})</td>
                    <td className="py-2.5 pr-3 font-mono text-xs text-muted-foreground">{p.unitSku || "Tự sinh"}</td>
                    <td className="whitespace-nowrap py-2.5 pr-3 text-right font-semibold tabular-nums">
                      {p.unitPrice != null ? `${formatVnd(p.unitPrice)} / ${unit}` : <span className="text-destructive">Chưa có giá</span>}
                    </td>
                    <td className="whitespace-nowrap py-2.5 pr-3 text-right tabular-nums text-muted-foreground">
                      {p.unitPrice != null && discountOf(p.unitPrice, p.unitCompareAtPrice) > 0 ? (
                        <span className="line-through">{formatVnd(p.unitCompareAtPrice!)}</span>
                      ) : (
                        "—"
                      )}
                    </td>
                    {showStock && (
                      <td className="py-2.5 pr-3 text-right tabular-nums">
                        {p.unitInventoryQuantity != null ? `${p.unitInventoryQuantity} ${unit}` : "—"}
                      </td>
                    )}
                    {showStock && <td className="py-2.5 text-right tabular-nums text-muted-foreground">—</td>}
                  </tr>
                )}
                {p.variants.map((x, i) => {
                  const d = discountOf(x.price, x.compareAtPrice);
                  return (
                    <tr key={i} className="border-b last:border-0">
                      <td className="py-2.5 pr-3 font-medium">
                        {x.title || `Quy cách ${i + 1}`}
                        {unit && x.unitQuantity != null && (
                          <span className="ml-1.5 text-xs font-normal text-muted-foreground">= {x.unitQuantity} {unit}</span>
                        )}
                      </td>
                      <td className="py-2.5 pr-3 font-mono text-xs text-muted-foreground">{x.sku || "Tự sinh"}</td>
                      <td className="whitespace-nowrap py-2.5 pr-3 text-right font-semibold tabular-nums">
                        {formatVnd(x.price)}
                        {d > 0 && <span className="ml-1.5 text-xs font-medium text-red-600">-{d}%</span>}
                      </td>
                      <td className="whitespace-nowrap py-2.5 pr-3 text-right tabular-nums text-muted-foreground">
                        {d > 0 ? <span className="line-through">{formatVnd(x.compareAtPrice!)}</span> : "—"}
                      </td>
                      {showStock && <td className="py-2.5 pr-3 text-right tabular-nums">{x.inventoryQuantity ?? "—"}</td>}
                      {showStock && (
                        <td className="py-2.5 text-right font-medium tabular-nums">{x.availableQuantity ?? x.inventoryQuantity ?? "—"}</td>
                      )}
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
            <Field label="Hạn sử dụng">
              {p.shelfLifeValue && p.shelfLifeUnit && `${p.shelfLifeValue} ${SHELF_LIFE_UNIT_LABEL[p.shelfLifeUnit].toLowerCase()}`}
            </Field>
            <Field label="Điều kiện bảo quản">{p.storageCondition && STORAGE_CONDITION_LABEL[p.storageCondition]}</Field>
            <Field label="Hướng dẫn bảo quản">{p.storageInstructions}</Field>
            {p.agricultural && <Field label="Cây trồng">{p.productionSubject?.name ?? (p.productionSubject && "Đã xoá")}</Field>}
            {p.agricultural && <Field label="Giống">{p.productionSubjectVariant ? (p.productionSubjectVariant.name ?? "Đã xoá") : "Không giới hạn"}</Field>}
          </dl>
        </Section>

        {/* Nguồn cung nông sản */}
        {p.agricultural && (
          <Section
            title="Nguồn cung nông sản"
            aside={p.supplySources.length ? <span className="text-xs text-muted-foreground">{p.supplySources.length} nguồn</span> : undefined}
          >
            {p.supplySources.length ? (
              <ul className="divide-y">
                {p.supplySources.map((s, i) => (
                  <li key={i} className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">
                        {s.productionZone.name ?? `Vườn #${s.productionZone.id} (đã xoá)`}
                        {s.productionZone.code && (
                          <span className="ml-1.5 font-mono text-xs text-muted-foreground">{s.productionZone.code}</span>
                        )}
                      </div>
                      <div className="truncate text-xs text-muted-foreground">
                        {s.workspace.name ?? "—"}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">Chưa liên kết vườn nông hộ nào (không bắt buộc).</p>
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
