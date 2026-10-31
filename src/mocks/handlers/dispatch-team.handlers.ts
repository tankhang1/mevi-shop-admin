import { API_ENDPOINTS } from "@/config/api-endpoints";
import type { DispatchTeam, DispatchTeamInput, DispatchTeamRow } from "@/features/dispatch-team/types";
import { isFinalOrderStatus } from "@/features/order/constants";
import type { Order } from "@/features/order/types";
import { db } from "../db";
import { requireRoot } from "../scope";
import { HttpError, type MockHandler, paginate, uid } from "../utils";

const EP = API_ENDPOINTS.admin.dispatchTeams;

const findOwned = (id: string) => {
  const t = db.dispatchTeams.find((x) => x.id === id);
  if (!t) throw new HttpError(404, "Không tìm thấy nhóm điều phối");
  return t;
};

function toRow(t: DispatchTeam): DispatchTeamRow {
  return {
    ...t,
    members: t.memberIds.flatMap((id) => {
      const s = db.staff.find((x) => x.id === id);
      return s ? [{ id: s.id, name: s.name }] : [];
    }),
    openOrders: db.orders.filter((o) => o.teamId === t.id && !isFinalOrderStatus(o.status)).length,
  };
}

/** Members must be existing staff; a danh mục may belong to only one team */
function validate(body: Partial<DispatchTeamInput>, current?: DispatchTeam) {
  const memberIds = body.memberIds ?? current?.memberIds ?? [];
  if (memberIds.some((id) => !db.staff.some((s) => s.id === id))) throw new HttpError(400, "Thành viên không hợp lệ");
  const leaderId = body.leaderId === undefined ? current?.leaderId : body.leaderId;
  if (leaderId && !memberIds.includes(leaderId)) throw new HttpError(400, "Trưởng nhóm phải là thành viên của nhóm");
  for (const c of body.categories ?? []) {
    const owner = db.dispatchTeams.find((t) => t.id !== current?.id && t.categories.includes(c));
    if (owner) throw new HttpError(409, `Danh mục "${c}" đã được gán cho "${owner.name}"`);
  }
}

/** Each staff member is in at most one team — joining `team` removes them from the others */
function detachFromOtherTeams(team: DispatchTeam) {
  db.dispatchTeams.forEach((t) => {
    if (t.id === team.id) return;
    const before = t.memberIds.length;
    t.memberIds = t.memberIds.filter((id) => !team.memberIds.includes(id));
    if (t.leaderId && team.memberIds.includes(t.leaderId)) t.leaderId = null;
    if (t.memberIds.length !== before) t.nextMemberIndex = 0;
  });
}

/** Active team owning the danh mục of the order's first item that has one */
export function teamForOrder(o: Pick<Order, "items">) {
  for (const it of o.items ?? []) {
    const category = db.products.find((p) => p.id === it.productId)?.category;
    const team = category && db.dispatchTeams.find((t) => t.active && t.categories.includes(category));
    if (team) return team;
  }
  return undefined;
}

/** Route every unassigned open order to its team, members in turn — what the backend does when an order is placed */
export function autoAssignOrders() {
  let assigned = 0;
  let unmatched = 0;
  for (const o of [...db.orders].sort((a, b) => a.createdAt.localeCompare(b.createdAt))) {
    if (o.teamId || isFinalOrderStatus(o.status)) continue;
    const team = teamForOrder(o);
    if (team) {
      o.teamId = team.id;
      o.assigneeId = nextMember(team);
      assigned++;
    } else unmatched++;
  }
  return { assigned, unmatched };
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
    handle: ({ query }) => ({ data: paginate(db.dispatchTeams.map(toRow), query, (t) => t.name) }),
  },
  {
    method: "POST",
    path: EP.autoAssign,
    handle: () => {
      requireRoot();
      return { data: autoAssignOrders() };
    },
  },
  {
    method: "POST",
    path: EP.base,
    handle: ({ body }: { body: DispatchTeamInput }) => {
      requireRoot();
      validate(body);
      const t: DispatchTeam = {
        id: uid("t"),
        name: body.name.trim(),
        description: body.description?.trim() || undefined,
        leaderId: body.leaderId || null,
        memberIds: body.memberIds,
        categories: body.categories,
        nextMemberIndex: 0,
        active: true,
        createdAt: new Date().toISOString(),
      };
      db.dispatchTeams.unshift(t);
      detachFromOtherTeams(t);
      return { data: t };
    },
  },
  {
    method: "PATCH",
    path: `${EP.base}/:id`,
    handle: ({ params, body }: { params: Record<string, string>; body: Partial<DispatchTeamInput> }) => {
      requireRoot();
      const t = findOwned(params.id);
      validate(body, t);
      const { name, description, leaderId, memberIds, categories, active } = body;
      Object.assign(
        t,
        Object.fromEntries(
          Object.entries({ name, description, leaderId, memberIds, categories, active }).filter(([, v]) => v !== undefined),
        ),
      );
      if (memberIds) {
        t.nextMemberIndex = 0;
        detachFromOtherTeams(t);
      }
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
      requireRoot();
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
