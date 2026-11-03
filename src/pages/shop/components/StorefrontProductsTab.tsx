import { useState } from "react";
import {
  type Column,
  Button,
  DataTable,
  Badge,
  useToast,
  Card,
} from "@Team-Trung-Vu-Khang/eco-shared-ui";
import {
  ArrowDown,
  ArrowUp,
  Eye,
  EyeOff,
  PackagePlus,
  Trash2,
} from "lucide-react";
import {
  type StorefrontProductItem,
  useRemoveStorefrontProduct,
  useReorderStorefrontProducts,
  useStorefrontProducts,
  useUpdateStorefrontProductVisibility,
} from "@/features/storefront";
import { useTableParams } from "@/hooks/useTableParams";
import { getErrorMessage } from "@/lib/api-error";
import { formatVnd } from "@/lib/format";
import { fromSpringPage, toSpringPageParams } from "@/lib/pagination";
import { AddStorefrontProductsDialog } from "./AddStorefrontProductsDialog";

interface Props {
  workspaceId?: string | number | null;
}

export function StorefrontProductsTab({ workspaceId }: Props) {
  const { toast } = useToast();
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  const table = useTableParams({}, 20);
  const queryParams = toSpringPageParams({
    page: table.params.page,
    size: table.params.size,
  });

  const { data, isFetching } = useStorefrontProducts(queryParams, workspaceId);
  const isInitialLoading = !data && isFetching;
  const page = fromSpringPage(data);
  const items = page?.items ?? [];

  const updateVisibility = useUpdateStorefrontProductVisibility(workspaceId);
  const removeProduct = useRemoveStorefrontProduct(workspaceId);
  const reorderProducts = useReorderStorefrontProducts(workspaceId);

  const handleToggleVisibility = async (
    productId: number,
    currentVisible: boolean,
  ) => {
    try {
      await updateVisibility.mutateAsync({
        productId,
        visible: !currentVisible,
      });
      toast({
        title: !currentVisible ? "Đã hiển thị sản phẩm" : "Đã tạm ẩn sản phẩm",
        description: !currentVisible
          ? "Sản phẩm sẽ xuất hiện trên trang gian hàng public."
          : "Sản phẩm tạm thời được ẩn khỏi trang gian hàng.",
      });
    } catch (err) {
      toast({
        title: "Lỗi cập nhật hiển thị",
        description: getErrorMessage(err),
        variant: "destructive",
      });
    }
  };

  const handleRemove = async (productId: number, title: string) => {
    if (
      !window.confirm(`Bạn có chắc muốn gỡ sản phẩm "${title}" khỏi gian hàng?`)
    ) {
      return;
    }
    try {
      await removeProduct.mutateAsync(productId);
      toast({
        title: "Đã gỡ sản phẩm",
        description: `Đã gỡ "${title}" khỏi gian hàng.`,
      });
    } catch (err) {
      toast({
        title: "Lỗi gỡ sản phẩm",
        description: getErrorMessage(err),
        variant: "destructive",
      });
    }
  };

  const handleMoveOrder = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    const newOrder = [...items];
    const temp = newOrder[index];
    newOrder[index] = newOrder[targetIndex];
    newOrder[targetIndex] = temp;

    const orderedIds = newOrder.map((i) => i.product.id);
    try {
      await reorderProducts.mutateAsync(orderedIds);
    } catch (err) {
      toast({
        title: "Lỗi sắp xếp",
        description: getErrorMessage(err),
        variant: "destructive",
      });
    }
  };

  const visibleCount = items.filter(
    (i) => i.visible && i.product.status === "ACTIVE",
  ).length;
  const hiddenCount = items.filter((i) => !i.visible).length;

  const columns: Column<StorefrontProductItem>[] = [
    {
      key: "order",
      label: "Thứ tự",
      width: "90px",
      render: (_, row) => {
        const index = items.findIndex((i) => i.product.id === row.product.id);
        return (
          <div className="flex items-center gap-1">
            <span className="font-mono text-xs w-5 text-muted-foreground text-center">
              {index + 1}
            </span>
            <div className="flex flex-col">
              <Button
                size="icon"
                variant="ghost"
                className="h-5 w-5"
                disabled={index === 0}
                onClick={() => handleMoveOrder(index, "up")}
                title="Di chuyển lên"
              >
                <ArrowUp className="h-3 w-3" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-5 w-5"
                disabled={index === items.length - 1}
                onClick={() => handleMoveOrder(index, "down")}
                title="Di chuyển xuống"
              >
                <ArrowDown className="h-3 w-3" />
              </Button>
            </div>
          </div>
        );
      },
    },
    {
      key: "product",
      label: "Sản phẩm",
      mobilePriority: "primary",
      render: (_, item) => (
        <div className="flex items-center gap-3">
          {item.product.thumbnailUrl ? (
            <img
              src={item.product.thumbnailUrl}
              alt=""
              className="h-11 w-11 shrink-0 rounded-lg border object-cover"
            />
          ) : (
            <div className="h-11 w-11 shrink-0 rounded-lg border bg-muted flex items-center justify-center text-xs text-muted-foreground font-medium">
              Ảnh
            </div>
          )}
          <div className="min-w-0">
            <p className="font-medium text-sm text-foreground truncate">
              {item.product.title}
            </p>
            <p className="text-xs text-muted-foreground">
              {item.product.category?.name || "Nông sản"} · Tồn kho:{" "}
              {item.product.totalInventory}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "price",
      label: "Giá bán",
      render: (_, item) => (
        <span className="text-sm font-semibold text-emerald-700">
          {formatVnd(item.product.minPrice)}
        </span>
      ),
    },
    {
      key: "status",
      label: "Trạng thái",
      mobilePriority: "badge",
      render: (_, item) => {
        if (item.product.status === "INACTIVE") {
          return (
            <Badge variant="destructive" className="text-xs">
              Mevi tạm ngưng bán
            </Badge>
          );
        }
        if (!item.visible) {
          return (
            <Badge
              variant="secondary"
              className="text-xs text-amber-700 bg-amber-50 border-amber-200"
            >
              Đang ẩn
            </Badge>
          );
        }
        return (
          <Badge
            variant="outline"
            className="text-xs text-emerald-700 border-emerald-300 bg-emerald-50/50"
          >
            Đang hiển thị
          </Badge>
        );
      },
    },
    {
      key: "actions",
      label: "Thao tác",
      render: (_, item) => (
        <div className="flex items-center gap-1.5">
          <Button
            size="sm"
            variant="ghost"
            className="h-8 px-2"
            title={
              item.visible ? "Tạm ẩn khỏi gian hàng" : "Hiển thị lên gian hàng"
            }
            disabled={
              updateVisibility.variables?.productId === item.product.id &&
              updateVisibility.isPending
            }
            onClick={() =>
              handleToggleVisibility(item.product.id, item.visible)
            }
          >
            {item.visible ? (
              <>
                <EyeOff className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                <span className="text-xs">Ẩn</span>
              </>
            ) : (
              <>
                <Eye className="h-3.5 w-3.5 mr-1 text-emerald-600" />
                <span className="text-xs">Hiện</span>
              </>
            )}
          </Button>

          <Button
            size="sm"
            variant="ghost"
            className="h-8 px-2 text-destructive hover:bg-destructive/10"
            title="Gỡ khỏi gian hàng"
            disabled={
              removeProduct.variables === item.product.id &&
              removeProduct.isPending
            }
            onClick={() => handleRemove(item.product.id, item.product.title)}
          >
            <Trash2 className="h-3.5 w-3.5 mr-1" />
            <span className="text-xs">Gỡ</span>
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Card className="p-4 sm:p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3">
        <div>
          <h2 className="text-base font-bold text-foreground">
            Sản phẩm trong gian hàng
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Sản phẩm được lấy từ kho sàn Mevi. Bạn có thể sắp xếp thứ tự hoặc
            ẩn/hiện sản phẩm tùy ý.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-xs text-muted-foreground hidden sm:block">
            <span className="font-semibold text-emerald-600">
              {visibleCount}
            </span>{" "}
            hiển thị ·{" "}
            <span className="font-semibold text-amber-600">{hiddenCount}</span>{" "}
            đang ẩn
          </div>
          <Button onClick={() => setAddDialogOpen(true)}>
            <PackagePlus className="h-4 w-4 mr-1.5" />
            Thêm từ kho Mevi
          </Button>
        </div>
      </div>

      <DataTable
        {...table.bind(page, isInitialLoading)}
        columns={columns}
        searchable={false}
        enableMobileCard
      />

      <AddStorefrontProductsDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        workspaceId={workspaceId}
      />
    </Card>
  );
}
