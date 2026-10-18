import { useEffect, useRef, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useLocation, useParams } from "wouter";
import { ImagePlus, Loader2, X } from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
  useToast,
} from "@Team-Trung-Vu-Khang/eco-shared-ui";
import { EmptyBlock, LoadingBlock } from "@/components/common/ui-bits";
import { ROUTES } from "@/config/routes";
import {
  PRODUCT_CATEGORIES,
  PRODUCT_IMAGE,
  type ProductFormValues as FormValues,
  type ProductInput,
  productSchema as schema,
  useCreateProduct,
  useProduct,
  useUpdateProduct,
} from "@/features/product";
import { getErrorMessage } from "@/lib/api-error";

const readAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = reject;
    r.readAsDataURL(file);
  });

export default function ProductFormPage() {
  const { id } = useParams<{ id?: string }>();
  const isEdit = !!id;
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { data: product, isLoading } = useProduct(id);
  const create = useCreateProduct();
  const update = useUpdateProduct();
  // null = untouched → falls back to the loaded product's images
  const [editedImages, setEditedImages] = useState<string[] | null>(null);
  const images = editedImages ?? product?.images ?? [];
  const setImages = (fn: (prev: string[]) => string[]) => setEditedImages(fn(images));
  const fileRef = useRef<HTMLInputElement>(null);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { name: "", sku: "", category: "" } });

  useEffect(() => {
    if (!product) return;
    reset({ ...product, salePrice: product.salePrice ?? "" });
  }, [product, reset]);

  if (isEdit && isLoading) return <LoadingBlock />;
  if (isEdit && !product) {
    return (
      <EmptyBlock>
        Không tìm thấy sản phẩm.{" "}
        <Link href={ROUTES.products} className="text-primary underline">
          Quay lại danh sách
        </Link>
      </EmptyBlock>
    );
  }

  const onFiles = async (files: FileList | null) => {
    if (!files) return;
    const accepted: string[] = [];
    for (const f of Array.from(files)) {
      if (!PRODUCT_IMAGE.types.includes(f.type)) {
        toast({ variant: "destructive", title: "Định dạng không hỗ trợ", description: `${f.name} — chỉ JPEG/PNG/WebP` });
      } else if (f.size > PRODUCT_IMAGE.maxSize) {
        toast({ variant: "destructive", title: "Ảnh quá lớn", description: `${f.name} vượt quá 8 MB` });
      } else {
        accepted.push(await readAsDataUrl(f));
      }
    }
    setImages((prev) => [...prev, ...accepted]);
    if (fileRef.current) fileRef.current.value = "";
  };

  const onSubmit = async (values: FormValues) => {
    const parsed = schema.parse(values);
    const data: ProductInput = { ...parsed, salePrice: parsed.salePrice ?? null, images };
    try {
      if (isEdit) await update.mutateAsync({ id: id!, data });
      else await create.mutateAsync(data);
      toast({ title: isEdit ? "Đã cập nhật sản phẩm" : "Đã tạo sản phẩm", description: isEdit ? undefined : "Sản phẩm đang chờ duyệt" });
      navigate(ROUTES.products);
    } catch (e) {
      toast({ variant: "destructive", title: "Lỗi", description: getErrorMessage(e) });
    }
  };

  const field = (name: keyof FormValues, label: string, opts: { required?: boolean; type?: string; placeholder?: string } = {}) => (
    <div className="space-y-1.5">
      <Label htmlFor={name}>
        {label}
        {opts.required && <span className="text-destructive"> *</span>}
      </Label>
      <Input id={name} type={opts.type} placeholder={opts.placeholder} {...register(name)} />
      {errors[name] && <p className="text-xs text-destructive">{errors[name]?.message as string}</p>}
    </div>
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mx-auto max-w-4xl space-y-5">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Thông tin cơ bản</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          {field("name", "Tên sản phẩm", { required: true })}
          {field("sku", "SKU", { required: true })}
          <div className="space-y-1.5">
            <Label>
              Danh mục<span className="text-destructive"> *</span>
            </Label>
            <Controller
              control={control}
              name="category"
              render={({ field: f }) => (
                <Select key={product?.id} value={f.value} onValueChange={f.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn danh mục" />
                  </SelectTrigger>
                  <SelectContent>
                    {PRODUCT_CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.category && <p className="text-xs text-destructive">{errors.category.message}</p>}
          </div>
          <div />
          {field("price", "Giá bán (VND)", { required: true, type: "number" })}
          {field("salePrice", "Giá khuyến mãi (VND)", { type: "number" })}
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="description">Mô tả</Label>
            <Textarea id="description" rows={4} {...register("description")} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Chi tiết</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          {field("origin", "Nguồn gốc / vùng trồng")}
          {field("packaging", "Quy cách đóng gói")}
          {field("shelfLife", "Hạn sử dụng")}
          {field("storage", "Hướng dẫn bảo quản")}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Hình ảnh</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {images.map((src, i) => (
              <div key={i} className="group relative h-24 w-24 overflow-hidden rounded-lg border">
                <img src={src} alt="" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => setImages((prev) => prev.filter((_, j) => j !== i))}
                  className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white"
                  aria-label="Xoá ảnh"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex h-24 w-24 flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed text-xs text-muted-foreground hover:border-primary hover:text-primary"
            >
              <ImagePlus className="h-5 w-5" /> Thêm ảnh
            </button>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">JPEG, PNG, WebP — tối đa 8 MB mỗi ảnh.</p>
          <input
            ref={fileRef}
            type="file"
            accept={PRODUCT_IMAGE.types.join(",")}
            multiple
            hidden
            onChange={(e) => void onFiles(e.target.files)}
          />
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => navigate(ROUTES.products)}>
          Huỷ
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
          {isEdit ? "Lưu thay đổi" : "Tạo sản phẩm"}
        </Button>
      </div>
    </form>
  );
}
