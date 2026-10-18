import type { AuthMe } from "@/features/auth/types";

/** Demo accounts for mock mode — pick one on the login page instead of going through SSO */
/** `shopId` is mock-only: the real backend resolves a shop admin's shop from the token */
export const DEMO_USERS: (AuthMe & { title: string; shopId?: string })[] = [
  {
    userId: "u-admin",
    username: "admin",
    name: "Nguyễn Quản Trị",
    email: "admin@mevi.vn",
    phoneNumber: "0909000001",
    roles: ["MEVI_SUPER_ADMIN"],
    title: "Quản trị viên",
  },
  {
    userId: "u-shop",
    username: "cuahang",
    name: "Lê Chủ Shop",
    email: "shop@mevi.vn",
    phoneNumber: "0909000003",
    roles: ["MEVI_SHOP_ADMIN"],
    title: "Chủ gian hàng · Đặc sản Miền Tây",
    shopId: "s1",
  },
  {
    userId: "u-ops",
    username: "vanhanh",
    name: "Trần Vận Hành",
    email: "vanhanh@mevi.vn",
    phoneNumber: "0909000002",
    roles: ["MEVI_ADMIN"],
    title: "Nhân viên vận hành",
  },
];

const PREFIX = "mock:";
export const mockTokenFor = (userId: string) => `${PREFIX}${userId}`;
export const mockUserFromToken = (token: string | null) =>
  token?.startsWith(PREFIX)
    ? DEMO_USERS.find((u) => u.userId === token.slice(PREFIX.length))
    : undefined;

/** Demo workspace the shared layout header shows in mock mode */
export const DEMO_WORKSPACE = {
  id: 1,
  displayOrder: 1,
  organizationType: { id: 1, code: "COOP", name: "Hợp tác xã", type: "COOP" },
  code: "MEVI-DEMO",
  name: "Trạm xanh MEVI (demo)",
  brandName: "Trạm xanh MEVI",
  taxCode: null,
  taxAuthority: null,
  taxAddress: null,
  issueDate: null,
  businessLines: null,
  totalAcreage: null,
  mainCrop: null,
  representative: null,
  owner: {
    id: 1,
    code: "OWNER",
    fullName: "Trạm xanh MEVI",
    email: "admin@mevi.vn",
    phoneNumber: null,
  },
  foundedDate: null,
  website: null,
  province: "Lâm Đồng",
  district: null,
  ward: null,
  address: null,
  latitude: null,
  longitude: null,
  imageUrl: null,
  description: null,
  status: "active",
  metadataJson: null,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  featureProfile: null,
};
