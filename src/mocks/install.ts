import axios from "axios";
import { env } from "@/config/env";
import { getAccessToken, useAuthStore } from "@/features/auth/store/auth.store";
import { mockAdapter } from "./adapter";
import { mockUserFromToken } from "./users";

/**
 * Imported first in main.tsx: eco-shared-ui creates its axios instance when its module loads,
 * so the default adapter must be swapped before that happens for its calls to hit the mocks too.
 */
if (env.useMock) axios.defaults.adapter = mockAdapter;

// Login always goes through real SSO; a leftover demo token would hit the real API — drop it so AuthWrapper starts SSO
if (mockUserFromToken(getAccessToken())) useAuthStore.getState().clear();
