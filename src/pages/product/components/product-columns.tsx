import type { Column, TableFilterDef } from "@Team-Trung-Vu-Khang/eco-shared-ui";
import placeholder from "@/assets/images/image-placeholder.webp";
import { StatusPill } from "@/components/common/ui-bits";
import { BUSINESS_STATUS, PRODUCT_CATEGORIES, PRODUCT_SOURCE, type BusinessStatus, type Product, businessStatusOf } from "@/features/product";
import { formatVnd } from "@/lib/format";
import { ShelfToggle } from "./ShelfToggle";

export const productColumns: Column<Product>[] = [
  {
    key: "images",
    label: "Ảnh",
    width: "72px",
    mobilePriority: "hidden",
    render: (_, p) => (
      <img src={p.images[0] || placeholder} alt="" className="h-11 w-11 rounded-md border object-cover" />
    ),
  },
  { key: "name", label: "Tên sản phẩm", sortable: true, mobilePriority: "primary" },
  {
    key: "sku",
    label: "Mã sản phẩm",
    mobilePriority: "secondary",
    render: (v) => <span className="font-mono text-xs">{String(v)}</span>,
  },
  { key: "category", label: "Nhóm sản phẩm" },
  { key: "source", label: "Nguồn", render: (_, p) => <StatusPill {...PRODUCT_SOURCE[p.source ?? "self"]} /> },
  {
    key: "price",
    label: "Giá",
    sortable: true,
    render: (_, p) =>
      p.salePrice ? (
        <div className="whitespace-nowrap">
          <div className="font-medium text-red-600">{formatVnd(p.salePrice)}</div>
          <div className="text-xs text-muted-foreground line-through">{formatVnd(p.price)}</div>
        </div>
      ) : (
        <span className="whitespace-nowrap">{formatVnd(p.price)}</span>
      ),
  },
  {
    key: "listed",
    label: "Trạng thái",
    mobilePriority: "badge",
    render: (_, p) => <StatusPill {...BUSINESS_STATUS[businessStatusOf(p)]} />,
  },
  { key: "pause", label: "Tạm ngưng kinh doanh", width: "120px", render: (_, p) => <ShelfToggle product={p} /> },
];

export const productFilters: TableFilterDef[] = [
  {
    key: "listed",
    label: "Trạng thái",
    options: (Object.keys(BUSINESS_STATUS) as BusinessStatus[]).map((s) => ({
      label: BUSINESS_STATUS[s].label,
      value: s === "active" ? "true" : "false",
    })),
  },
  { key: "category", label: "Nhóm sản phẩm", options: PRODUCT_CATEGORIES.map((c) => ({ label: c, value: c })) },
];
