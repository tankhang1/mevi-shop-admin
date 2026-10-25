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
    productGroups: t.productGroupIds.flatMap((id) => {
      const g = db.productGroups.find((x) => x.id === id);
      return g ? [{ id: g.id, name: g.name }] : [];
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

/** Members and product groups must be the shop's own; a group may belong to only one team */
function validate(shopId: string, body: Partial<DispatchTeamInput>, current?: DispatchTeam) {
  const memberIds = body.memberIds ?? current?.memberIds ?? [];
  if (memberIds.some((id) => db.staff.find((s) => s.id === id)?.shopId !== shopId))
    throw new HttpError(400, "Thành viên phải là nhân viên của gian hàng");
  const leaderId = body.leaderId === undefined ? current?.leaderId : body.leaderId;
  if (leaderId && !memberIds.includes(leaderId)) throw new HttpError(400, "Trưởng nhóm phải là thành viên của nhóm");
  for (const gid of body.productGroupIds ?? []) {
    const g = db.productGroups.find((x) => x.id === gid);
    if (g?.shopId !== shopId) throw new HttpError(400, "Nhóm sản phẩm không thuộc gian hàng");
    const owner = db.dispatchTeams.find((t) => t.id !== current?.id && t.productGroupIds.includes(gid));
    if (owner) throw new HttpError(409, `Nhóm sản phẩm "${g.name}" đã được gán cho "${owner.name}"`);
  }
}

/** Active team owning the product group of the order's first grouped item */
export function teamForOrder(o: Pick<Order, "shopId" | "items">) {
  for (const it of o.items ?? []) {
    const groupIds = db.productGroups.filter((g) => g.productIds.includes(it.productId)).map((g) => g.id);
    const team = db.dispatchTeams.find(
      (t) => t.active && t.shopId === o.shopId && t.productGroupIds.some((g) => groupIds.includes(g)),
    );
    if (team) return team;
  }
  return undefined;
}

/** Next active member in turn; skips locked accounts */
export function nextMember(t: DispatchTeam) {
  const n = t.memberIds.length;
  for (let k = 0; k < n; k++) {
    const i = ((t.nextMemberIndex ?? 0) + k) % n;
    const s = db.staff.find((x) => x.id === t.memberIds[i]);
    if (s && s.status !== "disabled") {
      t.nextMemberIndex = (i + 1) % n;
      return s.id;
    }
  }
  return null;
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
      for (const o of scoped(db.orders).sort((a, b) => a.createdAt.localeCompare(b.createdAt))) {
        if (o.teamId || isFinalOrderStatus(o.status)) continue;
        const team = teamForOrder(o);
        if (team) {
          o.teamId = team.id;
          o.assigneeId = nextMember(team);
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
        productGroupIds: body.productGroupIds,
        nextMemberIndex: 0,
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
      const { name, description, leaderId, memberIds, productGroupIds, active } = body;
      Object.assign(
        t,
        Object.fromEntries(
          Object.entries({ name, description, leaderId, memberIds, productGroupIds, active }).filter(([, v]) => v !== undefined),
        ),
      );
      if (memberIds) t.nextMemberIndex = 0;
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
