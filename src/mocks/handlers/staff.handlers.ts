import { API_ENDPOINTS } from "@/config/api-endpoints";
import type { Staff, StaffInput, StaffStatus } from "@/features/staff/types";
import { db } from "../db";
import { actor, assertOwns, requireShopAdmin, scoped } from "../scope";
import { HttpError, type MockHandler, paginate, uid } from "../utils";

const EP = API_ENDPOINTS.admin.staff;

const teamOf = (id: string) => db.dispatchTeams.find((t) => t.memberIds.includes(id));
const withShop = (s: Staff): Staff => {
  const team = teamOf(s.id);
  return { ...s, shopName: db.shops.find((x) => x.id === s.shopId)?.name, teamId: team?.id ?? null, teamName: team?.name ?? null };
};

/** A staff member belongs to at most one team: drop them from every other team, then add to `teamId` */
function setTeam(staff: Staff, teamId: string | null | undefined) {
  if (teamId === undefined) return;
  const target = teamId ? db.dispatchTeams.find((t) => t.id === teamId) : undefined;
  if (teamId && target?.shopId !== staff.shopId) throw new HttpError(400, "Nhóm điều phối không thuộc gian hàng");
  db.dispatchTeams.forEach((t) => {
    if (t.id === target?.id || !t.memberIds.includes(staff.id)) return;
    t.memberIds = t.memberIds.filter((id) => id !== staff.id);
    if (t.leaderId === staff.id) t.leaderId = null;
    t.nextMemberIndex = 0;
  });
  if (target && !target.memberIds.includes(staff.id)) target.memberIds.push(staff.id);
}

const profileOf = (b: Partial<StaffInput>) => ({
  dateOfBirth: b.dateOfBirth || null,
  gender: b.gender || null,
  idNumber: b.idNumber?.trim() || null,
  address: b.address?.trim() || null,
});
const findOwned = (id: string) => assertOwns(db.staff.find((x) => x.id === id), "Không tìm thấy nhân viên");

/** Shop admins add to their own shop; root's dispatch staff go to the first shop */
function resolveShopId() {
  const a = actor();
  if (a.shopId) return a.shopId;
  if (!db.shops[0]) throw new HttpError(400, "Chưa có gian hàng nào");
  return db.shops[0].id;
}

/** Phone and email each identify one login across the platform */
function assertUnique(phone?: string, email?: string, exceptId?: string) {
  const other = db.staff.filter((s) => s.id !== exceptId);
  if (phone && other.some((s) => s.phone === phone)) throw new HttpError(409, "Số điện thoại đã được dùng cho nhân viên khác");
  if (email && other.some((s) => s.email.toLowerCase() === email.toLowerCase()))
    throw new HttpError(409, "Email đã được dùng cho nhân viên khác");
}

export const staffHandlers: MockHandler[] = [
  {
    method: "GET",
    path: EP.base,
    handle: ({ query }) => {
      const is = (actual: string, wanted: unknown) => !wanted || wanted === "all" || wanted === actual;
      const rows = scoped(db.staff, query.shopId)
        .filter((s) => is(s.role, query.role) && is(s.status, query.status))
        .map(withShop);
      return { data: paginate(rows, query, (s) => `${s.name} ${s.phone} ${s.email}`) };
    },
  },
  {
    method: "POST",
    path: EP.base,
    handle: ({ body }: { body: StaffInput }) => {
      requireShopAdmin();
      const shopId = resolveShopId();
      assertUnique(body.phone, body.email);
      const now = new Date().toISOString();
      const s: Staff = {
        id: uid("st"),
        shopId,
        name: body.name.trim(),
        phone: body.phone.trim(),
        email: body.email.trim(),
        ...profileOf(body),
        // Nhân viên điều phối: handle orders and the customers on them
        role: "sales",
        permissions: ["orders", "customers"],
        // Admin sets the password, so the account is usable right away
        status: body.password ? "active" : "invited",
        invitedAt: now,
        lastActiveAt: null,
        createdAt: now,
      };
      db.staff.unshift(s);
      setTeam(s, body.teamId || null);
      return { data: withShop(s), message: `Đã gửi lời mời tới ${s.email}` };
    },
  },
  {
    method: "PATCH",
    path: `${EP.base}/:id`,
    handle: ({ params, body }: { params: Record<string, string>; body: Partial<StaffInput> & { status?: StaffStatus } }) => {
      const s = findOwned(params.id);
      assertUnique(body.phone, body.email, s.id);
      if (body.status === "active" && s.status === "invited")
        throw new HttpError(400, "Nhân viên cần tự kích hoạt tài khoản qua lời mời");
      // Moving staff between shops isn't supported — shopId is ignored on update
      const { name, phone, email, status } = body;
      Object.assign(
        s,
        Object.fromEntries(Object.entries({ name, phone, email, status }).filter(([, v]) => v !== undefined)),
      );
      // Status-only updates (khoá / mở khoá) don't carry the profile
      if (name !== undefined) Object.assign(s, profileOf(body));
      setTeam(s, body.teamId === undefined ? undefined : body.teamId || null);
      return { data: withShop(s) };
    },
  },
  {
    method: "DELETE",
    path: `${EP.base}/:id`,
    handle: ({ params }) => {
      findOwned(params.id);
      db.staff = db.staff.filter((s) => s.id !== params.id);
      return { data: null };
    },
  },
  {
    method: "POST",
    path: `${EP.base}/:id/resend-invite`,
    handle: ({ params }) => {
      const s = findOwned(params.id);
      if (s.status !== "invited") throw new HttpError(400, "Nhân viên đã kích hoạt tài khoản");
      s.invitedAt = new Date().toISOString();
      return { data: withShop(s) };
    },
  },
];
