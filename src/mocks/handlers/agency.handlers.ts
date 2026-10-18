import { API_ENDPOINTS } from "@/config/api-endpoints";
import type { Agency, AgencyInput } from "@/features/agency/types";
import { db } from "../db";
import { HttpError, type MockHandler, paginate, uid } from "../utils";

const BASE = API_ENDPOINTS.admin.agencies.base;

export const agencyHandlers: MockHandler[] = [
  {
    method: "GET",
    path: BASE,
    handle: ({ query }) => ({
      data: paginate(db.agencies, query, (a) => `${a.name} ${a.slug}`),
    }),
  },
  {
    method: "POST",
    path: BASE,
    handle: ({ body }: { body: AgencyInput }) => {
      if (db.agencies.some((a) => a.slug === body.slug))
        throw new HttpError(409, "Slug đã tồn tại");
      const agency: Agency = {
        ...body,
        id: uid("a"),
        active: true,
        createdAt: new Date().toISOString(),
      };
      db.agencies.unshift(agency);
      return { data: agency };
    },
  },
  {
    method: "GET",
    path: `${BASE}/:id`,
    handle: ({ params }) => {
      const a = db.agencies.find((x) => x.id === params.id);
      if (!a) throw new HttpError(404, "Không tìm thấy đại lý");
      return { data: a };
    },
  },
  {
    method: "PATCH",
    path: `${BASE}/:id`,
    handle: ({
      params,
      body,
    }: {
      params: Record<string, string>;
      body: Partial<Agency>;
    }) => {
      const a = db.agencies.find((x) => x.id === params.id);
      if (!a) throw new HttpError(404, "Không tìm thấy đại lý");
      if (
        body.slug &&
        db.agencies.some((x) => x.slug === body.slug && x.id !== a.id)
      ) {
        throw new HttpError(409, "Slug đã tồn tại");
      }
      Object.assign(a, body);
      return { data: a };
    },
  },
  {
    method: "DELETE",
    path: `${BASE}/:id`,
    handle: ({ params }) => {
      const i = db.agencies.findIndex((x) => x.id === params.id);
      if (i < 0) throw new HttpError(404, "Không tìm thấy đại lý");
      db.agencies.splice(i, 1);
      // Orders stay in history but lose the referral link
      db.orders.forEach((o) => {
        if (o.agencyId === params.id) o.agencyId = undefined;
      });
      return { data: null };
    },
  },
];
