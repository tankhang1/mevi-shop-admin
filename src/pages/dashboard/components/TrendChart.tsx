import { useState } from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, Tabs, TabsList, TabsTrigger } from "@Team-Trung-Vu-Khang/eco-shared-ui";
import type { DashboardSummary } from "@/features/dashboard";
import { formatCompactVnd, formatVnd } from "@/lib/format";
import { CHART } from "./chart-theme";

type Measure = "revenue" | "orders";

const dayLabel = (iso: string) => new Date(iso).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });

function ChartTooltip({ active, payload, measure }: { active?: boolean; payload?: { payload: DashboardSummary["trend"][number] }[]; measure: Measure }) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-xs shadow-md">
      <p className="mb-1 font-medium text-muted-foreground">
        {new Date(p.date).toLocaleDateString("vi-VN", { weekday: "short", day: "2-digit", month: "2-digit" })}
      </p>
      <p className="text-sm font-semibold tabular-nums text-foreground">
        {measure === "revenue" ? formatVnd(p.revenue) : `${p.orders} đơn`}
      </p>
    </div>
  );
}

/** One measure at a time — revenue and order count have different scales, so no dual axis */
export function TrendChart({ trend }: { trend: DashboardSummary["trend"] }) {
  const [measure, setMeasure] = useState<Measure>("revenue");
  const total = trend.reduce((s, d) => s + d[measure], 0);
  const peak = trend.reduce((best, d) => (d[measure] > best[measure] ? d : best), trend[0]);
  const fmt = measure === "revenue" ? formatCompactVnd : (n: number) => String(n);

  const axes = (
    <>
      <CartesianGrid vertical={false} stroke={CHART.grid} />
      <XAxis
        dataKey="date"
        tickFormatter={dayLabel}
        tickLine={false}
        axisLine={{ stroke: CHART.axis }}
        tick={{ fill: CHART.tick, fontSize: 11 }}
        minTickGap={24}
      />
      <YAxis
        tickFormatter={fmt}
        tickLine={false}
        axisLine={false}
        tick={{ fill: CHART.tick, fontSize: 11 }}
        width={56}
        allowDecimals={false}
      />
      <Tooltip
        content={<ChartTooltip measure={measure} />}
        cursor={measure === "revenue" ? { stroke: CHART.axis, strokeDasharray: "3 3" } : { fill: CHART.grid }}
      />
    </>
  );

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3 space-y-0">
        <div>
          <CardTitle className="text-base">{measure === "revenue" ? "Doanh thu theo ngày" : "Số đơn theo ngày"}</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            Tổng <span className="font-semibold text-foreground tabular-nums">{measure === "revenue" ? formatVnd(total) : `${total} đơn`}</span>
            {peak && peak[measure] > 0 && (
              <> · cao nhất {dayLabel(peak.date)} ({measure === "revenue" ? formatCompactVnd(peak.revenue) : `${peak.orders} đơn`})</>
            )}
          </p>
        </div>
        <Tabs value={measure} onValueChange={(v) => setMeasure(v as Measure)}>
          <TabsList>
            <TabsTrigger value="revenue">Doanh thu</TabsTrigger>
            <TabsTrigger value="orders">Số đơn</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent className="h-72 pl-0 pr-4">
        <ResponsiveContainer width="100%" height="100%">
          {measure === "revenue" ? (
            <AreaChart data={trend} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={CHART.series} stopOpacity={0.22} />
                  <stop offset="100%" stopColor={CHART.series} stopOpacity={0} />
                </linearGradient>
              </defs>
              {axes}
              <Area
                type="monotone"
                dataKey="revenue"
                stroke={CHART.series}
                strokeWidth={2}
                fill="url(#revFill)"
                activeDot={{ r: 5, stroke: CHART.surface, strokeWidth: 2 }}
              />
            </AreaChart>
          ) : (
            <BarChart data={trend} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
              {axes}
              <Bar dataKey="orders" fill={CHART.series} radius={[4, 4, 0, 0]} maxBarSize={18} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
