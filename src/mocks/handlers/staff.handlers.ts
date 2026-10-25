import { API_ENDPOINTS } from "@/config/api-endpoints";
import type { Staff, StaffInput, StaffStatus } from "@/features/staff/types";
import { db } from "../db";
import { actor, assertOwns, requireShopAdmin, scoped } from "../scope";
import { HttpError, type MockHandler, paginate, uid } from "../utils";

const EP = API_ENDPOINTS.admin.staff;

const withShop = (s: Staff): Staff => ({ ...s, shopName: db.shops.find((x) => x.id === s.shopId)?.name });
const findOwned = (id: string) => assertOwns(db.staff.find((x) => x.id === id), "Không tìm thấy nhân viên");

/** Shop admins always add to their own shop; root must name an existing shop */
function resolveShopId(requested: string | undefined) {
  const a = actor();
  if (a.shopId) return a.shopId;
  if (!requested || !db.shops.some((s) => s.id === requested)) throw new HttpError(400, "Vui lòng chọn gian hàng");
  return requested;
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
      const shopId = resolveShopId(body.shopId);
      assertUnique(body.phone, body.email);
      const now = new Date().toISOString();
      const s: Staff = {
        id: uid("st"),
        shopId,
        name: body.name.trim(),
        phone: body.phone.trim(),
        email: body.email.trim(),
        role: body.role,
        permissions: body.permissions,
        status: "invited",
        invitedAt: now,
        lastActiveAt: null,
        createdAt: now,
      };
      db.staff.unshift(s);
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
      const { name, phone, email, role, permissions, status } = body;
      Object.assign(
        s,
        Object.fromEntries(Object.entries({ name, phone, email, role, permissions, status }).filter(([, v]) => v !== undefined)),
      );
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
