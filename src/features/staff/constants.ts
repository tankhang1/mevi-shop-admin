import type { StaffPermission, StaffRole, StaffStatus } from "./types";

export const STAFF_ROLE: Record<StaffRole, { label: string; description: string; permissions: StaffPermission[] }> = {
  manager: {
    label: "Quản lý",
    description: "Toàn quyền vận hành gian hàng, trừ quản lý nhân viên",
    permissions: ["products", "inventory", "orders", "customers", "reviews", "shop"],
  },
  sales: {
    label: "Bán hàng",
    description: "Xử lý đơn, chăm sóc khách và trả lời đánh giá",
    permissions: ["orders", "customers", "reviews"],
  },
  warehouse: {
    label: "Kho",
    description: "Nhập xuất kho và chuẩn bị đơn hàng",
    permissions: ["inventory", "orders"],
  },
};

export const STAFF_PERMISSION: Record<StaffPermission, { label: string; description: string }> = {
  products: { label: "Sản phẩm", description: "Thêm, sửa sản phẩm và nhóm sản phẩm" },
  inventory: { label: "Kho hàng", description: "Nhập / xuất / kiểm kê tồn kho" },
  orders: { label: "Đơn hàng", description: "Xem và cập nhật trạng thái đơn" },
  customers: { label: "Khách hàng", description: "Xem, sửa thông tin và ghi chú khách" },
  reviews: { label: "Đánh giá", description: "Trả lời và ẩn đánh giá" },
  shop: { label: "Thông tin gian hàng", description: "Sửa hồ sơ, sản phẩm kinh doanh" },
};

export const STAFF_STATUS: Record<StaffStatus, { label: string; className: string }> = {
  invited: { label: "Chờ kích hoạt", className: "bg-amber-100 text-amber-800" },
  active: { label: "Hoạt động", className: "bg-emerald-100 text-emerald-800" },
  disabled: { label: "Tạm khoá", className: "bg-slate-200 text-slate-700" },
};
