import { isRootRole } from "@/features/auth/roles";
import { getAccessToken } from "@/features/auth/store/auth.store";
import { mockUserFromToken } from "./users";
import { HttpError } from "./utils";

/**
 * Who is calling — what the real backend derives from the token.
 * Root sees everything; a shop admin is pinned to `shopId`.
 */
export function actor() {
  const user = mockUserFromToken(getAccessToken());
  if (!user) throw new HttpError(401, "Phiên đăng nhập không hợp lệ");
  const isRoot = isRootRole(user.roles ?? []);
  if (!isRoot && !user.shopId) throw new HttpError(403, "Tài khoản chưa được gán gian hàng");
  // Staff accounts are pinned to their own assigned orders on top of the shop
  return { user, isRoot, shopId: isRoot ? undefined : user.shopId, staffId: isRoot ? undefined : user.staffId };
}

export function requireRoot() {
  const a = actor();
  if (!a.isRoot) throw new HttpError(403, "Chỉ quản trị Mevi mới có quyền thực hiện");
  return a;
}

/** Rows the caller may see: root → all (optionally narrowed by ?shopId), shop admin → own shop only */
export function scoped<T extends { shopId: string }>(rows: T[], requestedShopId?: unknown) {
  const { shopId } = actor();
  const only = shopId ?? (requestedShopId && requestedShopId !== "all" ? String(requestedShopId) : undefined);
  return only ? rows.filter((r) => r.shopId === only) : rows;
}

/** 404 (not 403) for another shop's row, so ids don't leak */
export function assertOwns<T extends { shopId: string }>(row: T | undefined, notFound: string): T {
  const { shopId } = actor();
  if (!row || (shopId && row.shopId !== shopId)) throw new HttpError(404, notFound);
  return row;
}

export function requireShopAdmin() {
  const a = actor();
  if (a.staffId) throw new HttpError(403, "Chỉ chủ gian hàng mới có quyền thực hiện");
  return a;
}
