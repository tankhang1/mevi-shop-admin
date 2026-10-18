import type { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@Team-Trung-Vu-Khang/eco-shared-ui";
import { CHART } from "./chart-theme";

export interface BarListItem {
  key: string;
  label: ReactNode;
  value: number;
  display: string;
}

/** Ranked horizontal bars — one hue, every bar direct-labeled, so no legend needed */
export function BarList({
  title,
  subtitle,
  items,
  empty = "Chưa có dữ liệu",
}: {
  title: string;
  subtitle?: string;
  items: BarListItem[];
  empty?: string;
}) {
  const max = Math.max(1, ...items.map((i) => i.value));
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{title}</CardTitle>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      </CardHeader>
      <CardContent className="space-y-3">
        {items.length === 0 && <p className="py-6 text-center text-sm text-muted-foreground">{empty}</p>}
        {items.map((i) => (
          <div key={i.key} className="group" title={`${typeof i.label === "string" ? i.label : i.key}: ${i.display}`}>
            <div className="mb-1 flex items-center justify-between gap-3 text-sm">
              <span className="min-w-0 truncate">{i.label}</span>
              <span className="shrink-0 font-medium tabular-nums">{i.display}</span>
            </div>
            <div className="h-2 rounded-full bg-muted">
              <div
                className="h-2 rounded-full transition-[width,opacity] duration-500 group-hover:opacity-80"
                style={{ width: `${(i.value / max) * 100}%`, minWidth: i.value ? 4 : 0, background: CHART.series }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
