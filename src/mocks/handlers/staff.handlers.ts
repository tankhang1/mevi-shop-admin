import { API_ENDPOINTS } from "@/config/api-endpoints";
import type { Staff, StaffInput, StaffStatus } from "@/features/staff/types";
import { db } from "../db";
import { requireRoot } from "../scope";
import { HttpError, type MockHandler, paginate, uid } from "../utils";

const EP = API_ENDPOINTS.admin.staff;

const teamOf = (id: string) => db.dispatchTeams.find((t) => t.memberIds.includes(id));
const withShop = (s: Staff): Staff => {
  const team = teamOf(s.id);
  const fullName = s.fullName || s.name || "Nhân viên";
  const phoneNumber = s.phoneNumber || s.phone || "0900000000";
  return {
    ...s,
    fullName,
    name: fullName,
    phoneNumber,
    phone: phoneNumber,
    code: s.code ?? `U00000${s.id.replace(/\D/g, "") || "10"}`,
    teamId: team?.id ?? null,
    teamName: team?.name ?? null,
  };
};

/** A staff member belongs to at most one team: drop them from every other team, then add to `teamId` */
function setTeam(staff: Staff, teamId: string | null | undefined) {
  if (teamId === undefined) return;
  const target = teamId ? db.dispatchTeams.find((t) => t.id === teamId) : undefined;
  if (teamId && !target) throw new HttpError(400, "Không tìm thấy nhóm điều phối");
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
const findOwned = (id: string) => {
  requireRoot();
  const s = db.staff.find((x) => x.id === id);
  if (!s) throw new HttpError(404, "Không tìm thấy nhân viên");
  return s;
};

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
      requireRoot();
      const rows = db.staff
        .filter((s) => is(s.role, query.role) && is(s.status, query.status))
        .map(withShop);
      return { data: paginate(rows, query, (s) => `${s.name} ${s.phone} ${s.email}`) };
    },
  },
  {
    method: "PUT",
    path: `${EP.base}/:id`,
    handle: ({ params }) => {
      const s = findOwned(params.id);
      return { data: withShop(s) };
    },
  },
  {
    method: "PUT",
    path: "/api/admin/users/:id/status",
    handle: ({ params, body }: { params: Record<string, string>; body: { status: "active" | "inactive" } }) => {
      const s = findOwned(params.id);
      s.status = body.status === "inactive" ? "disabled" : "active";
      return { data: withShop(s) };
    },
  },
  {
    method: "POST",
    path: EP.base,
    handle: ({ body }: { body: StaffInput }) => {
      requireRoot();
      assertUnique(body.phone, body.email);
      const now = new Date().toISOString();
      const s: Staff = {
        id: uid("st"),
        name: body.name.trim(),
        phone: body.phone.trim(),
        email: (body.email || "").trim(),
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
