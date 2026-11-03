import { AlertTriangle } from "lucide-react";
import type { Column, TableFilterDef } from "@Team-Trung-Vu-Khang/eco-shared-ui";
import placeholder from "@/assets/images/image-placeholder.webp";
import { StatusPill } from "@/components/common/ui-bits";
import { type CatalogProductListItem, type ProductCategory, type ProductStatus, SELL_UNIT_SHORT } from "@/features/shop-catalog";

const UNIT_NF = new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 3 });
import { formatVnd } from "@/lib/format";
import { CatalogStatusToggle } from "./CatalogStatusToggle";

export const CATALOG_STATUS: Record<ProductStatus, { label: string; className: string }> = {
  ACTIVE: { label: "Đang kinh doanh", className: "bg-emerald-100 text-emerald-800" },
  INACTIVE: { label: "Tạm ngưng kinh doanh", className: "bg-slate-100 text-slate-700" },
};

export const agriculturalPill = (agricultural: boolean) =>
  agricultural
    ? { label: "Nông sản", className: "bg-lime-100 text-lime-800" }
    : { label: "Thường", className: "bg-slate-100 text-slate-700" };

/** "85.000đ" or "85.000đ – 160.000đ" */
export const priceRange = (p: Pick<CatalogProductListItem, "minPrice" | "maxPrice">) =>
  p.minPrice === p.maxPrice ? formatVnd(p.minPrice) : `${formatVnd(p.minPrice)} – ${formatVnd(p.maxPrice)}`;

export const catalogProductColumns: Column<CatalogProductListItem>[] = [
  {
    key: "thumbnailUrl",
    label: "Ảnh",
    width: "72px",
    mobilePriority: "hidden",
    render: (_, p) => <img src={p.thumbnailUrl || placeholder} alt="" className="h-11 w-11 rounded-md border object-cover" />,
  },
  { key: "title", label: "Tên sản phẩm", mobilePriority: "primary" },
  {
    key: "code",
    label: "Mã sản phẩm",
    mobilePriority: "secondary",
    render: (v) => <span className="font-mono text-xs">{String(v)}</span>,
  },
  { key: "category", label: "Nhóm sản phẩm", render: (_, p) => p.category?.name ?? "—" },
  { key: "agricultural", label: "Loại", render: (_, p) => <StatusPill {...agriculturalPill(p.agricultural)} /> },
  {
    key: "minPrice",
    label: "Giá",
    render: (_, p) =>
      p.compareAtPrice ? (
        <div className="whitespace-nowrap">
          <div className="font-medium text-red-600">{priceRange(p)}</div>
          <div className="text-xs text-muted-foreground line-through">{formatVnd(p.compareAtPrice)}</div>
        </div>
      ) : (
        <span className="whitespace-nowrap">{priceRange(p)}</span>
      ),
  },
  {
    key: "totalInventory",
    label: "Tồn kho",
    render: (_, p) => (
      <div className="whitespace-nowrap tabular-nums">
        <span className="inline-flex items-center gap-1">
          {p.variantCount > 0 && (
            <>
              {p.totalInventory}
              <span className="text-xs text-muted-foreground">· {p.variantCount} quy cách</span>
            </>
          )}
          {p.lowStock && <AlertTriangle className="h-3.5 w-3.5 text-amber-600" aria-label="Sắp hết" />}
        </span>
        {p.baseUnit && (
          <div className="text-xs text-muted-foreground">
            ĐVT: <span className="font-medium text-foreground">{UNIT_NF.format(p.unitInventoryQuantity ?? 0)}</span> {SELL_UNIT_SHORT[p.baseUnit]}
          </div>
        )}
      </div>
    ),
  },
  {
    key: "status",
    label: "Trạng thái",
    mobilePriority: "badge",
    render: (_, p) => <StatusPill {...CATALOG_STATUS[p.status]} />,
  },
  { key: "pause", label: "Tạm ngưng kinh doanh", width: "120px", render: (_, p) => <CatalogStatusToggle product={p} /> },
];

export const catalogProductFilters = (categories: ProductCategory[] = []): TableFilterDef[] => [
  {
    key: "status",
    label: "Trạng thái",
    options: (Object.keys(CATALOG_STATUS) as ProductStatus[]).map((s) => ({ label: CATALOG_STATUS[s].label, value: s })),
  },
  { key: "categoryId", label: "Nhóm sản phẩm", options: categories.map((c) => ({ label: c.name, value: String(c.id) })) },
  {
    key: "agricultural",
    label: "Loại",
    options: [
      { label: "Nông sản", value: "true" },
      { label: "Thường", value: "false" },
    ],
  },
  {
    key: "lowStock",
    label: "Tồn kho",
    options: [
      { label: "Có quy cách sắp hết", value: "true" },
      { label: "Không sắp hết", value: "false" },
    ],
  },
];
