import { create } from "zustand";

/** Same sessionStorage key eco-shared-ui reads, so its layout sends the token too */
const TOKEN_KEY = "accessToken";

interface AuthState {
  token: string | null;
  setToken: (token: string) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  token: sessionStorage.getItem(TOKEN_KEY),
  setToken: (token) => {
    sessionStorage.setItem(TOKEN_KEY, token);
    set({ token });
  },
  clear: () => {
    sessionStorage.removeItem(TOKEN_KEY);
    set({ token: null });
  },
}));

/** Non-React access (axios interceptor, AuthWrapper) */
export const getAccessToken = () => useAuthStore.getState().token;
