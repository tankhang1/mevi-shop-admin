import type { Agency } from "@/features/agency/types";
import type { Order, OrderStatus } from "@/features/order/types";
import type { Product } from "@/features/product/types";
import { daysAgo } from "./utils";

/** In-memory dummy data (resets on reload) — mutated by ./handlers */
const img = (seed: string) => `https://picsum.photos/seed/${seed}/400/400`;

export const db: { products: Product[]; orders: Order[]; agencies: Agency[] } =
  {
    products: [
      {
        id: "p1",
        name: "Gạo ST25 hữu cơ",
        sku: "GAO-ST25-5KG",
        category: "Gạo",
        price: 185000,
        salePrice: 165000,
        origin: "Sóc Trăng",
        packaging: "Túi 5kg",
        shelfLife: "12 tháng",
        storage: "Nơi khô ráo, thoáng mát",
        description: "Gạo ST25 canh tác hữu cơ.",
        images: [img("rice")],
        status: "approved",
        createdAt: daysAgo(20),
      },
      {
        id: "p2",
        name: "Cà phê Robusta rang mộc",
        sku: "CF-ROB-500",
        category: "Cà phê",
        price: 120000,
        origin: "Đắk Lắk",
        packaging: "Túi 500g",
        shelfLife: "6 tháng",
        images: [img("coffee")],
        status: "approved",
        createdAt: daysAgo(15),
      },
      {
        id: "p3",
        name: "Mật ong hoa nhãn",
        sku: "MO-NHAN-1L",
        category: "Mật ong",
        price: 250000,
        origin: "Hưng Yên",
        packaging: "Chai 1L",
        images: [img("honey")],
        status: "pending",
        createdAt: daysAgo(3),
      },
      {
        id: "p4",
        name: "Trà Shan tuyết cổ thụ",
        sku: "TRA-SHAN-200",
        category: "Trà",
        price: 320000,
        salePrice: 290000,
        origin: "Hà Giang",
        packaging: "Hộp 200g",
        images: [img("tea")],
        status: "pending",
        createdAt: daysAgo(2),
      },
      {
        id: "p5",
        name: "Tiêu đen Phú Quốc",
        sku: "TIEU-PQ-250",
        category: "Gia vị",
        price: 95000,
        origin: "Phú Quốc",
        packaging: "Hũ 250g",
        images: [img("pepper")],
        status: "rejected",
        rejectionReason: "Thiếu giấy chứng nhận ATTP",
        createdAt: daysAgo(8),
      },
      {
        id: "p6",
        name: "Hạt điều rang muối",
        sku: "DIEU-RM-500",
        category: "Hạt",
        price: 210000,
        origin: "Bình Phước",
        packaging: "Hũ 500g",
        images: [img("cashew")],
        status: "approved",
        createdAt: daysAgo(10),
      },
      {
        id: "p7",
        name: "Xoài sấy dẻo Cam Lâm",
        sku: "XOAI-SAY-250",
        category: "Trái cây sấy",
        price: 89000,
        origin: "Khánh Hoà",
        packaging: "Túi 250g",
        images: [img("mango")],
        status: "pending",
        createdAt: daysAgo(1),
      },
      {
        id: "p8",
        name: "Trà ô long Lâm Đồng",
        sku: "TRA-OL-100",
        category: "Trà",
        price: 175000,
        origin: "Bảo Lộc",
        packaging: "Hộp 100g",
        images: [img("oolong")],
        status: "pending",
        createdAt: daysAgo(1),
      },
      {
        id: "p9",
        name: "Gạo lứt đỏ hữu cơ",
        sku: "GAO-LUT-2KG",
        category: "Gạo",
        price: 98000,
        salePrice: 85000,
        origin: "Đồng Tháp",
        packaging: "Túi 2kg",
        images: [img("brownrice")],
        status: "pending",
        createdAt: daysAgo(2),
      },
      {
        id: "p10",
        name: "Mắc ca nứt vỏ",
        sku: "MACCA-500",
        category: "Hạt",
        price: 260000,
        origin: "Đắk Nông",
        packaging: "Hũ 500g",
        images: [img("macadamia")],
        status: "pending",
        createdAt: daysAgo(3),
      },
      {
        id: "p11",
        name: "Cà phê Arabica Cầu Đất",
        sku: "CF-ARA-250",
        category: "Cà phê",
        price: 160000,
        origin: "Đà Lạt",
        packaging: "Túi 250g",
        images: [img("arabica")],
        status: "pending",
        createdAt: daysAgo(4),
      },
      {
        id: "p12",
        name: "Muối tôm Tây Ninh",
        sku: "MUOI-TOM-200",
        category: "Gia vị",
        price: 45000,
        origin: "Tây Ninh",
        packaging: "Hũ 200g",
        images: [img("salt")],
        status: "pending",
        createdAt: daysAgo(5),
      },
    ],
    orders: [
      {
        id: "o1",
        code: "MV-1001",
        recipientName: "Nguyễn Văn An",
        recipientPhone: "0901234567",
        address: "12 Lê Lợi, Q.1, TP.HCM",
        total: 495000,
        status: "new",
        createdAt: daysAgo(0),
      },
      {
        id: "o2",
        code: "MV-1002",
        recipientName: "Trần Thị Bình",
        recipientPhone: "0912345678",
        address: "45 Kim Mã, Ba Đình, Hà Nội",
        total: 330000,
        status: "confirmed",
        createdAt: daysAgo(1),
      },
      {
        id: "o3",
        code: "MV-1003",
        recipientName: "Lê Hoàng Cường",
        recipientPhone: "0987654321",
        address: "8 Trần Phú, Hải Châu, Đà Nẵng",
        total: 870000,
        status: "processing",
        createdAt: daysAgo(2),
      },
      {
        id: "o4",
        code: "MV-1004",
        recipientName: "Phạm Minh Dũng",
        recipientPhone: "0934567890",
        address: "102 Nguyễn Huệ, TP. Huế",
        total: 210000,
        status: "shipped",
        createdAt: daysAgo(3),
      },
      {
        id: "o5",
        code: "MV-1005",
        recipientName: "Võ Thị Em",
        recipientPhone: "0945678901",
        address: "77 Hùng Vương, Cần Thơ",
        total: 1250000,
        status: "completed",
        createdAt: daysAgo(5),
      },
      {
        id: "o6",
        code: "MV-1006",
        recipientName: "Đặng Quốc Phong",
        recipientPhone: "0956789012",
        address: "5 Lý Thường Kiệt, Hải Phòng",
        total: 640000,
        status: "completed",
        createdAt: daysAgo(6),
      },
      {
        id: "o7",
        code: "MV-1007",
        recipientName: "Bùi Thu Giang",
        recipientPhone: "0967890123",
        address: "30 Phan Chu Trinh, Nha Trang",
        total: 185000,
        status: "cancelled",
        createdAt: daysAgo(7),
      },
      {
        id: "o8",
        code: "MV-1008",
        recipientName: "Hồ Thanh Hà",
        recipientPhone: "0978901234",
        address: "18 Điện Biên Phủ, Bình Thạnh, TP.HCM",
        total: 560000,
        status: "new",
        createdAt: daysAgo(0),
      },
    ],
    agencies: [
      {
        id: "a1",
        name: "Mevi Đà Lạt",
        slug: "mevi-da-lat",
        brandColor: "#214c3a",
        contactName: "Nguyễn Lan",
        phone: "0909111222",
        email: "dalat@mevi.vn",
        active: true,
        createdAt: daysAgo(60),
      },
      {
        id: "a2",
        name: "Nông sản Miền Tây",
        slug: "nong-san-mien-tay",
        brandColor: "#c2410c",
        contactName: "Trần Hùng",
        phone: "0909333444",
        email: "mientay@mevi.vn",
        active: true,
        createdAt: daysAgo(40),
      },
      {
        id: "a3",
        name: "Đặc sản Tây Bắc",
        slug: "dac-san-tay-bac",
        brandColor: "#1d4ed8",
        contactName: "Lò Văn Sơn",
        phone: "0909555666",
        active: false,
        createdAt: daysAgo(25),
      },
    ],
  };

// ── Generated order history (deterministic) so the dashboard has trends to show ──
let seed = 42;
const rand = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
const pick = <T>(arr: T[]) => arr[Math.floor(rand() * arr.length)];

const NAMES = [
  "Nguyễn Minh Anh",
  "Trần Quốc Bảo",
  "Lê Thị Cúc",
  "Phạm Gia Huy",
  "Võ Ngọc Lan",
  "Đỗ Văn Khoa",
  "Huỳnh Mai",
  "Ngô Thanh Tùng",
  "Bùi Hải Yến",
  "Dương Đức Phúc",
];
const CITIES = [
  "Q.3, TP.HCM",
  "Cầu Giấy, Hà Nội",
  "Ninh Kiều, Cần Thơ",
  "Hải Châu, Đà Nẵng",
  "TP. Đà Lạt",
  "TP. Vinh",
  "Thủ Đức, TP.HCM",
  "TP. Buôn Ma Thuột",
];
const sellable = db.products.filter((p) => p.status === "approved");

/** Older orders are mostly finished; recent ones are still in the pipeline */
function statusFor(age: number): OrderStatus {
  const r = rand();
  if (r < 0.08) return "cancelled";
  if (age > 6) return "completed";
  if (age > 3) return r < 0.5 ? "completed" : "shipped";
  return pick<OrderStatus>(["new", "confirmed", "processing", "shipped"]);
}

for (let i = 0; i < 140; i++) {
  // Skew towards recent days and a gentle upward trend
  const age = Math.floor(Math.pow(rand(), 1.3) * 120) + 1;
  const items = Array.from({ length: 1 + Math.floor(rand() * 3) }, () => {
    const p = pick(sellable);
    return {
      productId: p.id,
      name: p.name,
      quantity: 1 + Math.floor(rand() * 4),
      price: p.salePrice ?? p.price,
    };
  });
  db.orders.push({
    id: `og${i}`,
    code: `MV-${2000 + i}`,
    recipientName: pick(NAMES),
    recipientPhone: `09${Math.floor(10_000_000 + rand() * 89_999_999)}`,
    address: `${1 + Math.floor(rand() * 200)} Đường số ${1 + Math.floor(rand() * 30)}, ${pick(CITIES)}`,
    total: items.reduce((s, it) => s + it.quantity * it.price, 0),
    items,
    status: statusFor(age),
    // Every other order came through an agency referral link
    agencyId: (["a1", "a2", "a3", undefined, undefined] as const)[i % 5],
    createdAt: new Date(
      Date.now() - age * 86_400_000 - rand() * 86_400_000 * 0.9,
    ).toISOString(),
  });
}
