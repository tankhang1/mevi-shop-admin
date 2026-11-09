import {
  Award,
  BadgeCheck,
  Clock,
  FileCheck,
  Heart,
  Leaf,
  MapPin,
  Package,
  Scale,
  ShieldCheck,
  Sparkles,
  Store,
  Truck,
  Users,
  type LucideIcon,
} from "lucide-react";

export const HIGHLIGHT_ICON_MAP: Record<
  string,
  { label: string; icon: LucideIcon }
> = {
  ShieldCheck: { label: "Khiên bảo vệ (Nguồn gốc)", icon: ShieldCheck },
  Package: { label: "Hộp hàng (Quy cách đóng gói)", icon: Package },
  Truck: { label: "Xe giao hàng (Vận chuyển)", icon: Truck },
  Store: { label: "Cửa hàng (Đại lý địa phương)", icon: Store },
  Leaf: { label: "Chiếc lá (Nông sản hữu cơ)", icon: Leaf },
  Award: { label: "Huy chương (Chứng chỉ chất lượng)", icon: Award },
  Heart: { label: "Trái tim (An tâm, tận tâm)", icon: Heart },
  BadgeCheck: { label: "Huy hiệu kiểm định", icon: BadgeCheck },
  MapPin: { label: "Vùng trồng (Xuất xứ)", icon: MapPin },
  Clock: { label: "Đồng hồ (Giao nhanh)", icon: Clock },
  Sparkles: { label: "Ngôi sao nổi bật", icon: Sparkles },
  Users: { label: "Hợp tác xã / Nông hộ", icon: Users },
  FileCheck: { label: "Hồ sơ kiểm nghiệm", icon: FileCheck },
  Scale: { label: "Minh bạch chuẩn xác", icon: Scale },
};

export function createStorefrontId(prefix: string): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
  }
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

