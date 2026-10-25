import { RotateCcw } from "lucide-react";
import {
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Tabs,
  TabsList,
  TabsTrigger,
} from "@Team-Trung-Vu-Khang/eco-shared-ui";
import { PRODUCT_CATEGORIES } from "@/features/product";
import type { OrderSource } from "@/features/report";
import {
  PRESETS,
  type RangePreset,
  type ReportFilterState,
  defaultFilters,
  isoDay,
  rangeFor,
} from "./report-filters";

interface Props {
  value: ReportFilterState;
  onChange: (next: ReportFilterState) => void;
  /** Root only */
  shopOptions?: { label: string; value: string }[];
  initialShopId: string;
}

/** One row above the charts; every chart, stat and table below follows it */
export function ReportFilters({
  value: f,
  onChange,
  shopOptions,
  initialShopId,
}: Props) {
  const set = (patch: Partial<ReportFilterState>) =>
    onChange({ ...f, ...patch });
  const isDefault =
    f.preset === "30" &&
    f.category === "all" &&
    f.source === "all" &&
    f.shopId === initialShopId;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Tabs
        value={f.preset}
        onValueChange={(v) => {
          const preset = v as RangePreset;
          set(
            preset === "custom"
              ? { preset }
              : { preset, ...rangeFor(Number(preset)) },
          );
        }}
      >
        <TabsList>
          {PRESETS.map((p) => (
            <TabsTrigger key={p.value} value={p.value}>
              {p.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {f.preset === "custom" && (
        <div className="flex items-center gap-1.5">
          <Input
            type="date"
            className="h-9 w-[150px]"
            value={f.from}
            max={f.to}
            onChange={(e) => e.target.value && set({ from: e.target.value })}
            aria-label="Từ ngày"
          />
          <span className="text-muted-foreground">→</span>
          <Input
            type="date"
            className="h-9 w-[150px]"
            value={f.to}
            min={f.from}
            max={isoDay(new Date())}
            onChange={(e) => e.target.value && set({ to: e.target.value })}
            aria-label="Đến ngày"
          />
        </div>
      )}

      <Select
        value={f.source}
        onValueChange={(v) => set({ source: v as OrderSource })}
      >
        <SelectTrigger className="h-9 w-44" aria-label="Nguồn đơn">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Mọi nguồn đơn</SelectItem>
          <SelectItem value="agency">Qua đại lý / CTV</SelectItem>
          <SelectItem value="direct">Bán trực tiếp</SelectItem>
        </SelectContent>
      </Select>

      <Select value={f.category} onValueChange={(v) => set({ category: v })}>
        <SelectTrigger className="h-9 w-40" aria-label="Danh mục">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Mọi danh mục</SelectItem>
          {PRODUCT_CATEGORIES.map((c) => (
            <SelectItem key={c} value={c}>
              {c}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {shopOptions && (
        <Select value={f.shopId} onValueChange={(v) => set({ shopId: v })}>
          <SelectTrigger className="h-9 w-48" aria-label="Gian hàng">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả gian hàng</SelectItem>
            {shopOptions.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {!isDefault && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onChange(defaultFilters(initialShopId))}
        >
          <RotateCcw className="mr-1.5 h-3.5 w-3.5" /> Đặt lại
        </Button>
      )}
    </div>
  );
}
