import { useRef, useState } from "react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { Check, Loader2, Plus, Sparkles, Sprout, Star, Trash2, X } from "lucide-react";
import {
  Button,
  FormField,
  FormItem,
  FormMessage,
  Input,
  cn,
  useToast,
} from "@Team-Trung-Vu-Khang/eco-shared-ui";
import placeholder from "@/assets/images/image-placeholder.webp";
import { formatVnd } from "@/lib/format";
import { getErrorMessage } from "@/lib/api-error";
import {
  AsyncComboboxField,
  ComboboxField,
  SelectField,
  SwitchField,
  TextField,
  TextareaField,
} from "@/components/form";
import {
  BASE_UNIT_LABEL,
  CERTIFICATION_SUGGESTIONS,
  type CatalogProductFormValues,
  EMPTY_CATALOG_VARIANT,
  EMPTY_SUPPLY_SOURCE,
  PRODUCT_LIMITS,
  PRODUCT_PHOTO_ACCEPT,
  SHELF_LIFE_UNIT_LABEL,
  STORAGE_CONDITION_LABEL,
  productPhotoApi,
  toProductMedia,
  useCategories,
  useFarmZoneGroups,
  useFarmZones,
  validateProductPhoto,
} from "@/features/shop-catalog";
import { ProductInfo, type ProductView } from "../ProductInfo";

type F = CatalogProductFormValues;

const toOptions = <K extends string>(labels: Record<K, string>) =>
  (Object.keys(labels) as K[]).map((value) => ({ label: labels[value], value }));

const BASE_UNIT_OPTIONS = toOptions(BASE_UNIT_LABEL);
const SHELF_LIFE_UNIT_OPTIONS = toOptions(SHELF_LIFE_UNIT_LABEL);
const STORAGE_CONDITION_OPTIONS = toOptions(STORAGE_CONDITION_LABEL);

function slugifyCode(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, PRODUCT_LIMITS.code);
}

/** Bước 1: Thông tin cơ bản */
export function BasicInfoSection() {
  const { control, setValue } = useFormContext<F>();
  const title = useWatch({ control, name: "title" });
  const { data: categories } = useCategories();
  const categoryOptions = (categories ?? []).map((c) => ({ label: c.name, value: String(c.id) }));

  const generateCode = () => {
    if (!title) return;
    setValue("code", slugifyCode(title), { shouldValidate: true, shouldDirty: true });
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <TextField<F> name="title" label="Tên sản phẩm" required className="sm:col-span-2" placeholder="VD: Gạo ST25 hữu cơ" />
      <TextField<F>
        name="code"
        label="Mã sản phẩm"
        placeholder="VD: GAO-ST25-5KG"
        description={
          <span className="mt-1 flex items-center justify-between gap-2">
            <span>Để trống để hệ thống tự sinh</span>
            {title && (
              <button
                type="button"
                onClick={generateCode}
                className="inline-flex cursor-pointer items-center gap-1 text-xs font-semibold text-primary hover:underline"
              >
                <Sparkles className="h-3 w-3" /> Sinh mã từ tên
              </button>
            )}
          </span>
        }
      />
      <ComboboxField<F>
        name="categoryId"
        label="Nhóm sản phẩm"
        required
        options={categoryOptions}
        placeholder="Chọn nhóm sản phẩm"
        searchPlaceholder="Tìm nhóm..."
        emptyText="Chưa có nhóm sản phẩm"
      />
      <TextField<F>
        name="handle"
        label="Đường dẫn (handle)"
        className="sm:col-span-2"
        placeholder="gao-st25-huu-co"
        description="Phần chữ trên URL sản phẩm. Để trống: tạo mới thì sinh từ tên, sửa thì giữ nguyên."
      />

      <SwitchField<F> name="active" label="Đang kinh doanh" description="Tắt để tạm ngưng bán trên cửa hàng" />
      <SwitchField<F>
        name="agricultural"
        label="Sản phẩm Nông sản"
        description="Bật để bổ sung bước liên kết nguồn cung từ vườn nông hộ"
      />

      <TextareaField<F> name="description" label="Mô tả" className="sm:col-span-2" rows={5} placeholder="Đặc điểm, câu chuyện sản phẩm..." />

      <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-2">
        <TextField<F> name="shelfLifeValue" label="Hạn sử dụng" type="number" placeholder="VD: 12" />
        <SelectField<F> name="shelfLifeUnit" label="Đơn vị" options={SHELF_LIFE_UNIT_OPTIONS} placeholder="Chọn" />
      </div>
      <SelectField<F>
        name="storageCondition"
        label="Điều kiện bảo quản"
        options={STORAGE_CONDITION_OPTIONS}
        placeholder="Chọn điều kiện"
      />
      <TextareaField<F>
        name="storageInstructions"
        label="Hướng dẫn bảo quản"
        className="sm:col-span-2"
        rows={2}
        placeholder="VD: Nơi khô ráo, thoáng mát"
      />
      <div className="sm:col-span-2">
        <CertificationsField />
      </div>
    </div>
  );
}

/** Bước 2 — uploads each file to /api/storage/product-photos; first image is the cover */
export function ImagesSection() {
  const { control, getValues } = useFormContext<F>();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(0);
  const max = PRODUCT_LIMITS.media;

  return (
    <FormField
      control={control}
      name="media"
      render={({ field }) => {
        const media: F["media"] = field.value ?? [];

        const onFiles = async (files: FileList | null) => {
          if (!files) return;
          const room = max - media.length;
          const picked = Array.from(files).filter((f) => {
            const err = validateProductPhoto(f);
            if (err) toast({ variant: "destructive", title: "Không thể tải ảnh", description: `${f.name} — ${err}` });
            return !err;
          });
          if (picked.length > room) {
            toast({ variant: "destructive", title: `Tối đa ${max} ảnh`, description: "Các ảnh dư đã bị bỏ qua." });
          }
          const batch = picked.slice(0, Math.max(0, room));
          if (fileRef.current) fileRef.current.value = "";
          if (!batch.length) return;

          setUploading((n) => n + batch.length);
          const results = await Promise.allSettled(batch.map((file) => productPhotoApi.upload({ file })));
          setUploading((n) => n - batch.length);
          const uploaded = results.flatMap((r, i) => {
            if (r.status === "fulfilled") return [toProductMedia(r.value)];
            toast({ variant: "destructive", title: "Tải ảnh thất bại", description: `${batch[i].name} — ${getErrorMessage(r.reason)}` });
            return [];
          });
          // Read the latest value: other uploads may have finished meanwhile
          field.onChange([...getValues("media"), ...uploaded].slice(0, max));
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
              {media.length + uploading < max && (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="group flex w-full cursor-pointer flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed border-primary/40 bg-primary/[0.03] px-4 py-8 text-primary transition-all hover:border-primary hover:bg-primary/10 sm:py-10"
                >
                  <span className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary transition-transform group-hover:scale-110 sm:size-12">
                    <Plus className="h-5 w-5 sm:h-6 sm:w-6" />
                  </span>
                  <span className="text-sm font-semibold">Bấm để chọn ảnh hoặc kéo thả vào đây</span>
                  <span className="text-xs text-muted-foreground">
                    JPEG, PNG, WebP · tối đa 20 MB/ảnh · {media.length}/{max} ảnh
                  </span>
                </button>
              )}

              {(media.length > 0 || uploading > 0) && (
                <div className="mt-4 grid grid-cols-3 gap-2.5 sm:grid-cols-4 sm:gap-3 md:grid-cols-5 lg:grid-cols-6">
                  {media.map((m, i) => (
                    <div
                      key={m.url}
                      className={cn(
                        "group relative aspect-square w-full overflow-hidden rounded-xl border bg-muted shadow-xs sm:rounded-2xl",
                        i === 0 && "ring-2 ring-primary ring-offset-2",
                      )}
                    >
                      <img src={m.thumbnailUrl || m.url} alt="" className="h-full w-full object-cover" />
                      {i === 0 ? (
                        <span className="absolute bottom-1 left-1 flex items-center gap-0.5 rounded-full bg-primary px-1.5 py-0.5 text-[9px] font-medium text-primary-foreground shadow sm:bottom-2 sm:left-2 sm:gap-1 sm:px-2.5 sm:py-1 sm:text-xs">
                          <Star className="h-2.5 w-2.5 fill-current sm:h-3 sm:w-3" /> Bìa
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => field.onChange([m, ...media.filter((_, j) => j !== i)])}
                          className="absolute bottom-1 left-1 flex cursor-pointer items-center gap-0.5 rounded-full bg-black/60 px-1.5 py-0.5 text-[9px] text-white opacity-0 transition-opacity hover:bg-black/80 focus-visible:opacity-100 group-hover:opacity-100 max-md:opacity-90 sm:bottom-2 sm:left-2 sm:gap-1 sm:px-2 sm:py-1 sm:text-xs"
                        >
                          <Star className="h-2.5 w-2.5 sm:h-3 sm:w-3" /> Đặt bìa
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => field.onChange(media.filter((_, j) => j !== i))}
                        className="absolute right-1 top-1 cursor-pointer rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity hover:bg-black/80 focus-visible:opacity-100 group-hover:opacity-100 max-md:opacity-100 sm:right-2 sm:top-2 sm:p-1.5"
                        aria-label="Xoá ảnh"
                      >
                        <X className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                      </button>
                    </div>
                  ))}
                  {Array.from({ length: uploading }, (_, i) => (
                    <div
                      key={`uploading-${i}`}
                      className="flex aspect-square w-full items-center justify-center rounded-xl border border-dashed bg-muted/50 text-muted-foreground sm:rounded-2xl"
                    >
                      <Loader2 className="h-5 w-5 animate-spin" />
                    </div>
                  ))}
                </div>
              )}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Ảnh đầu tiên là ảnh bìa, hiển thị đại diện trên cửa hàng.</p>
            <input
              ref={fileRef}
              type="file"
              accept={PRODUCT_PHOTO_ACCEPT.join(",")}
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
function ArrayError({ name }: { name: "variants" | "supplySources" }) {
  const { formState } = useFormContext<F>();
  const err = formState.errors[name] as { message?: string; root?: { message?: string } } | undefined;
  const message = err?.message ?? err?.root?.message;
  return message ? <p className="text-sm font-medium text-destructive">{message}</p> : null;
}

/** Bước 3 — quy cách list (7) + storefront preview (3) */
export function VariantsSection() {
  const { control } = useFormContext<F>();
  const { fields, append, remove } = useFieldArray({ control, name: "variants" });

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,3fr)]">
      <div className="space-y-3">
        <p className="text-sm font-medium">
          Quy cách<span className="text-destructive"> *</span>
        </p>
        {fields.map((f, i) => (
          <div key={f.id} className="rounded-xl border bg-card p-3">
            <div className="-mx-3 mb-3 flex items-center justify-between gap-2 border-b px-3 pb-2">
              <span className="text-sm font-semibold">Quy cách {i + 1}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 cursor-pointer text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
                disabled={fields.length === 1}
                onClick={() => remove(i)}
              >
                <Trash2 className="mr-1 h-3.5 w-3.5" /> Xoá
              </Button>
            </div>
            <div className="grid items-start gap-3 sm:grid-cols-2">
              <TextField<F> name={`variants.${i}.title`} label="Tên quy cách" required placeholder="VD: Túi 5kg" />
              <TextField<F> name={`variants.${i}.sku`} label="SKU" placeholder="Tự sinh nếu để trống" />
              <TextField<F> name={`variants.${i}.price`} label="Giá bán" required type="number" suffix="VND" />
              <TextField<F>
                name={`variants.${i}.compareAtPrice`}
                label="Giá gốc"
                type="number"
                suffix="VND"
                placeholder="Không bắt buộc"
              />
            </div>
          </div>
        ))}
        <ArrayError name="variants" />
        <p className="text-xs text-muted-foreground">
          Tồn kho không nhập ở đây — quy cách mới có tồn kho 0, cập nhật qua phiếu nhập hàng / điều chỉnh.
        </p>
        <Button
          type="button"
          variant="outline"
          disabled={fields.length >= PRODUCT_LIMITS.variants}
          onClick={() => append(EMPTY_CATALOG_VARIANT)}
        >
          <Plus className="mr-1 h-4 w-4" /> Thêm quy cách
        </Button>
      </div>

      <VariantPreview />
    </div>
  );
}

const toPrice = (v: unknown) => Number(v) || 0;

/** How the product card looks on the storefront, using the cover image */
function VariantPreview() {
  const { control } = useFormContext<F>();
  const [title, categoryId, media, variants, sources] = useWatch({
    control,
    name: ["title", "categoryId", "media", "variants", "supplySources"],
  });
  const { data: categories } = useCategories();
  const category = categories?.find((c) => String(c.id) === categoryId)?.name;
  const [active, setActive] = useState(0);
  const list = variants ?? [];
  const index = Math.min(active, list.length - 1);
  const v = list[index];
  const price = toPrice(v?.price);
  const original = toPrice(v?.compareAtPrice);
  // Capped at 99 so a near-free price never reads "-100%"
  const discount = original > price && price ? Math.min(99, Math.round((1 - price / original) * 100)) : 0;
  const origin = sources?.[0]?.workspaceName;

  return (
    <div className="space-y-3 lg:sticky lg:top-4 lg:self-start">
      <p className="text-sm font-medium">Xem trước</p>
      <div className="overflow-hidden rounded-3xl border bg-card shadow-sm">
        <div className="relative aspect-[4/3] bg-muted">
          <img src={media?.[0]?.url || placeholder} alt="" className="h-full w-full object-cover" />
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
          <p className="text-sm text-muted-foreground">{origin || "Vùng trồng"}</p>
          <p className="line-clamp-2 text-lg font-bold text-[#1f5a44]">{title || "Tên sản phẩm"}</p>
          <p className="text-xs text-muted-foreground">Chưa có đánh giá</p>
          <div className="flex items-end justify-between gap-2 pt-2">
            <div className="tabular-nums">
              <p className="text-2xl font-extrabold text-[#1f5a44]">{price ? formatVnd(price) : "— đ"}</p>
              {discount > 0 && <p className="text-sm text-muted-foreground line-through">{formatVnd(original)}</p>}
            </div>
            <span className="shrink-0 text-sm text-muted-foreground">{v?.title || "Quy cách"}</span>
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
              {x?.title || `Quy cách ${i + 1}`}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/** One supply source: Nông hộ → Vườn → Cây trồng + đơn vị tính */
function SupplySourceRow({ index, onRemove }: { index: number; onRemove: () => void }) {
  const { control, setValue, trigger } = useFormContext<F>();
  const source = useWatch({ control, name: `supplySources.${index}` });
  // Nông hộ search runs on the API (`keyword`), not on the loaded page
  const [groupKeyword, setGroupKeyword] = useState("");
  const { data: groups, isFetching: loadingGroups } = useFarmZoneGroups({ keyword: groupKeyword || undefined, size: 20 });
  const { data: zones } = useFarmZones(source?.workspaceId ? Number(source.workspaceId) : undefined);
  const zone = zones?.content.find((z) => String(z.id) === source?.productionZoneId);

  const groupOptions = (groups?.content ?? []).map((g) => ({ label: g.workspaceName, value: String(g.workspaceId) }));
  const zoneOptions = (zones?.content ?? []).map((z) => ({ label: `${z.name} · ${z.code}`, value: String(z.id) }));
  if (source?.productionZoneId && !zoneOptions.some((o) => o.value === source.productionZoneId)) {
    zoneOptions.push({ label: source.zoneName || `Vườn #${source.productionZoneId} (đã xoá)`, value: source.productionZoneId });
  }
  const subjectOptions = (zone?.subjects ?? []).map((s) => ({ label: s.name, value: String(s.id) }));
  if (source?.productionSubjectId && !subjectOptions.some((o) => o.value === source.productionSubjectId)) {
    subjectOptions.push({ label: source.subjectName || `Cây trồng #${source.productionSubjectId}`, value: source.productionSubjectId });
  }

  // Clearing a dependent field must not flag it red; it's validated again when the user picks a value
  const set = (key: keyof F["supplySources"][number], value: string) =>
    setValue(`supplySources.${index}.${key}`, value, { shouldDirty: true });
  /** Re-validate after a pick — mode "onTouched" won't, so a stale "required" error would stay */
  const revalidate = () => void trigger(`supplySources.${index}`);

  return (
    <div className={cn("space-y-4", index > 0 && "border-t pt-5")}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Nguồn {index + 1}</span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 cursor-pointer text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={onRemove}
        >
          <Trash2 className="mr-1 h-3.5 w-3.5" /> Bỏ nguồn này
        </Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <AsyncComboboxField<F>
          name={`supplySources.${index}.workspaceId`}
          label="Nông hộ / Hợp tác xã"
          required
          options={groupOptions}
          loading={loadingGroups}
          onSearch={setGroupKeyword}
          selectedLabel={source?.workspaceName || (source?.workspaceId ? `Nông hộ #${source.workspaceId}` : undefined)}
          placeholder="Chọn nông hộ / HTX"
          searchPlaceholder="Tìm kiếm nông hộ..."
          emptyText="Không tìm thấy nông hộ"
          onChange={(_, option) => {
            set("workspaceName", option?.label ?? "");
            set("productionZoneId", "");
            set("zoneName", "");
            set("productionSubjectId", "");
            set("subjectName", "");
            void trigger(`supplySources.${index}.workspaceId`);
          }}
        />
        <ComboboxField<F>
          name={`supplySources.${index}.productionZoneId`}
          label="Vườn canh tác"
          required
          options={zoneOptions}
          disabled={!source?.workspaceId}
          placeholder={source?.workspaceId ? (zoneOptions.length ? "Chọn vườn" : "Nông hộ chưa có vườn") : "Chọn nông hộ trước"}
          searchPlaceholder="Tìm kiếm vườn..."
          emptyText="Không có vườn phù hợp"
          onChange={(v) => {
            const picked = zones?.content.find((z) => String(z.id) === v);
            set("zoneName", picked?.name ?? "");
            // Auto-pick the crop when the vườn grows only one
            const only = picked?.subjects.length === 1 ? picked.subjects[0] : undefined;
            set("productionSubjectId", only ? String(only.id) : "");
            set("subjectName", only?.name ?? "");
            void trigger(only ? `supplySources.${index}` : `supplySources.${index}.productionZoneId`);
          }}
        />
        <ComboboxField<F>
          name={`supplySources.${index}.productionSubjectId`}
          label="Cây trồng liên kết"
          required
          options={subjectOptions}
          disabled={!source?.productionZoneId}
          placeholder={source?.productionZoneId ? "Chọn cây trồng" : "Chọn vườn trước"}
          searchPlaceholder="Tìm cây trồng..."
          emptyText="Vườn chưa khai báo cây trồng"
          onChange={(v) => {
            set("subjectName", subjectOptions.find((o) => o.value === v)?.label ?? "");
            revalidate();
          }}
        />
        <SelectField<F> name={`supplySources.${index}.baseUnit`} label="Đơn vị tính cơ bản" required options={BASE_UNIT_OPTIONS} />
      </div>
    </div>
  );
}

/** Bước Nguồn cung nông sản — chỉ hiển thị khi bật toggle Nông sản */
export function SuppliersSection() {
  const { control } = useFormContext<F>();
  const { fields, append, remove } = useFieldArray({ control, name: "supplySources" });

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3 rounded-2xl border border-primary/20 bg-primary/[0.03] p-4 sm:p-5">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Sprout className="h-5 w-5" />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-semibold text-primary">Nguồn cung nông sản</h4>
          <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
            Mỗi nguồn gồm một vườn canh tác, cây trồng của vườn đó và đơn vị tính cơ bản. Nông hộ có vườn trong
            danh sách mới đề xuất nhập hàng được cho sản phẩm này.
          </p>
        </div>
      </div>

      <div className="space-y-6 rounded-2xl border bg-card p-4 shadow-xs sm:p-6">
        <div className="flex flex-col gap-2 border-b pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-base font-semibold">Vườn canh tác liên kết</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">Tối đa {PRODUCT_LIMITS.supplySources} nguồn</p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={fields.length >= PRODUCT_LIMITS.supplySources}
            onClick={() => append(EMPTY_SUPPLY_SOURCE)}
            className="self-start sm:self-auto"
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" /> Thêm nguồn
          </Button>
        </div>

        {fields.length === 0 && <p className="text-sm text-muted-foreground">Chưa có nguồn nào. Bấm “Thêm nguồn”.</p>}
        {fields.map((f, i) => (
          <SupplySourceRow key={f.id} index={i} onRemove={() => remove(i)} />
        ))}
        <ArrayError name="supplySources" />
      </div>
    </div>
  );
}

/** Bước cuối */
export function ReviewSection() {
  const { control } = useFormContext<F>();
  const v = useWatch({ control }) as F;
  const { data: categories } = useCategories();
  const category = categories?.find((c) => String(c.id) === v.categoryId);

  const product: ProductView = {
    title: v.title,
    code: v.code,
    category: category ? { name: category.name } : null,
    agricultural: v.agricultural,
    certifications: v.certifications ?? [],
    media: (v.media ?? []).map((m) => ({ ...m, altText: null })),
    shelfLifeValue: v.shelfLifeValue ? Number(v.shelfLifeValue) : null,
    shelfLifeUnit: v.shelfLifeUnit || null,
    storageCondition: v.storageCondition || null,
    storageInstructions: v.storageInstructions || null,
    description: v.description || null,
    supplySources: (v.supplySources ?? []).map((s) => ({
      productionZone: { id: Number(s.productionZoneId), code: null, name: s.zoneName || null },
      workspace: { id: Number(s.workspaceId), name: s.workspaceName || null },
      productionSubject: { id: Number(s.productionSubjectId), name: s.subjectName || null },
      baseUnit: s.baseUnit,
    })),
    variants: (v.variants ?? []).map((x) => ({
      title: x.title,
      sku: x.sku,
      price: toPrice(x.price),
      compareAtPrice: toPrice(x.compareAtPrice) || null,
    })),
  };
  return <ProductInfo product={product} />;
}

/** Bước 1 — free-text certifications shown as badges; quick picks + custom entry */
export function CertificationsField() {
  const { control } = useFormContext<F>();
  const [draft, setDraft] = useState("");
  return (
    <FormField
      control={control}
      name="certifications"
      render={({ field }) => {
        const value: string[] = field.value ?? [];
        const has = (c: string) => value.some((x) => x.toLowerCase() === c.toLowerCase());
        const toggle = (c: string) => field.onChange(has(c) ? value.filter((x) => x.toLowerCase() !== c.toLowerCase()) : [...value, c]);
        const addDraft = () => {
          const c = draft.trim().slice(0, 100);
          if (c && !has(c)) field.onChange([...value, c]);
          setDraft("");
        };
        const custom = value.filter((c) => !CERTIFICATION_SUGGESTIONS.some((s) => s.toLowerCase() === c.toLowerCase()));
        return (
          <FormItem>
            <p className="text-sm font-medium">Chứng nhận</p>
            <div className="flex flex-wrap gap-2">
              {[...CERTIFICATION_SUGGESTIONS, ...custom].map((c) => {
                const on = has(c);
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
            <div className="flex max-w-sm gap-2">
              <Input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addDraft();
                  }
                }}
                placeholder="Chứng nhận khác..."
                maxLength={100}
              />
              <Button type="button" variant="outline" onClick={addDraft} disabled={!draft.trim()}>
                Thêm
              </Button>
            </div>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
