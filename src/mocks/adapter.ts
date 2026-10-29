import {
  AxiosError,
  AxiosHeaders,
  type AxiosAdapter,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
  getAdapter,
} from "axios";
import { agencyHandlers } from "./handlers/agency.handlers";
import { authHandlers } from "./handlers/auth.handlers";
import { customerHandlers } from "./handlers/customer.handlers";
import { dispatchTeamHandlers } from "./handlers/dispatch-team.handlers";
import { dashboardHandlers } from "./handlers/dashboard.handlers";
import { farmHandlers } from "./handlers/farm.handlers";
import { farmRegistrationHandlers } from "./handlers/farm-registration.handlers";
import { inventoryHandlers } from "./handlers/inventory.handlers";
import { orderHandlers } from "./handlers/order.handlers";
import { productGroupHandlers } from "./handlers/product-group.handlers";
import { productHandlers } from "./handlers/product.handlers";
import { reportHandlers } from "./handlers/report.handlers";
import { reviewHandlers } from "./handlers/review.handlers";
import { staffHandlers } from "./handlers/staff.handlers";
import { shopHandlers } from "./handlers/shop.handlers";
import { env } from "@/config/env";
import { HttpError, type MockHandler } from "./utils";

const handlers: MockHandler[] = [
  ...authHandlers,
  ...dashboardHandlers,
  ...productHandlers,
  ...productGroupHandlers,
  ...inventoryHandlers,
  ...farmHandlers,
  ...farmRegistrationHandlers,
  ...orderHandlers,
  ...dispatchTeamHandlers,
  ...customerHandlers,
  ...agencyHandlers,
  ...shopHandlers,
  ...staffHandlers,
  ...reviewHandlers,
  ...reportHandlers,
];

const LATENCY_MS = 350;
const realAdapter = getAdapter(["xhr", "fetch"]);

function matchPath(pattern: string, path: string) {
  const keys: string[] = [];
  const re = new RegExp(
    `^${pattern.replace(/:(\w+)/g, (_, k) => (keys.push(k), "([^/]+)"))}$`,
  );
  const m = path.match(re);
  return m
    ? Object.fromEntries(keys.map((k, i) => [k, decodeURIComponent(m[i + 1])]))
    : null;
}

/**
 * Answers requests that match a handler in ./handlers with dummy data;
 * unmatched calls to our API host get a mock 404, anything else (other hosts) goes to the real network.
 */
export const mockAdapter: AxiosAdapter = async (
  config: InternalAxiosRequestConfig,
) => {
  const method = (config.method ?? "get").toUpperCase();
  const path = new URL(config.url ?? "", "http://mock").pathname;

  for (const h of handlers) {
    if (h.method !== method) continue;
    const params = matchPath(h.path, path);
    if (!params) continue;

    await new Promise((r) => setTimeout(r, LATENCY_MS));
    const body =
      typeof config.data === "string" && config.data
        ? JSON.parse(config.data)
        : config.data;
    const respond = (status: number, data: unknown): AxiosResponse => ({
      data: structuredClone(data),
      status,
      statusText: String(status),
      headers: new AxiosHeaders(),
      config,
    });

    try {
      const data = h.handle({ params, query: config.params ?? {}, body });
      if (import.meta.env.DEV)
        console.debug(`[mock] ${method} ${path}`, {
          query: config.params,
          body,
          data,
        });
      return respond(200, data);
    } catch (e) {
      const status = e instanceof HttpError ? e.status : 500;
      const res = respond(status, {
        message: e instanceof Error ? e.message : "Mock error",
      });
      throw new AxiosError(res.data.message, String(status), config, null, res);
    }
  }

  // Never send a demo token to the real API: an unknown path there should fail locally, not 401 → logout
  const url = new URL(
    config.url ?? "",
    config.baseURL || window.location.origin,
  );
  const apiHost = env.apiBaseUrl
    ? new URL(env.apiBaseUrl).host
    : window.location.host;
  if (url.host === apiHost || url.host === window.location.host) {
    if (import.meta.env.DEV)
      console.warn(`[mock] no handler for ${method} ${path}`);
    const res: AxiosResponse = {
      data: { message: "No mock handler" },
      status: 404,
      statusText: "404",
      headers: new AxiosHeaders(),
      config,
    };
    throw new AxiosError("No mock handler", "404", config, null, res);
  }
  return realAdapter(config);
};
