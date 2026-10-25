import { useRef, useState } from "react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { Check, ImagePlus, Plus, Star, Trash2, X } from "lucide-react";
import { readAsDataUrl } from "@/lib/file";
import { Button, FormField, FormItem, FormMessage, cn, useToast } from "@Team-Trung-Vu-Khang/eco-shared-ui";
import placeholder from "@/assets/images/image-placeholder.webp";
import { formatVnd } from "@/lib/format";
import { ComboboxField, SelectField, TextField, TextareaField } from "@/components/form";
import {
  EMPTY_SUPPLIER,
  EMPTY_VARIANT,
  PRODUCT_CATEGORIES,
  PRODUCT_CERTIFICATIONS,
  PRODUCT_IMAGE,
  type ProductFormValues,
  type ProductInput,
} from "@/features/product";
import { FARM_TYPE, useFarms } from "@/features/farm";
import { ProductInfo } from "../ProductInfo";

const CATEGORY_OPTIONS = PRODUCT_CATEGORIES.map((c) => ({ label: c, value: c }));

/** Bước 1 */
export function BasicInfoSection() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <TextField<ProductFormValues> name="name" label="Tên sản phẩm" required className="sm:col-span-2" placeholder="VD: Gạo ST25 hữu cơ" />
      <TextField<ProductFormValues> name="sku" label="Mã sản phẩm" required placeholder="VD: GAO-ST25-5KG" description="Mã duy nhất, dùng để quản lý kho" />
      <SelectField<ProductFormValues> name="category" label="Nhóm sản phẩm" required options={CATEGORY_OPTIONS} placeholder="Chọn nhóm sản phẩm" />
      <TextareaField<ProductFormValues> name="description" label="Mô tả" className="sm:col-span-2" rows={5} placeholder="Đặc điểm, câu chuyện sản phẩm..." />
      <TextField<ProductFormValues> name="shelfLife" label="Hạn sử dụng" placeholder="VD: 12 tháng" />
      <TextField<ProductFormValues> name="storage" label="Hướng dẫn bảo quản" placeholder="VD: Nơi khô ráo, thoáng mát" />
      <div className="sm:col-span-2">
        <CertificationsField />
      </div>
    </div>
  );
}

/** Bước 2 — a row of thumbnails, first one is the cover */
export function ImagesSection() {
  const { control } = useFormContext<ProductFormValues>();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

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
          const next = [...images, ...accepted];
          if (next.length > 8) toast({ variant: "destructive", title: "Tối đa 8 ảnh", description: "Các ảnh dư đã bị bỏ qua." });
          set(next.slice(0, 8));
          if (fileRef.current) fileRef.current.value = "";
        };

        return (
          <FormItem>
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                void onFiles(e.dataTransfer.files);
              }}
              className={cn("rounded-2xl transition-colors", dragging && "bg-primary/5 ring-2 ring-primary ring-offset-4")}
            >
              {images.length === 0 ? (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="flex w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-primary/30 bg-primary/[0.03] px-6 py-14 text-center transition-colors hover:border-primary hover:bg-primary/5"
                >
                  <span className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <ImagePlus className="h-7 w-7" />
                  </span>
                  <span className="space-y-1">
                    <span className="block text-base font-semibold">Kéo thả ảnh vào đây</span>
                    <span className="block text-sm text-muted-foreground">hoặc bấm để chọn từ máy · JPEG, PNG, WebP, tối đa 8 MB/ảnh</span>
                  </span>
                  <span className="mt-1 inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm">
                    <Plus className="h-4 w-4" /> Chọn ảnh
                  </span>
                </button>
              ) : (
              <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3">
                {images.map((src, i) => (
                  <div
                    key={i}
                    className={cn(
                      "group relative aspect-square w-full overflow-hidden rounded-2xl border bg-muted",
                      i === 0 && "ring-2 ring-primary ring-offset-2",
                    )}
                  >
                    <img src={src} alt="" className="h-full w-full object-cover" />
                    {i === 0 ? (
                      <span className="absolute bottom-2 left-2 flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground shadow">
                        <Star className="h-3 w-3 fill-current" /> Ảnh bìa
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => set([src, ...images.filter((_, j) => j !== i)])}
                        className="absolute bottom-2 left-2 flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-xs text-white opacity-0 transition-opacity hover:bg-black/80 group-hover:opacity-100 focus-visible:opacity-100"
                      >
                        <Star className="h-3 w-3" /> Đặt làm bìa
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => set(images.filter((_, j) => j !== i))}
                      className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white opacity-0 transition-opacity hover:bg-black/80 group-hover:opacity-100 focus-visible:opacity-100 max-md:opacity-100"
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
                    className="flex aspect-square w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed text-sm text-muted-foreground transition-colors hover:border-primary hover:bg-primary/5 hover:text-primary"
                  >
                    <Plus className="h-8 w-8" />
                    Thêm ảnh
                  </button>
                )}
              </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {images.length ? `${images.length}/8 ảnh · ` : "Tối đa 8 ảnh · "}Ảnh đầu tiên là ảnh bìa, hiển thị trên cửa hàng.
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

/** Error set on the array itself (min length, duplicates) */
function ArrayError({ name }: { name: "variants" | "suppliers" }) {
  const { formState } = useFormContext<ProductFormValues>();
  const err = formState.errors[name] as { message?: string; root?: { message?: string } } | undefined;
  const message = err?.message ?? err?.root?.message;
  return message ? <p className="text-sm font-medium text-destructive">{message}</p> : null;
}

/** Bước 3 — quy cách list (7) + storefront preview (3) */
export function VariantsSection() {
  const { control } = useFormContext<ProductFormValues>();
  const { fields, append, remove } = useFieldArray({ control, name: "variants" });

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,3fr)]">
      <div className="space-y-6">
        <div className="space-y-3">
          <p className="text-sm font-medium">
            Quy cách<span className="text-destructive"> *</span>
          </p>
          {fields.map((f, i) => (
            <div key={f.id} className="rounded-xl border bg-card p-3">
              <div className="grid items-start gap-3 sm:grid-cols-[minmax(0,3fr)_minmax(0,2fr)_minmax(0,2fr)_auto]">
                <TextField<ProductFormValues> name={`variants.${i}.name`} label="Quy cách" required placeholder="VD: Túi 5kg" />
                <TextField<ProductFormValues> name={`variants.${i}.price`} label="Giá bán" required type="number" suffix="VND" />
                <TextField<ProductFormValues>
                  name={`variants.${i}.originalPrice`}
                  label="Giá gốc"
                  type="number"
                  suffix="VND"
                  placeholder="Không bắt buộc"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-destructive sm:mt-6"
                  disabled={fields.length === 1}
                  onClick={() => remove(i)}
                  aria-label="Xoá quy cách"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          <ArrayError name="variants" />
          <Button type="button" variant="outline" onClick={() => append(EMPTY_VARIANT)}>
            <Plus className="mr-1 h-4 w-4" /> Thêm quy cách
          </Button>
        </div>

      </div>

      <VariantPreview />
    </div>
  );
}

const toPrice = (v: unknown) => Number(v) || 0;

/** How the product card looks on the storefront, using the cover image */
function VariantPreview() {
  const { control } = useFormContext<ProductFormValues>();
  const [name, category, images, variants, suppliers] = useWatch({
    control,
    name: ["name", "category", "images", "variants", "suppliers"],
  });
  const { data: farms } = useFarms();
  const [active, setActive] = useState(0);
  const list = variants ?? [];
  const index = Math.min(active, list.length - 1);
  const v = list[index];
  const price = toPrice(v?.price);
  const original = toPrice(v?.originalPrice);
  // Capped at 99 so a near-free price never reads "-100%"
  const discount = original > price && price ? Math.min(99, Math.round((1 - price / original) * 100)) : 0;
  // Storefront shows where it comes from — the first supplying farm
  const location = farms?.find((f) => f.id === suppliers?.[0]?.farmId)?.location;

  return (
    <div className="space-y-3 lg:sticky lg:top-4 lg:self-start">
      <p className="text-sm font-medium">Xem trước</p>
      <div className="overflow-hidden rounded-3xl border bg-card shadow-sm">
        <div className="relative aspect-[4/3] bg-muted">
          <img src={images?.[0] || placeholder} alt="" className="h-full w-full object-cover" />
          {discount > 0 && (
            <span className="absolute left-3 top-3 rounded-full bg-[#c8643c] px-3 py-1 text-sm font-bold text-white">-{discount}%</span>
          )}
          {category && (
            <span className="absolute right-3 top-3 rounded-full bg-white/95 px-3 py-1 text-sm font-semibold text-[#c8643c] shadow-sm">
              {category}
            </span>
          )}
        </div>
        <div className="space-y-1 p-4">
          <p className="text-sm text-muted-foreground">{location || "Vùng trồng"}</p>
          <p className="line-clamp-2 text-lg font-bold text-[#1f5a44]">{name || "Tên sản phẩm"}</p>
          <p className="text-xs text-muted-foreground">Chưa có đánh giá</p>
          <div className="flex items-end justify-between gap-2 pt-2">
            <div className="tabular-nums">
              <p className="text-2xl font-extrabold text-[#1f5a44]">{price ? formatVnd(price) : "— đ"}</p>
              {discount > 0 && <p className="text-sm text-muted-foreground line-through">{formatVnd(original)}</p>}
            </div>
            <span className="shrink-0 text-sm text-muted-foreground">{v?.name || "Quy cách"}</span>
          </div>
        </div>
      </div>
      {list.length > 1 && (
        <div className="flex flex-wrap gap-1.5">
          {list.map((x, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActive(i)}
              className={cn(
                "rounded-full border px-2.5 py-0.5 text-xs transition-colors",
                i === index ? "border-primary bg-primary/10 font-medium text-primary" : "text-muted-foreground hover:border-primary/50",
              )}
            >
              {x?.name || `Quy cách ${i + 1}`}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/** Bước 4 — supplying farms, each with the import price Mevi pays */
export function SuppliersSection() {
  const { control } = useFormContext<ProductFormValues>();
  const { fields, append, remove } = useFieldArray({ control, name: "suppliers" });
  const suppliers = useWatch({ control, name: "suppliers" });
  const { data: farms } = useFarms();
  const farmOptions = (farms ?? []).map((f) => ({ label: `${f.name} · ${FARM_TYPE[f.type]} · ${f.location}`, value: f.id }));

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Dùng cho truy xuất nguồn gốc và báo cáo doanh thu theo nông hộ. Có thể bỏ qua nếu sản phẩm tự sản xuất.
      </p>
      {fields.length === 0 && (
        <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">Chưa chọn nông hộ nào.</div>
      )}
      {fields.map((f, i) => (
        <div key={f.id} className="rounded-xl border bg-card p-3">
          <div className="grid items-start gap-3 sm:grid-cols-[minmax(0,3fr)_minmax(0,2fr)_auto]">
            <ComboboxField<ProductFormValues>
              name={`suppliers.${i}.farmId`}
              label="Nông hộ / HTX"
              required
              options={farmOptions.filter((o) => o.value === suppliers?.[i]?.farmId || !suppliers?.some((s) => s.farmId === o.value))}
              placeholder="Chọn nông hộ / HTX"
              searchPlaceholder="Tìm theo tên, địa phương..."
              emptyText="Không tìm thấy nông hộ"
            />
            <TextField<ProductFormValues> name={`suppliers.${i}.importPrice`} label="Giá nhập" required type="number" suffix="VND" />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-destructive sm:mt-6"
              onClick={() => remove(i)}
              aria-label="Bỏ nông hộ"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
      <ArrayError name="suppliers" />
      <Button type="button" variant="outline" onClick={() => append(EMPTY_SUPPLIER)} disabled={fields.length >= farmOptions.length && farmOptions.length > 0}>
        <Plus className="mr-1 h-4 w-4" /> Thêm nông hộ
      </Button>
    </div>
  );
}

/** Bước 5 */
export function ReviewSection() {
  const { control } = useFormContext<ProductFormValues>();
  const values = useWatch({ control }) as ProductFormValues;
  const variants = (values.variants ?? []).map((v) => ({
    name: v.name,
    price: toPrice(v.price),
    originalPrice: toPrice(v.originalPrice) || null,
  }));
  const first = variants[0];
  const product: Partial<ProductInput> & Pick<ProductInput, "price"> = {
    ...values,
    variants,
    suppliers: (values.suppliers ?? []).map((s) => ({ farmId: s.farmId, importPrice: toPrice(s.importPrice) })),
    price: first?.originalPrice ?? first?.price ?? 0,
    salePrice: first?.originalPrice ? first.price : null,
  };
  return <ProductInfo product={product} />;
}

/** Bước 1 — certifications shown on the storefront trace card */
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

