import type { ListParams, Paginated, SpringPage } from "@/types/api";

/** useTableParams is 1-based, Spring pages are 0-based */
export const toSpringPageParams = <P extends ListParams>({ page = 1, ...rest }: P) => ({ ...rest, page: page - 1 });

/** Spring page → the `Paginated` shape useTableParams.bind expects */
export const fromSpringPage = <T,>(p: SpringPage<T> | undefined): Paginated<T> | undefined =>
  p && { items: p.content, page: p.page + 1, size: p.size, total: p.totalElements };

/** Drop "all" / empty filter values so they are not sent as query params */
export const cleanFilters = <T extends Record<string, unknown>>(f: T) =>
  Object.fromEntries(Object.entries(f).filter(([, v]) => v !== "all" && v !== "" && v != null)) as Partial<T>;
