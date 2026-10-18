import { useRef } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { Check, ImagePlus, Star, X } from "lucide-react";
import { readAsDataUrl } from "@/lib/file";
import { FormField, FormItem, FormMessage, cn, useToast } from "@Team-Trung-Vu-Khang/eco-shared-ui";
import { SelectField, TextField, TextareaField } from "@/components/form";
import { PRODUCT_CATEGORIES, PRODUCT_CERTIFICATIONS, PRODUCT_IMAGE, type ProductFormValues } from "@/features/product";
import { ProductInfo } from "../ProductInfo";

const CATEGORY_OPTIONS = PRODUCT_CATEGORIES.map((c) => ({ label: c, value: c }));

/** Bước 1 */
/** Bước 1 — `shopOptions` only for root (shop admins always create in their own shop) */
export function BasicInfoSection({ shopOptions }: { shopOptions?: { label: string; value: string }[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {shopOptions && (
        <SelectField<ProductFormValues>
          name="shopId"
          label="Gian hàng"
          required
          className="sm:col-span-2"
          options={shopOptions}
          placeholder="Chọn gian hàng sở hữu sản phẩm"
          description="Sản phẩm sẽ hiển thị trên trang của gian hàng này."
        />
      )}
      <TextField<ProductFormValues> name="name" label="Tên sản phẩm" required className="sm:col-span-2" placeholder="VD: Gạo ST25 hữu cơ" />
      <TextField<ProductFormValues> name="sku" label="SKU" required placeholder="VD: GAO-ST25-5KG" description="Mã duy nhất, dùng để quản lý kho" />
      <SelectField<ProductFormValues> name="category" label="Danh mục" required options={CATEGORY_OPTIONS} placeholder="Chọn danh mục" />
      <TextareaField<ProductFormValues> name="description" label="Mô tả" className="sm:col-span-2" rows={5} placeholder="Đặc điểm, câu chuyện sản phẩm..." />
    </div>
  );
}

/** Bước 2 */
export function PricingSection() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField<ProductFormValues> name="price" label="Giá bán" required type="number" suffix="VND" />
        <TextField<ProductFormValues> name="salePrice" label="Giá khuyến mãi" type="number" suffix="VND" description="Để trống nếu không khuyến mãi" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField<ProductFormValues> name="origin" label="Nguồn gốc / vùng trồng" placeholder="VD: Sóc Trăng" />
        <TextField<ProductFormValues> name="packaging" label="Quy cách đóng gói" placeholder="VD: Túi 5kg" />
        <TextField<ProductFormValues> name="shelfLife" label="Hạn sử dụng" placeholder="VD: 12 tháng" />
        <TextField<ProductFormValues> name="storage" label="Hướng dẫn bảo quản" placeholder="VD: Nơi khô ráo, thoáng mát" />
      </div>
      <CertificationsField />
    </div>
  );
}

/** Bước 2 — certifications shown on the storefront trace card */
export function CertificationsField() {
  const { control } = useFormContext<ProductFormValues>();
  return (
    <FormField
      control={control}
      name="certifications"
      render={({ field }) => {
        const value: string[] = field.value ?? [];
        const toggle = (c: string) => field.onChange(value.includes(c) ? value.filter((x) => x !== c) : [...value, c]);
        return (
          <FormItem>
            <p className="text-sm font-medium">Chứng nhận</p>
            <div className="flex flex-wrap gap-2">
              {PRODUCT_CERTIFICATIONS.map((c) => {
                const on = value.includes(c);
                return (
                  <button
                    key={c}
                    type="button"
                    role="checkbox"
                    aria-checked={on}
                    onClick={() => toggle(c)}
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full border px-3 py-1 text-sm transition-colors",
                      on ? "border-primary bg-primary/10 font-medium text-primary" : "hover:border-primary/50",
                    )}
                  >
                    {on && <Check className="h-3.5 w-3.5" />} {c}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground">Chỉ chọn chứng nhận còn hiệu lực; Mevi sẽ kiểm tra giấy tờ khi duyệt.</p>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}

/** Bước 3 — first image is the cover */
export function ImagesSection() {
  const { control } = useFormContext<ProductFormValues>();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <FormField
      control={control}
      name="images"
      render={({ field }) => {
        const images: string[] = field.value ?? [];
        const set = (next: string[]) => field.onChange(next);

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
          set([...images, ...accepted]);
          if (fileRef.current) fileRef.current.value = "";
        };

        return (
          <FormItem>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {images.map((src, i) => (
                <div key={i} className="group relative aspect-square overflow-hidden rounded-xl border bg-muted">
                  <img src={src} alt="" className="h-full w-full object-cover" />
                  {i === 0 ? (
                    <span className="absolute left-2 top-2 rounded-md bg-black/60 px-1.5 py-0.5 text-[11px] font-medium text-white">
                      Ảnh bìa
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => set([src, ...images.filter((_, j) => j !== i)])}
                      className="absolute left-2 top-2 flex items-center gap-1 rounded-md bg-black/60 px-1.5 py-0.5 text-[11px] text-white opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <Star className="h-3 w-3" /> Đặt làm bìa
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => set(images.filter((_, j) => j !== i))}
                    className="absolute right-2 top-2 rounded-full bg-black/60 p-1 text-white"
                    aria-label="Xoá ảnh"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
              {images.length < 8 && (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className={cn(
                    "flex aspect-square flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary",
                  )}
                >
                  <ImagePlus className="h-6 w-6" />
                  Thêm ảnh
                </button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              JPEG, PNG, WebP — tối đa 8 MB/ảnh, tối đa 8 ảnh. Ảnh đầu tiên là ảnh bìa.
            </p>
            <input
              ref={fileRef}
              type="file"
              accept={PRODUCT_IMAGE.types.join(",")}
              multiple
              hidden
              onChange={(e) => void onFiles(e.target.files)}
            />
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}

/** Bước 4 */
export function ReviewSection() {
  const { control } = useFormContext<ProductFormValues>();
  const values = useWatch({ control }) as ProductFormValues;
  return <ProductInfo product={{ ...values, price: Number(values.price) || 0, salePrice: Number(values.salePrice) || null }} />;
}
