import type { OrderListParams } from "./types";

/** Every key the sheet controls — all strings so they fit useTableParams */
export type OrderFilters = Required<
  Record<
    | "status"
    | "teamId"
    | "assigneeId"
    | "productGroupId"
    | "productId"
    | "dateField"
    | "from"
    | "to"
    | "code"
    | "province"
    | "ward"
    | "customerCode"
    | "customerPhone",
    string
  >
>;

export const EMPTY_ORDER_FILTERS: OrderFilters = {
  status: "all",
  teamId: "all",
  assigneeId: "all",
  productGroupId: "all",
  productId: "all",
  dateField: "createdAt" satisfies NonNullable<OrderListParams["dateField"]>,
  from: "",
  to: "",
  code: "",
  province: "all",
  ward: "all",
  customerCode: "",
  customerPhone: "",
};

/** How many filters differ from the defaults — shown on the "Bộ lọc" button */
export const countActive = (f: Partial<OrderFilters>) =>
  (Object.keys(EMPTY_ORDER_FILTERS) as (keyof OrderFilters)[]).filter(
    (k) => k !== "dateField" && (f[k] ?? EMPTY_ORDER_FILTERS[k]) !== EMPTY_ORDER_FILTERS[k],
  ).length;
