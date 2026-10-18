import { LayoutGrid, List } from "lucide-react";
import { Button } from "@Team-Trung-Vu-Khang/eco-shared-ui";
import type { ListView } from "@/stores/ui-prefs.store";

const OPTIONS = [
  { value: "table", label: "Bảng", icon: List },
  { value: "grid", label: "Lưới", icon: LayoutGrid },
] as const;

/** Segmented table/grid switch (Buttons, so it follows the theme's primary color) */
export function ViewToggle({
  value,
  onChange,
}: {
  value: ListView;
  onChange: (v: ListView) => void;
}) {
  return (
    <div
      role="radiogroup"
      aria-label="Kiểu hiển thị"
      className="inline-flex gap-1 rounded-lg border bg-card p-1"
    >
      {OPTIONS.map((o) => (
        <Button
          key={o.value}
          role="radio"
          aria-checked={value === o.value}
          size="sm"
          variant={value === o.value ? "default" : "ghost"}
          onClick={() => onChange(o.value)}
          className="h-8 gap-1.5 px-3"
        >
          <o.icon className="h-4 w-4" /> {o.label}
        </Button>
      ))}
    </div>
  );
}
