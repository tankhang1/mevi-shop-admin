import {
  CartesianGrid,
  Line,
  LineChart,
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
} from "@Team-Trung-Vu-Khang/eco-shared-ui";
import type { RevenueReport } from "@/features/report";
import { formatCompactVnd, formatVnd } from "@/lib/format";
import { CHART } from "@/pages/dashboard/components/chart-theme";
import { BUCKET_LABEL, SERIES_COLORS, bucketLabel } from "./report-format";

/**
 * Top 5 entities over time. Colour is assigned by rank in this period's top 5 and the legend
 * always names every line, so identity never rests on colour alone.
 */
export function TopSeriesChart({
  report,
  entity,
}: {
  report: RevenueReport;
  entity: string;
}) {
  const { trend, topSeries, bucket } = report;
  const data = trend.map((t, i) => ({
    date: t.date,
    ...Object.fromEntries(topSeries.map((s) => [s.id, s.values[i] ?? 0])),
  }));

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">
          Top {topSeries.length} {entity.toLowerCase()} theo{" "}
          {BUCKET_LABEL[bucket]}
        </CardTitle>
        <ul className="flex flex-wrap gap-x-4 gap-y-1 pt-1">
          {topSeries.map((s, i) => (
            <li
              key={s.id}
              className="flex items-center gap-1.5 text-xs text-muted-foreground"
            >
              <span
                className="h-0.5 w-4 rounded-full"
                style={{ background: SERIES_COLORS[i] }}
              />
              <span className="max-w-40 truncate" title={s.label}>
                {s.label}
              </span>
            </li>
          ))}
        </ul>
      </CardHeader>
      <CardContent className="h-64 pl-0 pr-4">
        {topSeries.length === 0 ? (
          <p className="py-16 text-center text-sm text-muted-foreground">
            Chưa đủ dữ liệu để so sánh.
          </p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 8, right: 4, left: 0, bottom: 0 }}
            >
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
                tickFormatter={formatCompactVnd}
                tickLine={false}
                axisLine={false}
                tick={{ fill: CHART.tick, fontSize: 11 }}
                width={56}
              />
              <Tooltip
                cursor={{ stroke: CHART.axis, strokeDasharray: "3 3" }}
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;
                  // Highest first, so the tooltip reads like a ranking for that bucket
                  const rows = [...payload].sort(
                    (a, b) => Number(b.value) - Number(a.value),
                  );
                  return (
                    <div className="min-w-48 rounded-lg border bg-popover px-3 py-2 text-xs shadow-md">
                      <p className="mb-1.5 font-medium text-muted-foreground">
                        {bucketLabel(String(label), bucket, true)}
                      </p>
                      {rows.map((r) => {
                        const i = topSeries.findIndex(
                          (s) => s.id === r.dataKey,
                        );
                        return (
                          <div
                            key={String(r.dataKey)}
                            className="flex items-center gap-2 py-0.5"
                          >
                            <span
                              className="h-2 w-2 shrink-0 rounded-full"
                              style={{ background: SERIES_COLORS[i] }}
                            />
                            <span className="min-w-0 flex-1 truncate">
                              {topSeries[i]?.label}
                            </span>
                            <span className="font-semibold tabular-nums">
                              {formatVnd(Number(r.value))}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  );
                }}
              />
              {topSeries.map((s, i) => (
                <Line
                  key={s.id}
                  type="linear"
                  dataKey={s.id}
                  name={s.label}
                  stroke={SERIES_COLORS[i]}
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                  activeDot={{ r: 4, stroke: CHART.surface, strokeWidth: 2 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
