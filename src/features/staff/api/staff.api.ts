import { API_ENDPOINTS } from "@/config/api-endpoints";
import { realApiClient } from "@/lib/axios";
import {
  cleanFilters,
  fromSpringPage,
  toSpringPageParams,
} from "@/lib/pagination";
import type { ApiResponse, Paginated, SpringPage } from "@/types/api";
import type { Staff, StaffInput, StaffListParams, StaffStatus } from "../types";

const EP = API_ENDPOINTS.admin.staff;

const unwrap = <T>(data: unknown): T => {
  if (
    data &&
    typeof data === "object" &&
    "data" in data &&
    (data as { data: unknown }).data !== undefined
  ) {
    return (data as { data: T }).data;
  }
  return data as T;
};

const mapRoleAccountToStaff = (item: Record<string, unknown>): Staff => {
  const statusStr = String(item.status ?? "").toLowerCase();
  const mappedStatus: StaffStatus =
    statusStr === "active"
      ? "active"
      : statusStr === "inactive" || statusStr === "disabled"
        ? "inactive"
        : (statusStr as StaffStatus) || "active";

  const fullName = String(item.fullName || item.name || "");
  const phone = String(item.phoneNumber || item.phone || "");

  return {
    id: String(item.id ?? ""),
    name: fullName || "Nhân viên",
    fullName,
    phone,
    phoneNumber: phone,
    email: String(item.email || ""),
    code: item.code ? String(item.code) : undefined,
    status: mappedStatus,
    mustChangePassword: Boolean(item.mustChangePassword),
    lastLoginAt: item.lastLoginAt ? String(item.lastLoginAt) : null,
    createdAt: String(item.createdAt || new Date().toISOString()),
    role: "sales",
    permissions: [],
    invitedAt: String(item.createdAt || new Date().toISOString()),
    teamId: item.teamId ? String(item.teamId) : null,
    teamName: item.teamName ? String(item.teamName) : null,
  };
};

export const staffApi = {
  /** Lấy danh sách nhân viên điều phối (BE notice 2026-11-03) */
  list: async (params?: StaffListParams) => {
    const pageParams = params
      ? toSpringPageParams(cleanFilters(params as Record<string, unknown>))
      : undefined;
    const res = await realApiClient.get<
      | SpringPage<Record<string, unknown>>
      | ApiResponse<Paginated<Record<string, unknown>>>
      | Paginated<Record<string, unknown>>
    >(EP.base, {
      params: pageParams,
    });
    const raw = unwrap<
      SpringPage<Record<string, unknown>> | Paginated<Record<string, unknown>>
    >(res.data);
    if ("content" in raw && Array.isArray(raw.content)) {
      const pageData = fromSpringPage(
        raw as SpringPage<Record<string, unknown>>,
      );
      return {
        items: (pageData?.items ?? []).map(mapRoleAccountToStaff),
        page: pageData?.page ?? 1,
        size: pageData?.size ?? 10,
        total: pageData?.total ?? 0,
      };
    }
    if ("items" in raw && Array.isArray(raw.items)) {
      return {
        ...raw,
        items: raw.items.map(mapRoleAccountToStaff),
      };
    }
    return { items: [], page: 1, size: 10, total: 0 };
  },

  /** Tạo tài khoản nhân viên điều phối mới (RegistrationProfileRequest) */
  create: async (data: StaffInput) => {
    let birthYear: number | undefined = undefined;
    if (data.dateOfBirth) {
      const year = new Date(data.dateOfBirth).getFullYear();
      if (!Number.isNaN(year) && year >= 1900 && year <= 2100) {
        birthYear = year;
      }
    }

    const payload = {
      fullName: data.fullName || data.name,
      phoneNumber: data.phoneNumber || data.phone,
      email: data.email || undefined,
      password: data.password || undefined,
      audienceType: data.audienceType || "individual",
      registrationTarget: data.registrationTarget || "shop_staff",
      birthYear,
      operatingArea: data.address || undefined,
    };

    const res = await realApiClient.post<unknown>(EP.base, payload);
    const result = unwrap<Record<string, unknown>>(res.data);
    return mapRoleAccountToStaff(result);
  },

  /** Gán role MEVI_SHOP_STAFF cho tài khoản có sẵn */
  assignRole: async (userId: string | number) => {
    await realApiClient.put(EP.detail(userId));
  },

  /** Gỡ role MEVI_SHOP_STAFF khỏi tài khoản */
  removeRole: async (userId: string | number) => {
    await realApiClient.delete(EP.detail(userId));
  },

  /** Đổi trạng thái hoạt động tài khoản (active / inactive) */
  updateStatus: async (
    userId: string | number,
    status: "active" | "inactive",
  ) => {
    await realApiClient.put(EP.status(userId), { status });
  },

  /** Cập nhật thông tin hoặc trạng thái tài khoản nhân viên */
  update: async (
    id: string | number,
    data: Partial<StaffInput> & { status?: StaffStatus },
  ) => {
    let mappedStatus: "active" | "inactive" | undefined = undefined;
    if (data.status) {
      mappedStatus =
        data.status === "disabled" || data.status === "inactive"
          ? "inactive"
          : "active";
      await realApiClient.put(EP.status(id), { status: mappedStatus });
      // Nếu chỉ cập nhật trạng thái (tạm khoá / mở khoá), hoàn thành ngay
      if (Object.keys(data).length === 1) {
        return { id: String(id), status: mappedStatus } as unknown as Staff;
      }
    }

    const profileData = { ...data };
    delete profileData.status;
    if (Object.keys(profileData).length > 0) {
      let birthYear: number | undefined = undefined;
      if (profileData.dateOfBirth) {
        const year = new Date(profileData.dateOfBirth).getFullYear();
        if (!Number.isNaN(year) && year >= 1900 && year <= 2100) {
          birthYear = year;
        }
      }
      const userPayload = {
        fullName: profileData.fullName || profileData.name,
        email: profileData.email || undefined,
        birthYear,
        operatingArea: profileData.address || undefined,
        audienceType: profileData.audienceType || "individual",
        password: profileData.password || undefined,
      };
      const res = await realApiClient.put(EP.user(id), userPayload);
      const updated = unwrap<Record<string, unknown>>(res.data);
      return mapRoleAccountToStaff(updated);
    }

    return {
      id: String(id),
      status: mappedStatus || "active",
    } as unknown as Staff;
  },

  remove: async (id: string | number) => {
    await realApiClient.delete(EP.detail(id));
  },

  resendInvite: async (id: string | number) => {
    const res = await realApiClient.post<Staff | ApiResponse<Staff>>(
      EP.resendInvite(id),
    );
    return unwrap<Staff>(res.data);
  },
};
