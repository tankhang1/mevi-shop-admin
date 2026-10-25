import { API_ENDPOINTS } from "@/config/api-endpoints";
import type { DispatchTeam, DispatchTeamInput, DispatchTeamRow } from "@/features/dispatch-team/types";
import { isFinalOrderStatus } from "@/features/order/constants";
import type { Order } from "@/features/order/types";
import { db } from "../db";
import { actor, assertOwns, scoped } from "../scope";
import { HttpError, type MockHandler, paginate, uid } from "../utils";

const EP = API_ENDPOINTS.admin.dispatchTeams;

const findOwned = (id: string) => assertOwns(db.dispatchTeams.find((t) => t.id === id), "Không tìm thấy nhóm điều phối");

function toRow(t: DispatchTeam): DispatchTeamRow {
  return {
    ...t,
    shopName: db.shops.find((s) => s.id === t.shopId)?.name,
    members: t.memberIds.flatMap((id) => {
      const s = db.staff.find((x) => x.id === id);
      return s ? [{ id: s.id, name: s.name }] : [];
    }),
    openOrders: db.orders.filter((o) => o.teamId === t.id && !isFinalOrderStatus(o.status)).length,
  };
}

/** Shop admins always write into their own shop; root must name an existing shop */
function resolveShopId(requested: string | undefined) {
  const a = actor();
  if (a.shopId) return a.shopId;
  if (!requested || !db.shops.some((s) => s.id === requested)) throw new HttpError(400, "Vui lòng chọn gian hàng");
  return requested;
}

/** Members must be the shop's own staff, and the lead one of them */
function validate(shopId: string, body: Partial<DispatchTeamInput>, current?: DispatchTeam) {
  const memberIds = body.memberIds ?? current?.memberIds ?? [];
  if (memberIds.some((id) => db.staff.find((s) => s.id === id)?.shopId !== shopId))
    throw new HttpError(400, "Thành viên phải là nhân viên của gian hàng");
  const leaderId = body.leaderId === undefined ? current?.leaderId : body.leaderId;
  if (leaderId && !memberIds.includes(leaderId)) throw new HttpError(400, "Trưởng nhóm phải là thành viên của nhóm");
}

/** First active team of the order's shop whose area appears in the address */
export function matchTeam(o: Pick<Order, "shopId" | "address">) {
  const addr = o.address.toLowerCase();
  return db.dispatchTeams.find(
    (t) => t.active && t.shopId === o.shopId && t.regions.some((r) => addr.includes(r.toLowerCase())),
  );
}

export const dispatchTeamHandlers: MockHandler[] = [
  {
    method: "GET",
    path: EP.base,
    handle: ({ query }) => ({ data: paginate(scoped(db.dispatchTeams, query.shopId).map(toRow), query, (t) => t.name) }),
  },
  {
    method: "POST",
    path: EP.autoAssign,
    handle: () => {
      let assigned = 0;
      let unmatched = 0;
      for (const o of scoped(db.orders)) {
        if (o.teamId || isFinalOrderStatus(o.status)) continue;
        const team = matchTeam(o);
        if (team) {
          o.teamId = team.id;
          assigned++;
        } else unmatched++;
      }
      return { data: { assigned, unmatched } };
    },
  },
  {
    method: "POST",
    path: EP.base,
    handle: ({ body }: { body: DispatchTeamInput }) => {
      const shopId = resolveShopId(body.shopId);
      validate(shopId, body);
      const t: DispatchTeam = {
        id: uid("t"),
        shopId,
        name: body.name.trim(),
        description: body.description?.trim() || undefined,
        leaderId: body.leaderId || null,
        memberIds: body.memberIds,
        regions: body.regions,
        active: true,
        createdAt: new Date().toISOString(),
      };
      db.dispatchTeams.unshift(t);
      return { data: t };
    },
  },
  {
    method: "PATCH",
    path: `${EP.base}/:id`,
    handle: ({ params, body }: { params: Record<string, string>; body: Partial<DispatchTeamInput> }) => {
      const t = findOwned(params.id);
      validate(t.shopId, body, t);
      const { name, description, leaderId, memberIds, regions, active } = body;
      Object.assign(
        t,
        Object.fromEntries(
          Object.entries({ name, description, leaderId, memberIds, regions, active }).filter(([, v]) => v !== undefined),
        ),
      );
      // People who left the team stop owning its orders
      db.orders.forEach((o) => {
        if (o.teamId === t.id && o.assigneeId && !t.memberIds.includes(o.assigneeId)) o.assigneeId = null;
      });
      return { data: t };
    },
  },
  {
    method: "DELETE",
    path: `${EP.base}/:id`,
    handle: ({ params }) => {
      findOwned(params.id);
      db.dispatchTeams = db.dispatchTeams.filter((t) => t.id !== params.id);
      // Orders go back to the unassigned pool
      db.orders.forEach((o) => {
        if (o.teamId === params.id) {
          o.teamId = null;
          o.assigneeId = null;
        }
      });
      return { data: null };
    },
  },
];
