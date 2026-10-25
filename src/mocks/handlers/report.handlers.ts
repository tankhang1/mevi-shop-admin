import { API_ENDPOINTS } from "@/config/api-endpoints";
import { FARM_TYPE } from "@/features/farm/constants";
import type { RevenueGroupBy, RevenueReport, RevenueRow, TrendBucket } from "@/features/report/types";
import { db } from "../db";
import { scoped } from "../scope";
import type { MockHandler } from "../utils";

type Acc = { label: string; sub?: string; orders: Set<string>; units: number; revenue: number; commission: number };

interface Filters {
  groupBy: RevenueGroupBy;
  from: string;
  to: string;
  shopId?: unknown;
  category?: string;
  source?: string;
}

const DAY = 86_400_000;
const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

/** day ≤ 31 days, week ≤ ~4 months, month beyond */
function bucketsFor(from: Date, to: Date): { bucket: TrendBucket; starts: Date[] } {
  const span = (to.getTime() - from.getTime()) / DAY;
  const bucket: TrendBucket = span <= 31 ? "day" : span <= 120 ? "week" : "month";
  const starts: Date[] = [];
  let d = bucket === "month" ? new Date(from.getFullYear(), from.getMonth(), 1) : startOfDay(from);
  while (d <= to) {
    starts.push(d);
    d = bucket === "month" ? new Date(d.getFullYear(), d.getMonth() + 1, 1) : new Date(d.getTime() + (bucket === "week" ? 7 : 1) * DAY);
  }
  return { bucket, starts };
}

/** Revenue = completed orders only; product/group/farm reports use line revenue, agency uses order totals */
function buildReport({ groupBy, from, to, shopId, category, source }: Filters): RevenueReport {
  const fromD = startOfDay(new Date(from));
  const toD = new Date(startOfDay(new Date(to)).getTime() + DAY - 1);
  const inCategory = (productId: string) =>
    !category || category === "all" || db.products.find((p) => p.id === productId)?.category === category;
  const orders = scoped(db.orders, shopId)
    .filter((o) => o.status === "completed")
    .filter((o) => new Date(o.createdAt) >= fromD && new Date(o.createdAt) <= toD)
    .filter((o) => !source || source === "all" || (source === "agency" ? !!o.agencyId : !o.agencyId))
    // With a category filter only matching lines count; drop orders left with none
    .map((o) => ({ ...o, items: (o.items ?? []).filter((it) => inCategory(it.productId)) }))
    .filter((o) => o.items.length > 0)
    .map((o) => ({
      ...o,
      total: category && category !== "all" ? o.items.reduce((s, it) => s + it.quantity * it.price, 0) : o.total,
    }));
  const { bucket: trendBucket, starts } = bucketsFor(fromD, toD);
  const bucketOf = (iso: string) => {
    const t = new Date(iso).getTime();
    let i = starts.length - 1;
    while (i > 0 && starts[i].getTime() > t) i--;
    return i;
  };
  // Per-entity revenue per bucket, for the "top 5 over time" chart
  const perBucket = new Map<string, number[]>();
  const addPoint = (id: string, iso: string, v: number) => {
    if (!perBucket.has(id)) perBucket.set(id, new Array(starts.length).fill(0));
    perBucket.get(id)![bucketOf(iso)] += v;
  };
  const acc = new Map<string, Acc>();
  const bucket = (id: string, label: string, sub?: string) => {
    if (!acc.has(id)) acc.set(id, { label, sub, orders: new Set(), units: 0, revenue: 0, commission: 0 });
    return acc.get(id)!;
  };

  for (const o of orders) {
    if (groupBy === "agency") {
      const a = o.agencyId ? db.agencies.find((x) => x.id === o.agencyId) : undefined;
      const b = a ? bucket(a.id, a.name, `Hoa hồng ${o.commissionRate ?? a.commissionRate}%`) : bucket("none", "Bán trực tiếp", "Không qua đại lý / CTV");
      b.orders.add(o.id);
      b.units += (o.items ?? []).reduce((s, it) => s + it.quantity, 0);
      b.revenue += o.total;
      addPoint(a?.id ?? "none", o.createdAt, o.total);
      if (a) b.commission += Math.round((o.total * (o.commissionRate ?? a.commissionRate)) / 100);
      continue;
    }
    for (const it of o.items ?? []) {
      const p = db.products.find((x) => x.id === it.productId);
      const line = it.quantity * it.price;
      const add = (id: string, label: string, sub?: string) => {
        const b = bucket(id, label, sub);
        b.orders.add(o.id);
        b.units += it.quantity;
        b.revenue += line;
        addPoint(id, o.createdAt, line);
      };
      if (groupBy === "product") {
        add(it.productId, it.name, p?.sku);
      } else if (groupBy === "farm") {
        const f = p?.farmId ? db.farms.find((x) => x.id === p.farmId) : undefined;
        if (f) add(f.id, f.name, `${FARM_TYPE[f.type]} · ${f.location}`);
        else add("none", "Chưa gắn nông hộ");
      } else {
        // A product can sit in several groups — its revenue counts towards each of them
        const groups = db.productGroups.filter((g) => g.productIds.includes(it.productId));
        if (!groups.length) add("none", "Chưa phân nhóm");
        groups.forEach((g) => add(g.id, g.name, `${g.productIds.length} sản phẩm`));
      }
    }
  }

  const totalRevenue = orders.reduce((s, o) => s + o.total, 0);
  const rows: RevenueRow[] = [...acc.entries()]
    .map(([id, b]) => ({
      id,
      label: b.label,
      sub: b.sub,
      orders: b.orders.size,
      units: b.units,
      revenue: b.revenue,
      share: totalRevenue ? Math.round((b.revenue / totalRevenue) * 1000) / 10 : 0,
      ...(groupBy === "agency" ? { commission: b.commission } : {}),
    }))
    .sort((a, b) => b.revenue - a.revenue);

  const trend = starts.map((d, i) => {
    const inBucket = orders.filter((o) => bucketOf(o.createdAt) === i);
    return { date: d.toISOString(), revenue: inBucket.reduce((s, o) => s + o.total, 0), orders: inBucket.length };
  });
  // Top 5 named entities (the catch-all row isn't an entity worth trending)
  const topSeries = rows
    .filter((r) => r.id !== "none")
    .slice(0, 5)
    .map((r) => ({ id: r.id, label: r.label, values: perBucket.get(r.id) ?? [] }));

  return {
    groupBy,
    from,
    to,
    bucket: trendBucket,
    trend,
    topSeries,
    totals: {
      revenue: totalRevenue,
      orders: orders.length,
      units: orders.reduce((s, o) => s + (o.items ?? []).reduce((u, it) => u + it.quantity, 0), 0),
      ...(groupBy === "agency" ? { commission: rows.reduce((s, r) => s + (r.commission ?? 0), 0) } : {}),
    },
    rows,
  };
}

export const reportHandlers: MockHandler[] = [
  { method: "GET", path: API_ENDPOINTS.admin.farms, handle: () => ({ data: db.farms }) },
  {
    method: "GET",
    path: API_ENDPOINTS.admin.reports.revenue,
    handle: ({ query }) => ({
      data: buildReport({
        groupBy: (query.groupBy as RevenueGroupBy) ?? "product",
        from: String(query.from),
        to: String(query.to),
        shopId: query.shopId,
        category: query.category as string | undefined,
        source: query.source as string | undefined,
      }),
    }),
  },
];
