import type { Column, TableFilterDef } from "@Team-Trung-Vu-Khang/eco-shared-ui";
import placeholder from "@/assets/images/image-placeholder.webp";
import { StatusPill } from "@/components/common/ui-bits";
import { PRODUCT_CATEGORIES, PRODUCT_STATUS, type Product, type ProductStatus } from "@/features/product";
import { formatVnd } from "@/lib/format";

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
    label: "SKU",
    mobilePriority: "secondary",
    render: (v) => <span className="font-mono text-xs">{String(v)}</span>,
  },
  { key: "category", label: "Danh mục" },
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
    key: "status",
    label: "Trạng thái",
    mobilePriority: "badge",
    render: (v) => <StatusPill {...PRODUCT_STATUS[v as ProductStatus]} />,
  },
];

export const productFilters: TableFilterDef[] = [
  {
    key: "status",
    label: "Trạng thái",
    options: (Object.keys(PRODUCT_STATUS) as ProductStatus[]).map((s) => ({ label: PRODUCT_STATUS[s].label, value: s })),
  },
  { key: "category", label: "Danh mục", options: PRODUCT_CATEGORIES.map((c) => ({ label: c, value: c })) },
];
