import axios from "axios";
import { env } from "@/config/env";
import { getAccessToken, useAuthStore } from "@/features/auth/store/auth.store";
import { mockAdapter } from "./adapter";
import { DEMO_USERS, mockTokenFor, mockUserFromToken } from "./users";

/**
 * Imported first in main.tsx: eco-shared-ui creates its axios instance when its module loads,
 * so the default adapter must be swapped before that happens for its calls to hit the mocks too.
 */
if (env.useMock) {
  axios.defaults.adapter = mockAdapter;
  // No login screen in mock mode: start as the first demo account (also replaces a leftover real SSO token).
  // Switch accounts with the floating DemoAccountSwitcher.
  if (!mockUserFromToken(getAccessToken()))
    useAuthStore.getState().setToken(mockTokenFor(DEMO_USERS[0].userId));
}
