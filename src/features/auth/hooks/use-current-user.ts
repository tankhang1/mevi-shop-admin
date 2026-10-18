import { useQuery } from "@tanstack/react-query";
import { authApi } from "../api/auth.api";

export const authKeys = {
  me: ["auth", "me"] as const,
};

export function useCurrentUser() {
  const query = useQuery({ queryKey: authKeys.me, queryFn: authApi.getMe, staleTime: 5 * 60_000 });
  const roles = [...new Set([...(query.data?.roles ?? []), ...[query.data?.role ?? []].flat()])];
  return { ...query, roles };
}
