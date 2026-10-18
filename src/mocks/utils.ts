import type { Paginated } from "@/types/api";

export interface MockRequest {
  params: Record<string, string>;
  query: Record<string, unknown>;
  body: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

export interface MockHandler {
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  /** Express-style path, e.g. /api/admin/shop/products/:id */
  path: string;
  handle: (req: MockRequest) => unknown;
}

export class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export const uid = (prefix: string) =>
  `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

export const daysAgo = (d: number) =>
  new Date(Date.now() - d * 86_400_000).toISOString();

/** Keyword search + pagination, same shape the backend returns */
export function paginate<T>(
  rows: T[],
  query: MockRequest["query"],
  searchIn: (row: T) => string,
): Paginated<T> {
  const keyword = String(query.keyword ?? "")
    .trim()
    .toLowerCase();
  const filtered = keyword
    ? rows.filter((r) => searchIn(r).toLowerCase().includes(keyword))
    : rows;
  const page = Number(query.page ?? 1);
  const size = Number(query.size ?? 20);
  return {
    items: filtered.slice((page - 1) * size, page * size),
    page,
    size,
    total: filtered.length,
  };
}
