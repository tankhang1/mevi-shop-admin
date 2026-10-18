import {
  AxiosError,
  AxiosHeaders,
  type AxiosAdapter,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
  getAdapter,
} from "axios";
import { agencyHandlers } from "./handlers/agency.handlers";
import { dashboardHandlers } from "./handlers/dashboard.handlers";
import { orderHandlers } from "./handlers/order.handlers";
import { productHandlers } from "./handlers/product.handlers";
import { HttpError, type MockHandler } from "./utils";

const handlers: MockHandler[] = [...dashboardHandlers, ...productHandlers, ...orderHandlers, ...agencyHandlers];

const LATENCY_MS = 350;
const realAdapter = getAdapter(["xhr", "fetch"]);

function matchPath(pattern: string, path: string) {
  const keys: string[] = [];
  const re = new RegExp(`^${pattern.replace(/:(\w+)/g, (_, k) => (keys.push(k), "([^/]+)"))}$`);
  const m = path.match(re);
  return m ? Object.fromEntries(keys.map((k, i) => [k, decodeURIComponent(m[i + 1])])) : null;
}

/**
 * Answers requests that match a handler in ./handlers with dummy data;
 * anything else (e.g. /auth/me) goes to the real network.
 */
export const mockAdapter: AxiosAdapter = async (config: InternalAxiosRequestConfig) => {
  const method = (config.method ?? "get").toUpperCase();
  const path = new URL(config.url ?? "", "http://mock").pathname;

  for (const h of handlers) {
    if (h.method !== method) continue;
    const params = matchPath(h.path, path);
    if (!params) continue;

    await new Promise((r) => setTimeout(r, LATENCY_MS));
    const body = typeof config.data === "string" && config.data ? JSON.parse(config.data) : config.data;
    const respond = (status: number, data: unknown): AxiosResponse => ({
      data: structuredClone(data),
      status,
      statusText: String(status),
      headers: new AxiosHeaders(),
      config,
    });

    try {
      const data = h.handle({ params, query: config.params ?? {}, body });
      if (import.meta.env.DEV) console.debug(`[mock] ${method} ${path}`, { query: config.params, body, data });
      return respond(200, data);
    } catch (e) {
      const status = e instanceof HttpError ? e.status : 500;
      const res = respond(status, { message: e instanceof Error ? e.message : "Mock error" });
      throw new AxiosError(res.data.message, String(status), config, null, res);
    }
  }

  return realAdapter(config);
};
