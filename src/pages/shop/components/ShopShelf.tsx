import { Card } from "@Team-Trung-Vu-Khang/eco-shared-ui";
import placeholder from "@/assets/images/image-placeholder.webp";
import { EmptyBlock, LoadingBlock } from "@/components/common/ui-bits";
import { useProducts } from "@/features/product";
import { formatVnd } from "@/lib/format";
import { ShelfToggle } from "@/pages/product/components/ShelfToggle";

/** Which approved products the shop shows on its storefront */
export function ShopShelf() {
  const { data: page, isLoading } = useProducts({ status: "approved", size: 100 });
  const products = page?.items ?? [];
  const listed = products.filter((p) => p.listed).length;

  return (
    <Card className="p-4 sm:p-5">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h2 className="font-semibold">Sản phẩm kinh doanh</h2>
          <p className="text-sm text-muted-foreground">Bật "Tạm dừng" để ẩn sản phẩm khỏi cửa hàng và không cho thêm vào giỏ hàng.</p>
        </div>
        {!isLoading && (
          <span className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{listed}</span>/{products.length} đang kinh doanh
          </span>
        )}
      </div>

      {isLoading ? (
        <LoadingBlock />
      ) : products.length === 0 ? (
        <EmptyBlock>Chưa có sản phẩm nào được duyệt.</EmptyBlock>
      ) : (
        <ul className="divide-y">
          {products.map((p) => (
            <li key={p.id} className="flex items-center gap-3 py-2.5">
              <img src={p.images[0] || placeholder} alt="" className="h-10 w-10 shrink-0 rounded-md border object-cover" />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">{p.name}</div>
                <div className="text-xs text-muted-foreground">
                  {p.sku} · {formatVnd(p.salePrice ?? p.price)}
                </div>
              </div>
              <ShelfToggle product={p} />
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
