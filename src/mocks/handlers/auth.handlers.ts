import { API_ENDPOINTS } from "@/config/api-endpoints";
import { getAccessToken } from "@/features/auth/store/auth.store";
import { DEMO_WORKSPACE, mockUserFromToken } from "../users";
import { HttpError, type MockHandler } from "../utils";

function currentUser() {
  const user = mockUserFromToken(getAccessToken());
  if (!user) throw new HttpError(401, "Phiên đăng nhập không hợp lệ");
  return user;
}

/**
 * Also answers eco-shared-ui's own client (its layout loads the user + workspace from the real API),
 * so a demo token never reaches the real backend and triggers its refresh → external logout redirect.
 */
export const authHandlers: MockHandler[] = [
  {
    method: "GET",
    path: API_ENDPOINTS.auth.me,
    handle: () => {
      const { userId, username, name, email, phoneNumber, roles } =
        currentUser();
      return { userId, username, name, email, phoneNumber, roles };
    },
  },
  {
    method: "POST",
    path: "/auth/refresh",
    handle: () => (currentUser(), { access_token: getAccessToken() }),
  },
  { method: "POST", path: "/auth/logout", handle: () => null },
  {
    method: "GET",
    path: "/api/center/workspaces",
    handle: () => ({
      content: [DEMO_WORKSPACE],
      page: 0,
      size: 20,
      totalElements: 1,
      totalPages: 1,
      first: true,
      last: true,
    }),
  },
  {
    method: "GET",
    path: "/api/center/workspaces/current",
    handle: () => DEMO_WORKSPACE,
  },
];
