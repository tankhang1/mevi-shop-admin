import { useState } from "react";
import type { ReactNode } from "react";
import {
  Button,
  Combobox,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@Team-Trung-Vu-Khang/eco-shared-ui";
import { useDispatchTeams } from "@/features/dispatch-team";
import { EMPTY_ORDER_FILTERS, ORDER_STATUS, ORDER_STATUSES, type OrderFilters, VN_LOCATIONS, VN_PROVINCES } from "@/features/order";
import { useProducts } from "@/features/product";
import { useProductGroups } from "@/features/product-group";
import { useStaffList } from "@/features/staff";

const ALL = "all";

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="space-y-3 border-b pb-5 last:border-0">
      <legend className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</legend>
      <div className="grid gap-3 sm:grid-cols-2">{children}</div>
    </fieldset>
  );
}

function Field({ label, children, wide }: { label: string; children: ReactNode; wide?: boolean }) {
  return (
    <div className={wide ? "space-y-1.5 sm:col-span-2" : "space-y-1.5"}>
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  );
}

/** Searchable select with an "all" entry; `ALL` means not filtered */
function Pick({
  value,
  onChange,
  options,
  allLabel,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { label: string; value: string }[];
  allLabel: string;
  placeholder: string;
}) {
  return (
    <Combobox
      options={[{ label: allLabel, value: ALL }, ...options]}
      value={value}
      onChange={(v) => onChange(v || ALL)}
      placeholder={placeholder}
      searchPlaceholder="Tìm..."
      emptyText="Không có kết quả"
      className="w-full min-w-0 max-w-full overflow-hidden"
    />
  );
}

type Value = OrderFilters & { shopId?: string };

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: Value;
  onApply: (next: Value) => void;
  /** Root only — omit for shop admins */
  shopOptions?: { label: string; value: string }[];
}

/** "Bộ lọc" side sheet: điều phối, sản phẩm, thời gian, trạng thái, mã đơn, vị trí, khách hàng */
export function OrderFilterSheet({ open, onOpenChange, ...rest }: Props) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-xl">
        {/* Mounted only while open, so each opening starts from the applied filters */}
        {open && <FilterBody {...rest} onClose={() => onOpenChange(false)} />}
      </SheetContent>
    </Sheet>
  );
}

function FilterBody({
  value,
  onApply,
  shopOptions,
  onClose,
}: Omit<Props, "open" | "onOpenChange"> & { onClose: () => void }) {
  const [f, setF] = useState<Value>(value);
  const set = (patch: Partial<Value>) => setF((prev) => ({ ...prev, ...patch }));

  const { data: teams } = useDispatchTeams({ size: 200 });
  const { data: staff } = useStaffList({ size: 200 });
  const { data: groups } = useProductGroups({ size: 200 });
  const { data: products } = useProducts({ size: 200 });

  const team = teams?.items.find((t) => t.id === f.teamId);
  // Picking a team narrows the staff list to its members
  const staffOptions = (staff?.items ?? [])
    .filter((s) => !team || team.memberIds.includes(s.id))
    .map((s) => ({ label: s.name, value: s.id }));
  const group = groups?.items.find((g) => g.id === f.productGroupId);
  const productOptions = (products?.items ?? [])
    .filter((p) => !group || group.productIds.includes(p.id))
    .map((p) => ({ label: `${p.name} · ${p.sku}`, value: p.id }));
  const wards = f.province !== ALL ? (VN_LOCATIONS[f.province] ?? []) : [];

  return (
    <>
      <SheetHeader className="border-b p-4 sm:px-6">
        <SheetTitle>Bộ lọc đơn hàng</SheetTitle>
      </SheetHeader>

      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-4 sm:px-6">
        <Group title="Đơn hàng">
          {shopOptions && (
            <Field label="Gian hàng" wide>
              <Pick
                value={f.shopId || ALL}
                onChange={(v) => set({ shopId: v })}
                allLabel="Tất cả gian hàng"
                placeholder="Tất cả gian hàng"
                options={shopOptions}
              />
            </Field>
          )}
          <Field label="Mã đơn hàng">
            <Input value={f.code} onChange={(e) => set({ code: e.target.value })} placeholder="VD: MV-2001" />
          </Field>
          <Field label="Trạng thái">
            <Select value={f.status} onValueChange={(v) => set({ status: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>Tất cả trạng thái</SelectItem>
                {ORDER_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {ORDER_STATUS[s].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </Group>

        <Group title="Thời gian">
          <Field label="Theo" wide>
            <div className="grid grid-cols-2 gap-1 rounded-lg bg-muted p-1">
              {(
                [
                  ["createdAt", "Ngày đặt"],
                  ["deliveredAt", "Ngày giao"],
                ] as const
              ).map(([k, label]) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => set({ dateField: k })}
                  className={
                    f.dateField === k
                      ? "rounded-md bg-background px-3 py-1.5 text-sm font-medium shadow-sm"
                      : "rounded-md px-3 py-1.5 text-sm text-muted-foreground"
                  }
                >
                  {label}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Từ ngày">
            <Input type="date" value={f.from} max={f.to || undefined} onChange={(e) => set({ from: e.target.value })} />
          </Field>
          <Field label="Đến ngày">
            <Input type="date" value={f.to} min={f.from || undefined} onChange={(e) => set({ to: e.target.value })} />
          </Field>
        </Group>

        <Group title="Điều phối">
          <Field label="Nhóm điều phối">
            <Pick
              value={f.teamId}
              onChange={(v) => set({ teamId: v, assigneeId: ALL })}
              allLabel="Tất cả nhóm"
              placeholder="Tất cả nhóm"
              options={[
                { label: "Chưa phân nhóm", value: "none" },
                ...(teams?.items ?? []).map((t) => ({ label: t.name, value: t.id })),
              ]}
            />
          </Field>
          <Field label="Nhân viên">
            <Pick
              value={f.assigneeId}
              onChange={(v) => set({ assigneeId: v })}
              allLabel="Tất cả nhân viên"
              placeholder="Tất cả nhân viên"
              options={staffOptions}
            />
          </Field>
        </Group>

        <Group title="Sản phẩm">
          <Field label="Nhóm sản phẩm">
            <Pick
              value={f.productGroupId}
              onChange={(v) => set({ productGroupId: v, productId: ALL })}
              allLabel="Tất cả nhóm sản phẩm"
              placeholder="Tất cả nhóm sản phẩm"
              options={(groups?.items ?? []).map((g) => ({ label: g.name, value: g.id }))}
            />
          </Field>
          <Field label="Sản phẩm">
            <Pick
              value={f.productId}
              onChange={(v) => set({ productId: v })}
              allLabel="Tất cả sản phẩm"
              placeholder="Tất cả sản phẩm"
              options={productOptions}
            />
          </Field>
        </Group>

        <Group title="Vị trí giao hàng">
          <Field label="Tỉnh / thành phố">
            <Pick
              value={f.province}
              onChange={(v) => set({ province: v, ward: ALL })}
              allLabel="Tất cả tỉnh / thành"
              placeholder="Tất cả tỉnh / thành"
              options={VN_PROVINCES.map((p) => ({ label: p, value: p }))}
            />
          </Field>
          <Field label="Xã / phường">
            <Pick
              value={f.ward}
              onChange={(v) => set({ ward: v })}
              allLabel={f.province !== ALL ? "Tất cả xã / phường" : "Chọn tỉnh / thành trước"}
              placeholder="Tất cả xã / phường"
              options={wards.map((w) => ({ label: w, value: w }))}
            />
          </Field>
        </Group>

        <Group title="Khách hàng">
          <Field label="Mã khách hàng">
            <Input value={f.customerCode} onChange={(e) => set({ customerCode: e.target.value })} placeholder="VD: KH0001" />
          </Field>
          <Field label="Số điện thoại">
            <Input
              type="tel"
              inputMode="tel"
              value={f.customerPhone}
              onChange={(e) => set({ customerPhone: e.target.value })}
              placeholder="VD: 0901234567"
            />
          </Field>
        </Group>
      </div>

      <SheetFooter className="flex-row justify-between gap-2 border-t p-4 sm:px-6">
        <Button variant="ghost" onClick={() => setF({ ...EMPTY_ORDER_FILTERS, ...(shopOptions && { shopId: ALL }) })}>
          Xoá bộ lọc
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onClose}>
            Huỷ
          </Button>
          <Button
            onClick={() => {
              onApply(f);
              onClose();
            }}
          >
            Áp dụng
          </Button>
        </div>
      </SheetFooter>
    </>
  );
}
