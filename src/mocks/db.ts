import type { Agency } from "@/features/agency/types";
import type { Order } from "@/features/order/types";
import type { Product } from "@/features/product/types";
import { daysAgo } from "./utils";

/** In-memory dummy data (resets on reload) — mutated by ./handlers */
const img = (seed: string) => `https://picsum.photos/seed/${seed}/400/400`;

export const db: { products: Product[]; orders: Order[]; agencies: Agency[] } = {
  products: [
    { id: "p1", name: "Gạo ST25 hữu cơ", sku: "GAO-ST25-5KG", category: "Gạo", price: 185000, salePrice: 165000, origin: "Sóc Trăng", packaging: "Túi 5kg", shelfLife: "12 tháng", storage: "Nơi khô ráo, thoáng mát", description: "Gạo ST25 canh tác hữu cơ.", images: [img("rice")], status: "approved", createdAt: daysAgo(20) },
    { id: "p2", name: "Cà phê Robusta rang mộc", sku: "CF-ROB-500", category: "Cà phê", price: 120000, origin: "Đắk Lắk", packaging: "Túi 500g", shelfLife: "6 tháng", images: [img("coffee")], status: "approved", createdAt: daysAgo(15) },
    { id: "p3", name: "Mật ong hoa nhãn", sku: "MO-NHAN-1L", category: "Mật ong", price: 250000, origin: "Hưng Yên", packaging: "Chai 1L", images: [img("honey")], status: "pending", createdAt: daysAgo(3) },
    { id: "p4", name: "Trà Shan tuyết cổ thụ", sku: "TRA-SHAN-200", category: "Trà", price: 320000, salePrice: 290000, origin: "Hà Giang", packaging: "Hộp 200g", images: [img("tea")], status: "pending", createdAt: daysAgo(2) },
    { id: "p5", name: "Tiêu đen Phú Quốc", sku: "TIEU-PQ-250", category: "Gia vị", price: 95000, origin: "Phú Quốc", packaging: "Hũ 250g", images: [img("pepper")], status: "rejected", rejectionReason: "Thiếu giấy chứng nhận ATTP", createdAt: daysAgo(8) },
    { id: "p6", name: "Hạt điều rang muối", sku: "DIEU-RM-500", category: "Hạt", price: 210000, origin: "Bình Phước", packaging: "Hũ 500g", images: [img("cashew")], status: "approved", createdAt: daysAgo(10) },
  ],
  orders: [
    { id: "o1", code: "MV-1001", recipientName: "Nguyễn Văn An", recipientPhone: "0901234567", address: "12 Lê Lợi, Q.1, TP.HCM", total: 495000, status: "new", createdAt: daysAgo(0) },
    { id: "o2", code: "MV-1002", recipientName: "Trần Thị Bình", recipientPhone: "0912345678", address: "45 Kim Mã, Ba Đình, Hà Nội", total: 330000, status: "confirmed", createdAt: daysAgo(1) },
    { id: "o3", code: "MV-1003", recipientName: "Lê Hoàng Cường", recipientPhone: "0987654321", address: "8 Trần Phú, Hải Châu, Đà Nẵng", total: 870000, status: "processing", createdAt: daysAgo(2) },
    { id: "o4", code: "MV-1004", recipientName: "Phạm Minh Dũng", recipientPhone: "0934567890", address: "102 Nguyễn Huệ, TP. Huế", total: 210000, status: "shipped", createdAt: daysAgo(3) },
    { id: "o5", code: "MV-1005", recipientName: "Võ Thị Em", recipientPhone: "0945678901", address: "77 Hùng Vương, Cần Thơ", total: 1250000, status: "completed", createdAt: daysAgo(5) },
    { id: "o6", code: "MV-1006", recipientName: "Đặng Quốc Phong", recipientPhone: "0956789012", address: "5 Lý Thường Kiệt, Hải Phòng", total: 640000, status: "completed", createdAt: daysAgo(6) },
    { id: "o7", code: "MV-1007", recipientName: "Bùi Thu Giang", recipientPhone: "0967890123", address: "30 Phan Chu Trinh, Nha Trang", total: 185000, status: "cancelled", createdAt: daysAgo(7) },
    { id: "o8", code: "MV-1008", recipientName: "Hồ Thanh Hà", recipientPhone: "0978901234", address: "18 Điện Biên Phủ, Bình Thạnh, TP.HCM", total: 560000, status: "new", createdAt: daysAgo(0) },
  ],
  agencies: [
    { id: "a1", name: "Mevi Đà Lạt", slug: "mevi-da-lat", brandColor: "#214c3a", contactName: "Nguyễn Lan", phone: "0909111222", email: "dalat@mevi.vn", active: true, createdAt: daysAgo(60) },
    { id: "a2", name: "Nông sản Miền Tây", slug: "nong-san-mien-tay", brandColor: "#c2410c", contactName: "Trần Hùng", phone: "0909333444", email: "mientay@mevi.vn", active: true, createdAt: daysAgo(40) },
    { id: "a3", name: "Đặc sản Tây Bắc", slug: "dac-san-tay-bac", brandColor: "#1d4ed8", contactName: "Lò Văn Sơn", phone: "0909555666", active: false, createdAt: daysAgo(25) },
  ],
};
