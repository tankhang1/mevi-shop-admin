import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Pencil, Plus, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Button,
  Card,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  useToast,
} from "@Team-Trung-Vu-Khang/eco-shared-ui";
import placeholder from "@/assets/images/image-placeholder.webp";
import { ROUTES } from "@/config/routes";
import { PRODUCT_STATUS, type Product, useDeleteProduct, useProducts } from "@/features/product";
import { getErrorMessage } from "@/lib/api-error";
import { formatVnd } from "@/lib/format";
import { EmptyBlock, LoadingBlock, PageHeader, StatusPill } from "@/components/common/ui-bits";

export default function ProductListPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { data: page, isLoading } = useProducts({ status: "all" });
  const data = page?.items ?? [];
  const del = useDeleteProduct();
  const [target, setTarget] = useState<Product | null>(null);

  const confirmDelete = async () => {
    if (!target) return;
    try {
      await del.mutateAsync(target.id);
      toast({ title: "Đã xoá sản phẩm", description: target.name });
      setTarget(null);
    } catch (e) {
      toast({ variant: "destructive", title: "Lỗi", description: getErrorMessage(e) });
    }
  };

  return (
    <>
      <PageHeader
        description={`${page?.total ?? 0} sản phẩm`}
        actions={
          <Button asChild>
            <Link href={ROUTES.productCreate}>
              <Plus className="mr-1 h-4 w-4" /> Thêm sản phẩm
            </Link>
          </Button>
        }
      />
      <Card className="overflow-x-auto">
        {isLoading ? (
          <LoadingBlock />
        ) : data.length === 0 ? (
          <EmptyBlock>Chưa có sản phẩm</EmptyBlock>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Ảnh</TableHead>
                <TableHead>Tên</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Danh mục</TableHead>
                <TableHead className="text-right">Giá</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="w-24 text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <img
                      src={p.images[0] || placeholder}
                      alt=""
                      className="h-11 w-11 rounded-md border object-cover"
                    />
                  </TableCell>
                  <TableCell className="min-w-40 font-medium">{p.name}</TableCell>
                  <TableCell className="font-mono text-xs">{p.sku}</TableCell>
                  <TableCell>{p.category}</TableCell>
                  <TableCell className="whitespace-nowrap text-right">
                    {p.salePrice ? (
                      <>
                        <div className="font-medium text-red-600">{formatVnd(p.salePrice)}</div>
                        <div className="text-xs text-muted-foreground line-through">{formatVnd(p.price)}</div>
                      </>
                    ) : (
                      formatVnd(p.price)
                    )}
                  </TableCell>
                  <TableCell>
                    <StatusPill {...PRODUCT_STATUS[p.status]} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => navigate(ROUTES.productEdit(p.id))} aria-label="Sửa">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setTarget(p)} aria-label="Xoá">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <AlertDialog open={!!target} onOpenChange={(o) => !o && setTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xoá sản phẩm?</AlertDialogTitle>
            <AlertDialogDescription>
              Sản phẩm "{target?.name}" sẽ bị xoá vĩnh viễn.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Huỷ</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={(e) => {
                e.preventDefault();
                void confirmDelete();
              }}
              disabled={del.isPending}
            >
              Xoá
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
