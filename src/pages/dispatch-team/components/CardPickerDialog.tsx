import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Check, Search } from "lucide-react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  cn,
} from "@Team-Trung-Vu-Khang/eco-shared-ui";

export interface PickerItem {
  id: string;
  title: string;
  subtitle?: string;
  /** Image or avatar shown at the top-left of the card */
  media: ReactNode;
  /** Extra line under the subtitle (e.g. "Đang ở Nhóm A") */
  note?: string;
  /** Can't be picked — `note` says why */
  disabled?: boolean;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  searchPlaceholder: string;
  items: PickerItem[];
  value: string[];
  onChange: (ids: string[]) => void;
}

/** Search + click-a-card multi select. Changes apply only on "Xác nhận" */
export function CardPickerDialog({ open, onOpenChange, ...rest }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] max-w-3xl flex-col gap-4">
        {/* Mounted only while open, so each opening starts from the current selection */}
        {open && <PickerBody {...rest} onClose={() => onOpenChange(false)} />}
      </DialogContent>
    </Dialog>
  );
}

function PickerBody({
  title,
  searchPlaceholder,
  items,
  value,
  onChange,
  onClose,
}: Omit<Props, "open" | "onOpenChange"> & { onClose: () => void }) {
  const [q, setQ] = useState("");
  const [draft, setDraft] = useState<string[]>(value);

  const shown = useMemo(() => {
    const k = q.trim().toLowerCase();
    return k ? items.filter((i) => `${i.title} ${i.subtitle ?? ""}`.toLowerCase().includes(k)) : items;
  }, [items, q]);

  const toggle = (id: string) => setDraft((d) => (d.includes(id) ? d.filter((x) => x !== id) : [...d, id]));

  return (
    <>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={searchPlaceholder} className="pl-9!" autoFocus />
        </div>

        <div className="-mx-1 min-h-0 flex-1 overflow-y-auto px-1">
          {shown.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">Không tìm thấy kết quả phù hợp</p>
          ) : (
            <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
              {shown.map((it) => {
                const on = draft.includes(it.id);
                return (
                  <button
                    key={it.id}
                    type="button"
                    disabled={it.disabled}
                    onClick={() => toggle(it.id)}
                    className={cn(
                      "relative flex items-center gap-3 rounded-xl border p-3 text-left transition",
                      on ? "border-primary bg-primary/5 ring-1 ring-primary" : "hover:border-primary/50",
                      it.disabled && "cursor-not-allowed opacity-50 hover:border-border",
                    )}
                  >
                    {it.media}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{it.title}</span>
                      {it.subtitle && <span className="block truncate text-xs text-muted-foreground">{it.subtitle}</span>}
                      {it.note && <span className="block truncate text-xs text-amber-700">{it.note}</span>}
                    </span>
                    <span
                      className={cn(
                        "flex size-5 shrink-0 items-center justify-center rounded-full border",
                        on ? "border-primary bg-primary text-primary-foreground" : "bg-background",
                      )}
                    >
                      {on && <Check className="h-3 w-3" />}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <DialogFooter className="items-center sm:justify-between">
          <span className="text-sm text-muted-foreground">Đã chọn {draft.length}</span>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Huỷ
            </Button>
            <Button
              onClick={() => {
                onChange(draft);
                onClose();
              }}
            >
              Xác nhận
            </Button>
          </div>
        </DialogFooter>
    </>
  );
}
