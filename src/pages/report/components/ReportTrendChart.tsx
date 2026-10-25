import { useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Tabs,
  TabsList,
  TabsTrigger,
} from "@Team-Trung-Vu-Khang/eco-shared-ui";
import type { RevenueReport, TrendPoint } from "@/features/report";
import { formatCompactVnd, formatVnd } from "@/lib/format";
import { CHART } from "@/pages/dashboard/components/chart-theme";
import { BUCKET_LABEL, bucketLabel } from "./report-format";

type Measure = "revenue" | "orders";

/** Revenue (area) or order count (bars) per bucket — one measure at a time, never a dual axis */
export function ReportTrendChart({ report }: { report: RevenueReport }) {
  const [measure, setMeasure] = useState<Measure>("revenue");
  const { trend, bucket } = report;
  const peak = trend.reduce<TrendPoint | null>(
    (best, d) => (!best || d[measure] > best[measure] ? d : best),
    null,
  );
  const fmt =
    measure === "revenue" ? formatCompactVnd : (n: number) => String(n);

  const axes = (
    <>
      <CartesianGrid vertical={false} stroke={CHART.grid} />
      <XAxis
        dataKey="date"
        tickFormatter={(v: string) => bucketLabel(v, bucket)}
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
        cursor={
          measure === "revenue"
            ? { stroke: CHART.axis, strokeDasharray: "3 3" }
            : { fill: CHART.grid }
        }
        content={({ active, payload }) => {
          if (!active || !payload?.length) return null;
          const p = payload[0].payload as TrendPoint;
          return (
            <div className="rounded-lg border bg-popover px-3 py-2 text-xs shadow-md">
              <p className="mb-1 font-medium text-muted-foreground">
                {bucketLabel(p.date, bucket, true)}
              </p>
              <p className="text-sm font-semibold tabular-nums">
                {formatVnd(p.revenue)}
              </p>
              <p className="text-muted-foreground">{p.orders} đơn hoàn tất</p>
            </div>
          );
        }}
      />
    </>
  );

  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3 space-y-0">
        <div>
          <CardTitle className="text-base">
            {measure === "revenue" ? "Doanh thu" : "Số đơn"} theo{" "}
            {BUCKET_LABEL[bucket]}
          </CardTitle>
          {peak && peak[measure] > 0 && (
            <p className="mt-1 text-sm text-muted-foreground">
              Cao nhất {bucketLabel(peak.date, bucket, true).toLowerCase()} ·{" "}
              <span className="font-semibold text-foreground tabular-nums">
                {measure === "revenue"
                  ? formatVnd(peak.revenue)
                  : `${peak.orders} đơn`}
              </span>
            </p>
          )}
        </div>
        <Tabs value={measure} onValueChange={(v) => setMeasure(v as Measure)}>
          <TabsList>
            <TabsTrigger value="revenue">Doanh thu</TabsTrigger>
            <TabsTrigger value="orders">Số đơn</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent className="h-52 pl-0 pr-4 md:h-64">
        <ResponsiveContainer width="100%" height="100%">
          {measure === "revenue" ? (
            <AreaChart
              data={trend}
              margin={{ top: 8, right: 4, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="reportRevFill" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor={CHART.series}
                    stopOpacity={0.22}
                  />
                  <stop
                    offset="100%"
                    stopColor={CHART.series}
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              {axes}
              <Area
                type="linear"
                dataKey="revenue"
                stroke={CHART.series}
                strokeWidth={2}
                fill="url(#reportRevFill)"
                activeDot={{ r: 5, stroke: CHART.surface, strokeWidth: 2 }}
              />
            </AreaChart>
          ) : (
            <BarChart
              data={trend}
              margin={{ top: 8, right: 4, left: 0, bottom: 0 }}
            >
              {axes}
              <Bar
                dataKey="orders"
                fill={CHART.series}
                radius={[4, 4, 0, 0]}
                maxBarSize={18}
              />
            </BarChart>
          )}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
