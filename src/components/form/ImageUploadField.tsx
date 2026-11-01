import { useRef, useState } from "react";
import { type FieldPath, type FieldValues, useFormContext } from "react-hook-form";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import { readAsDataUrl } from "@/lib/file";
import { Button, FormField, FormItem, FormLabel, FormMessage, cn, useToast } from "@Team-Trung-Vu-Khang/eco-shared-ui";

const TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX = 8 * 1024 * 1024;


/** Single image (logo, cover). Stored as a data URL unless `upload` is given. */
export function ImageUploadField<T extends FieldValues>({
  name,
  label,
  hint,
  aspect = "square",
  upload,
  maxBytes = MAX,
}: {
  name: FieldPath<T>;
  label: string;
  hint?: string;
  aspect?: "square" | "cover";
  /** Uploads the file and resolves to the URL stored in the field */
  upload?: (file: File) => Promise<string>;
  maxBytes?: number;
}) {
  const { control } = useFormContext<T>();
  const { toast } = useToast();
  const ref = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const pick = async (file?: File) => {
          if (!file) return;
          if (!TYPES.includes(file.type)) {
            toast({ variant: "destructive", title: "Định dạng không hỗ trợ", description: "Chỉ nhận JPEG, PNG, WebP" });
          } else if (file.size > maxBytes) {
            toast({ variant: "destructive", title: "Ảnh quá lớn", description: `Tối đa ${Math.round(maxBytes / 1024 / 1024)} MB` });
          } else if (upload) {
            setUploading(true);
            try {
              field.onChange(await upload(file));
            } catch (e) {
              toast({ variant: "destructive", title: "Tải ảnh thất bại", description: e instanceof Error ? e.message : undefined });
            } finally {
              setUploading(false);
            }
          } else {
            field.onChange(await readAsDataUrl(file));
          }
          if (ref.current) ref.current.value = "";
        };
        return (
          <FormItem>
            <FormLabel>{label}</FormLabel>
            <div className={cn("flex gap-4", aspect === "cover" ? "flex-col" : "items-center")}>
              <button
                type="button"
                onClick={() => ref.current?.click()}
                disabled={uploading}
                className={cn(
                  "group relative shrink-0 overflow-hidden border-2 border-dashed bg-muted/50 text-muted-foreground transition-colors hover:border-primary",
                  aspect === "cover" ? "aspect-[16/5] w-full max-w-xl rounded-xl" : "h-20 w-20 rounded-2xl",
                )}
              >
                {uploading ? (
                  <span className="flex h-full w-full items-center justify-center">
                    <Loader2 className="h-5 w-5 animate-spin" />
                  </span>
                ) : field.value ? (
                  <img src={field.value} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="flex h-full w-full flex-col items-center justify-center gap-1 text-xs">
                    <ImagePlus className="h-5 w-5" /> Tải ảnh
                  </span>
                )}
                {field.value && (
                  <span className="absolute inset-0 flex items-center justify-center bg-black/40 text-xs font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
                    Đổi ảnh
                  </span>
                )}
              </button>
              <div className="space-y-2 text-xs text-muted-foreground">
                {hint && <p>{hint}</p>}
                <div className="flex gap-2">
                  <Button type="button" variant="outline" size="sm" disabled={uploading} onClick={() => ref.current?.click()}>
                    <ImagePlus className="mr-1.5 h-4 w-4" /> {field.value ? "Đổi ảnh" : "Chọn ảnh"}
                  </Button>
                  {field.value && (
                    <Button type="button" variant="ghost" size="sm" onClick={() => field.onChange("")}>
                      <Trash2 className="mr-1.5 h-4 w-4" /> Gỡ
                    </Button>
                  )}
                </div>
              </div>
            </div>
            <input ref={ref} type="file" accept={TYPES.join(",")} hidden onChange={(e) => void pick(e.target.files?.[0])} />
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
