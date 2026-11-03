import { useState } from "react";
import {
  type Column,
  Button,
  DataTable,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Badge,
  useToast,
  Checkbox,
} from "@Team-Trung-Vu-Khang/eco-shared-ui";
import { Plus } from "lucide-react";
import {
  type StorefrontCatalogItem,
  useAddStorefrontProducts,
  useStorefrontCatalogProducts,
} from "@/features/storefront";
import { useTableParams } from "@/hooks/useTableParams";
import { getErrorMessage } from "@/lib/api-error";
import { formatVnd } from "@/lib/format";
import { fromSpringPage, toSpringPageParams } from "@/lib/pagination";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId?: string | number | null;
}

export function AddStorefrontProductsDialog({
  open,
  onOpenChange,
  workspaceId,
}: Props) {
  const { toast } = useToast();
  const table = useTableParams({}, 10);

  const queryParams = toSpringPageParams({
    keyword: table.params.keyword,
    page: table.params.page,
    size: table.params.size,
  });

  const { data, isFetching } = useStorefrontCatalogProducts(
    queryParams,
    workspaceId,
  );
  const page = fromSpringPage(data);

  const addProducts = useAddStorefrontProducts(workspaceId);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleAdd = async () => {
    if (selectedIds.length === 0) return;
    try {
      await addProducts.mutateAsync(selectedIds);
      toast({
        title: "Đã thêm vào gian hàng",
        description: `Đã thêm ${selectedIds.length} sản phẩm vào gian hàng thành công.`,
      });
      setSelectedIds([]);
      onOpenChange(false);
    } catch (err) {
      toast({
        title: "Không thể thêm sản phẩm",
        description: getErrorMessage(err),
        variant: "destructive",
      });
    }
  };

  const columns: Column<StorefrontCatalogItem>[] = [
    {
      key: "select",
      label: "",
      width: "48px",
      render: (_, item) => (
        <Checkbox
          checked={selectedIds.includes(item.product.id)}
          disabled={item.inStorefront}
          onCheckedChange={() => toggleSelect(item.product.id)}
        />
      ),
    },
    {
      key: "product",
      label: "Sản phẩm",
      render: (_, item) => (
        <div className="flex items-center gap-2.5">
          {item.product.thumbnailUrl ? (
            <img
              src={item.product.thumbnailUrl}
              alt=""
              className="h-10 w-10 shrink-0 rounded-lg border object-cover"
            />
          ) : (
            <div className="h-10 w-10 shrink-0 rounded-lg border bg-muted flex items-center justify-center text-xs text-muted-foreground">
              Ảnh
            </div>
          )}
          <div className="min-w-0">
            <p className="font-medium text-sm text-foreground truncate">
              {item.product.title}
            </p>
            <p className="text-xs text-muted-foreground">
              {item.product.category?.name || "Nông sản"}
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
      key: "inventory",
      label: "Tồn kho Mevi",
      render: (_, item) => (
        <span className="text-xs font-mono">{item.product.totalInventory}</span>
      ),
    },
    {
      key: "status",
      label: "Trạng thái",
      render: (_, item) =>
        item.inStorefront ? (
          <Badge variant="outline" className="text-xs bg-muted/60">
            Đã có trong gian hàng
          </Badge>
        ) : (
          <Badge variant="secondary" className="text-xs">
            Chưa thêm
          </Badge>
        ),
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Thêm sản phẩm từ Kho Mevi vào Gian hàng</DialogTitle>
          <DialogDescription>
            Chọn các sản phẩm đang bán trên sàn Mevi để đưa vào trưng bày và
            kinh doanh tại gian hàng của bạn.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-2">
          <DataTable
            {...table.bind(page, isFetching)}
            columns={columns}
            searchPlaceholder="Tìm theo tên sản phẩm, mã SKU..."
          />
        </div>

        <DialogFooter className="border-t pt-3 flex justify-between items-center">
          <div className="text-xs text-muted-foreground">
            Đã chọn:{" "}
            <span className="font-semibold text-foreground">
              {selectedIds.length}
            </span>{" "}
            sản phẩm
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Hủy
            </Button>
            <Button
              type="button"
              disabled={selectedIds.length === 0 || addProducts.isPending}
              onClick={handleAdd}
            >
              <Plus className="h-4 w-4 mr-1.5" />
              {addProducts.isPending
                ? "Đang thêm..."
                : `Thêm vào gian hàng (${selectedIds.length})`}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
