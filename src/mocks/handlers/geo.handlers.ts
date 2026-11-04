import type { MockHandler } from "../utils";

export const geoHandlers: MockHandler[] = [
  {
    method: "POST",
    path: "/api/admin/users/shop-partners",
    handle: ({ body }: { body: Record<string, unknown> }) => {
      return {
        id: Date.now(),
        code: `PARTNER_${Date.now()}`,
        fullName: body.fullName || "Đối tác",
        phoneNumber: body.phoneNumber || "",
        email: body.email || null,
        audienceType: body.audienceType || "individual",
        status: "ACTIVE",
        message: "Tạo tài khoản đối tác thành công",
      };
    },
  },
  {
    method: "PUT",
    path: "/api/admin/users/:id",
    handle: ({
      params,
      body,
    }: {
      params: Record<string, string>;
      body: Record<string, unknown>;
    }) => {
      return {
        id: params.id,
        ...body,
        message: "Cập nhật tài khoản thành công",
      };
    },
  },
];
