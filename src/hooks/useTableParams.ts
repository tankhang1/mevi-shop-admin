import { useState } from "react";
import type { DataTableProps } from "@Team-Trung-Vu-Khang/eco-shared-ui";
import type { ListParams, Paginated } from "@/types/api";

/**
 * Server-side paging/search/filter state for eco-shared-ui DataTable.
 * `params` goes to the list hook; `bind(result)` spreads into <DataTable>.
 */
export function useTableParams<F extends Record<string, string>>(initialFilters = {} as F, initialSize = 10) {
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(initialSize);
  const [keyword, setKeyword] = useState("");
  const [filters, setFilters] = useState<F>(initialFilters);

  const params: ListParams & F = { page, size, keyword: keyword || undefined, ...filters };

  function bind<T>(result: Paginated<T> | undefined, loading: boolean) {
    return {
      data: result?.items ?? [],
      loading,
      pageSize: size,
      currentIndex: page,
      totalElements: result?.total ?? 0,
      totalPages: Math.max(1, Math.ceil((result?.total ?? 0) / size)),
      onIndexChange: (index: number) => setPage(Math.max(1, index)),
      onPageSize: (next: number) => {
        setSize(next);
        setPage(1);
      },
      onSearch: (value: string) => {
        setKeyword(value);
        setPage(1);
      },
      onFilterChange: (key: string, value: string) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
        setPage(1);
      },
    } satisfies Partial<DataTableProps<T>>;
  }

  /** Back to page 1 with no keyword/filters — e.g. when switching between table and grid */
  const reset = (nextSize = size) => {
    setPage(1);
    setSize(nextSize);
    setKeyword("");
    setFilters(initialFilters);
  };

  return { params, bind, reset, state: { page, size, keyword, filters } };
}
