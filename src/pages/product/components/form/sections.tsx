import { useRef, useState } from "react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { Check, Plus, Sparkles, Sprout, Star, Trash2, X } from "lucide-react";
import { readAsDataUrl } from "@/lib/file";
import {
  Button,
  FormField,
  FormItem,
  FormMessage,
  cn,
  useToast,
} from "@Team-Trung-Vu-Khang/eco-shared-ui";
import placeholder from "@/assets/images/image-placeholder.webp";
import { formatVnd } from "@/lib/format";
import {
  ComboboxField,
  SelectField,
  SwitchField,
  TextField,
  TextareaField,
} from "@/components/form";
import {
  EMPTY_SOURCE,
  EMPTY_VARIANT,
  PRODUCT_CATEGORIES,
  PRODUCT_CERTIFICATIONS,
  PRODUCT_IMAGE,
  type ProductFormValues,
} from "@/features/product";
import { FARM_TYPE, useCrops, useFarms, useGardens } from "@/features/farm";
import { ProductInfo } from "../ProductInfo";

const CATEGORY_OPTIONS = PRODUCT_CATEGORIES.map((c) => ({
  label: c,
  value: c,
}));

function slugifySku(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Bước 1: Thông tin cơ bản */
export function BasicInfoSection() {
  const { control, setValue } = useFormContext<ProductFormValues>();
  const name = useWatch({ control, name: "name" });

  const generateSku = () => {
    if (!name) return;
    setValue("sku", slugifySku(name), {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <TextField<ProductFormValues>
        name="name"
        label="Tên sản phẩm"
        required
        className="sm:col-span-2"
        placeholder="VD: Gạo ST25 hữu cơ"
      />
      <div className="sm:col-span-1">
        <TextField<ProductFormValues>
          name="sku"
          label="Mã sản phẩm"
          required
          placeholder="VD: GAO-ST25-5KG"
          description={
            <span className="flex items-center justify-between gap-2 mt-1">
              <span>Mã duy nhất để quản lý hàng</span>
              {name && (
                <button
                  type="button"
                  onClick={generateSku}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline cursor-pointer"
                >
                  <Sparkles className="h-3 w-3" /> Sinh mã từ tên
                </button>
              )}
            </span>
          }
        />
      </div>
      <SelectField<ProductFormValues>
        name="category"
        label="Nhóm sản phẩm"
        required
        options={CATEGORY_OPTIONS}
        placeholder="Chọn nhóm sản phẩm"
      />

      {/* Switch Nông sản */}
      <div className="sm:col-span-2">
        <SwitchField<ProductFormValues>
          name="isAgricultural"
          label="Sản phẩm Nông sản"
          description="Bật nếu sản phẩm là nông sản để bổ sung bước liên kết nguồn gốc nông hộ, vườn canh tác và cây trồng"
        />
      </div>

      <TextareaField<ProductFormValues>
        name="description"
        label="Mô tả"
        className="sm:col-span-2"
        rows={5}
        placeholder="Đặc điểm, câu chuyện sản phẩm..."
      />
      <TextField<ProductFormValues>
        name="shelfLife"
        label="Hạn sử dụng"
        placeholder="VD: 12 tháng"
      />
      <TextField<ProductFormValues>
        name="storage"
        label="Hướng dẫn bảo quản"
        placeholder="VD: Nơi khô ráo, thoáng mát"
      />
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
              toast({
                variant: "destructive",
                title: "Định dạng không hỗ trợ",
                description: `${f.name} — chỉ JPEG/PNG/WebP`,
              });
            } else if (f.size > PRODUCT_IMAGE.maxSize) {
              toast({
                variant: "destructive",
                title: "Ảnh quá lớn",
                description: `${f.name} vượt quá 8 MB`,
              });
            } else {
              accepted.push(await readAsDataUrl(f));
            }
          }
          const next = [...images, ...accepted];
          if (next.length > 8)
            toast({
              variant: "destructive",
              title: "Tối đa 8 ảnh",
              description: "Các ảnh dư đã bị bỏ qua.",
            });
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
              className={cn(
                "rounded-2xl transition-colors",
                dragging && "bg-primary/5 ring-2 ring-primary ring-offset-4",
              )}
            >
              <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 sm:gap-3">
                {/* Phần tử đầu tiên luôn là nút cộng ảnh */}
                {images.length < 8 && (
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="group flex aspect-square w-full flex-col items-center justify-center gap-1 sm:gap-1.5 rounded-xl sm:rounded-2xl border-2 border-dashed border-primary/40 bg-primary/[0.03] text-primary transition-all hover:border-primary hover:bg-primary/10 cursor-pointer"
                  >
                    <span className="flex size-8 sm:size-10 items-center justify-center rounded-full bg-primary/10 text-primary transition-transform group-hover:scale-110">
                      <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
                    </span>
                    <span className="text-[11px] sm:text-xs font-semibold">
                      Thêm ảnh
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {images.length}/8
                    </span>
                  </button>
                )}

                {/* Danh sách ảnh đã tải lên xếp sau nút cộng */}
                {images.map((src, i) => (
                  <div
                    key={i}
                    className={cn(
                      "group relative aspect-square w-full overflow-hidden rounded-xl sm:rounded-2xl border bg-muted shadow-xs",
                      i === 0 && "ring-2 ring-primary ring-offset-2",
                    )}
                  >
                    <img
                      src={src}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                    {i === 0 ? (
                      <span className="absolute bottom-1 left-1 sm:bottom-2 sm:left-2 flex items-center gap-0.5 sm:gap-1 rounded-full bg-primary px-1.5 py-0.5 sm:px-2.5 sm:py-1 text-[9px] sm:text-xs font-medium text-primary-foreground shadow">
                        <Star className="h-2.5 w-2.5 sm:h-3 sm:w-3 fill-current" />{" "}
                        Bìa
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          set([src, ...images.filter((_, j) => j !== i)])
                        }
                        className="absolute bottom-1 left-1 sm:bottom-2 sm:left-2 flex items-center gap-0.5 sm:gap-1 rounded-full bg-black/60 px-1.5 py-0.5 sm:px-2 sm:py-1 text-[9px] sm:text-xs text-white opacity-0 transition-opacity hover:bg-black/80 group-hover:opacity-100 focus-visible:opacity-100 max-md:opacity-90 cursor-pointer"
                      >
                        <Star className="h-2.5 w-2.5 sm:h-3 sm:w-3" /> Đặt bìa
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => set(images.filter((_, j) => j !== i))}
                      className="absolute right-1 top-1 sm:right-2 sm:top-2 rounded-full bg-black/60 p-1 sm:p-1.5 text-white opacity-0 transition-opacity hover:bg-black/80 group-hover:opacity-100 focus-visible:opacity-100 max-md:opacity-100 cursor-pointer"
                      aria-label="Xoá ảnh"
                    >
                      <X className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {images.length ? `${images.length}/8 ảnh · ` : "Tối đa 8 ảnh · "}
              Ảnh bìa là ảnh đầu tiên ngay sau nút cộng, hiển thị đại diện trên
              cửa hàng.
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
function ArrayError({ name }: { name: "variants" | "suppliers" | "sources" }) {
  const { formState } = useFormContext<ProductFormValues>();
  const err = formState.errors[name] as
    | { message?: string; root?: { message?: string } }
    | undefined;
  const message = err?.message ?? err?.root?.message;
  return message ? (
    <p className="text-sm font-medium text-destructive">{message}</p>
  ) : null;
}

/** Bước 3 — quy cách list (7) + storefront preview (3) */
export function VariantsSection() {
  const { control } = useFormContext<ProductFormValues>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "variants",
  });

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
                <TextField<ProductFormValues>
                  name={`variants.${i}.name`}
                  label="Quy cách"
                  required
                  placeholder="VD: Túi 5kg"
                />
                <TextField<ProductFormValues>
                  name={`variants.${i}.price`}
                  label="Giá bán"
                  required
                  type="number"
                  suffix="VND"
                />
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
          <Button
            type="button"
            variant="outline"
            onClick={() => append(EMPTY_VARIANT)}
          >
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
  const [name, category, images, variants, suppliers, isAgricultural, sources] =
    useWatch({
      control,
      name: [
        "name",
        "category",
        "images",
        "variants",
        "suppliers",
        "isAgricultural",
        "sources",
      ],
    });
  const { data: farms } = useFarms();
  const [active, setActive] = useState(0);
  const list = variants ?? [];
  const index = Math.min(active, list.length - 1);
  const v = list[index];
  const price = toPrice(v?.price);
  const original = toPrice(v?.originalPrice);
  // Capped at 99 so a near-free price never reads "-100%"
  const discount =
    original > price && price
      ? Math.min(99, Math.round((1 - price / original) * 100))
      : 0;
  // Storefront shows where it comes from
  const firstFarmId = isAgricultural
    ? sources?.[0]?.farmId
    : suppliers?.[0]?.farmId;
  const location = farms?.find((f) => f.id === firstFarmId)?.location;

  return (
    <div className="space-y-3 lg:sticky lg:top-4 lg:self-start">
      <p className="text-sm font-medium">Xem trước</p>
      <div className="overflow-hidden rounded-3xl border bg-card shadow-sm">
        <div className="relative aspect-[4/3] bg-muted">
          <img
            src={images?.[0] || placeholder}
            alt=""
            className="h-full w-full object-cover"
          />
          {discount > 0 && (
            <span className="absolute left-3 top-3 rounded-full bg-[#c8643c] px-3 py-1 text-sm font-bold text-white">
              -{discount}%
            </span>
          )}
          {category && (
            <span className="absolute right-3 top-3 rounded-full bg-white/95 px-3 py-1 text-sm font-semibold text-[#c8643c] shadow-sm">
              {category}
            </span>
          )}
        </div>
        <div className="space-y-1 p-4">
          <p className="text-sm text-muted-foreground">
            {location || "Vùng trồng"}
          </p>
          <p className="line-clamp-2 text-lg font-bold text-[#1f5a44]">
            {name || "Tên sản phẩm"}
          </p>
          <p className="text-xs text-muted-foreground">Chưa có đánh giá</p>
          <div className="flex items-end justify-between gap-2 pt-2">
            <div className="tabular-nums">
              <p className="text-2xl font-extrabold text-[#1f5a44]">
                {price ? formatVnd(price) : "— đ"}
              </p>
              {discount > 0 && (
                <p className="text-sm text-muted-foreground line-through">
                  {formatVnd(original)}
                </p>
              )}
            </div>
            <span className="shrink-0 text-sm text-muted-foreground">
              {v?.name || "Quy cách"}
            </span>
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
                i === index
                  ? "border-primary bg-primary/10 font-medium text-primary"
                  : "text-muted-foreground hover:border-primary/50",
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

const BASE_UNIT_OPTIONS = [
  { label: "Kilogram (kg)", value: "kg" },
  { label: "Lít (lit)", value: "lit" },
];

/** Bước Nguồn cung nông sản — chỉ hiển thị khi bật toggle Nông sản */
export function SuppliersSection() {
  const { control } = useFormContext<ProductFormValues>();
  const [farmId, regionId] = useWatch({
    control,
    name: ["farmId", "regionId"],
  });

  const {
    fields: sourceFields,
    append: appendSource,
    remove: removeSource,
  } = useFieldArray({ control, name: "sources" });
  const sources = useWatch({ control, name: "sources" });

  const { data: farms } = useFarms();
  const { data: allGardens } = useGardens();
  const { data: allCrops } = useCrops();

  const farmOptions = (farms ?? []).map((f) => ({
    label: `${f.name} · ${FARM_TYPE[f.type]} · ${f.location}`,
    value: f.id,
  }));

  // Lọc vườn theo nông hộ được chọn
  const primaryGardenList = (allGardens ?? []).filter(
    (g) => g.farmId === farmId,
  );
  const primaryGardenOptions = primaryGardenList.map((g) => ({
    label: g.name,
    value: String(g.id),
  }));

  // Lọc cây trồng theo vườn được chọn (nếu vườn có danh sách cropIds)
  const selectedGarden = primaryGardenList.find(
    (g) => String(g.id) === regionId,
  );
  const cropList =
    selectedGarden && selectedGarden.cropIds?.length
      ? (allCrops ?? []).filter((c) => selectedGarden.cropIds.includes(c.id))
      : (allCrops ?? []);
  const cropOptions = cropList.map((c) => ({
    label: c.name,
    value: String(c.id),
  }));

  return (
    <div className="space-y-6">
      {/* Banner giới thiệu */}
      <div className="flex items-start gap-3 rounded-2xl border border-primary/20 bg-primary/[0.03] p-4 sm:p-5">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Sprout className="h-5 w-5" />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-semibold text-primary">
            Nguồn cung & Truy xuất nguồn gốc Nông sản
          </h4>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Sản phẩm nông sản cần xác định rõ nông hộ, vườn canh tác và cây
            trồng. Đây là cơ sở để nông hộ lập phiếu đề xuất nhập hàng và quản
            lý tồn kho độc lập theo từng vùng trồng.
          </p>
        </div>
      </div>

      {/* Khối nguồn gốc & vườn canh tác đồng bộ trong cùng một card */}
      <div className="rounded-2xl border bg-card p-4 sm:p-6 space-y-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b pb-4">
          <div>
            <h3 className="text-base font-semibold">Nguồn gốc canh tác</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Xác định nông hộ, vườn canh tác và cây trồng liên kết của sản phẩm
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => appendSource(EMPTY_SOURCE)}
            className="self-start sm:self-auto"
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" /> Thêm vườn liên kết
          </Button>
        </div>

        {/* Vườn canh tác chính */}
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Nông hộ */}
            <ComboboxField<ProductFormValues>
              name="farmId"
              label="Nông hộ / Hợp tác xã liên kết"
              required
              options={farmOptions}
              placeholder="Chọn nông hộ / HTX"
              searchPlaceholder="Tìm kiếm nông hộ..."
              emptyText="Không tìm thấy nông hộ"
            />

            {/* Vườn canh tác */}
            <ComboboxField<ProductFormValues>
              name="regionId"
              label="Vườn canh tác"
              required
              options={primaryGardenOptions}
              placeholder={
                farmId
                  ? primaryGardenOptions.length
                    ? "Chọn vườn canh tác"
                    : "Nông hộ chưa có vườn nào"
                  : "Vui lòng chọn nông hộ trước"
              }
              searchPlaceholder="Tìm kiếm vườn..."
              emptyText="Không có vườn phù hợp"
            />
          </div>

          {/* Cây trồng & Đơn vị cơ bản */}
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Cây trồng */}
            <ComboboxField<ProductFormValues>
              name="cropId"
              label="Cây trồng liên kết"
              required
              options={cropOptions}
              placeholder={
                regionId ? "Chọn loại cây trồng" : "Vui lòng chọn vườn trước"
              }
              searchPlaceholder="Tìm tên cây trồng..."
              emptyText="Không có cây trồng phù hợp"
            />

            {/* Đơn vị cơ bản */}
            <SelectField<ProductFormValues>
              name="baseUnit"
              label="Đơn vị tính cơ bản"
              required
              options={BASE_UNIT_OPTIONS}
              placeholder="Chọn đơn vị tính"
              description="Đơn vị chuẩn (kg hoặc lít) khi lập đề xuất nhập hàng & quản lý kho"
            />
          </div>
        </div>

        {/* Các vườn liên kết bổ sung — đồng bộ đầy đủ cả 4 trường y hệt vườn 1 */}
        {sourceFields.map((f, i) => {
          const currentFarmId = sources?.[i]?.farmId;
          const currentRegionId = sources?.[i]?.regionId;
          const gardenList = (allGardens ?? []).filter(
            (g) => g.farmId === currentFarmId,
          );
          const gardenOptions = gardenList.map((g) => ({
            label: g.name,
            value: String(g.id),
          }));
          const selectedSourceGarden = gardenList.find(
            (g) => String(g.id) === currentRegionId,
          );
          const sourceCropList =
            selectedSourceGarden && selectedSourceGarden.cropIds?.length
              ? (allCrops ?? []).filter((c) =>
                  selectedSourceGarden.cropIds.includes(c.id),
                )
              : (allCrops ?? []);
          const sourceCropOptions = sourceCropList.map((c) => ({
            label: c.name,
            value: String(c.id),
          }));

          return (
            <div key={f.id} className="pt-5 border-t space-y-4">
              <div className="flex items-center justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive cursor-pointer"
                  onClick={() => removeSource(i)}
                >
                  <Trash2 className="mr-1 h-3.5 w-3.5" /> Bỏ vườn này
                </Button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <ComboboxField<ProductFormValues>
                  name={`sources.${i}.farmId`}
                  label="Nông hộ / Hợp tác xã liên kết"
                  required
                  options={farmOptions}
                  placeholder="Chọn nông hộ / HTX"
                  searchPlaceholder="Tìm kiếm nông hộ..."
                  emptyText="Không tìm thấy nông hộ"
                />
                <ComboboxField<ProductFormValues>
                  name={`sources.${i}.regionId`}
                  label="Vườn canh tác"
                  required
                  options={gardenOptions}
                  placeholder={
                    currentFarmId
                      ? gardenOptions.length
                        ? "Chọn vườn canh tác"
                        : "Chưa có vườn phù hợp"
                      : "Vui lòng chọn nông hộ trước"
                  }
                  searchPlaceholder="Tìm kiếm vườn..."
                  emptyText="Không có vườn phù hợp"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <ComboboxField<ProductFormValues>
                  name={`sources.${i}.cropId`}
                  label="Cây trồng liên kết"
                  required
                  options={sourceCropOptions}
                  placeholder={
                    currentRegionId
                      ? "Chọn loại cây trồng"
                      : "Vui lòng chọn vườn trước"
                  }
                  searchPlaceholder="Tìm tên cây trồng..."
                  emptyText="Không có cây trồng phù hợp"
                />
                <SelectField<ProductFormValues>
                  name={`sources.${i}.baseUnit`}
                  label="Đơn vị tính cơ bản"
                  required
                  options={BASE_UNIT_OPTIONS}
                  placeholder="Chọn đơn vị tính"
                  description="Đơn vị chuẩn (kg hoặc lít) khi lập đề xuất nhập hàng & quản lý kho"
                />
              </div>
            </div>
          );
        })}

        <ArrayError name="sources" />
      </div>
    </div>
  );
}

/** Bước 5 */
export function ReviewSection() {
  const { control } = useFormContext<ProductFormValues>();
  const values = useWatch({ control }) as ProductFormValues;
  const { data: crops } = useCrops();
  const { data: farms } = useFarms();
  const { data: gardens } = useGardens();

  const crop = crops?.find((c) => String(c.id) === values.cropId);
  const farm = farms?.find((f) => f.id === values.farmId);
  const garden = gardens?.find((g) => String(g.id) === values.regionId);

  const variants = (values.variants ?? []).map((v) => ({
    name: v.name,
    price: toPrice(v.price),
    originalPrice: toPrice(v.originalPrice) || null,
    baseQuantity: values.isAgricultural ? Number(v.baseQuantity) || null : null,
  }));
  const first = variants[0];

  const primarySource =
    values.isAgricultural && values.farmId && values.regionId
      ? [
          {
            farmId: values.farmId,
            farmName: farm?.name,
            regionId: Number(values.regionId),
            regionName: garden?.name,
            cropId: values.cropId ? Number(values.cropId) : undefined,
            cropName: crop?.name,
            baseUnit: values.baseUnit,
            importPrice: 0,
          },
        ]
      : [];

  const extraSources = values.isAgricultural
    ? (values.sources ?? []).map((s) => ({
        farmId: s.farmId,
        farmName: farms?.find((f) => f.id === s.farmId)?.name,
        regionId: Number(s.regionId),
        regionName: gardens?.find((g) => g.id === Number(s.regionId))?.name,
        cropId: s.cropId ? Number(s.cropId) : undefined,
        cropName: crops?.find((c) => String(c.id) === s.cropId)?.name,
        baseUnit: s.baseUnit,
        importPrice: 0,
      }))
    : [];

  const sources = [...primarySource, ...extraSources];

  const product = {
    ...values,
    farmId: values.farmId,
    farmName: farm?.name,
    regionId: values.regionId ? Number(values.regionId) : null,
    regionName: garden?.name,
    cropId: values.cropId ? Number(values.cropId) : null,
    cropName: crop?.name,
    variants,
    sources,
    suppliers: values.isAgricultural
      ? sources.map((s) => ({ farmId: s.farmId, importPrice: 0 }))
      : (values.suppliers ?? []).map((s) => ({
          farmId: s.farmId,
          importPrice: 0,
        })),
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
        const toggle = (c: string) =>
          field.onChange(
            value.includes(c) ? value.filter((x) => x !== c) : [...value, c],
          );
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
                      on
                        ? "border-primary bg-primary/10 font-medium text-primary"
                        : "hover:border-primary/50",
                    )}
                  >
                    {on && <Check className="h-3.5 w-3.5" />} {c}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              Chỉ chọn chứng nhận còn hiệu lực; Mevi sẽ kiểm tra giấy tờ khi
              duyệt.
            </p>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
