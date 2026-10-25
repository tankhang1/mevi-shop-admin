import type { Agency } from "@/features/agency/types";
import type { Customer } from "@/features/customer/types";
import type { Farm } from "@/features/farm/types";
import type { DispatchTeam } from "@/features/dispatch-team/types";
import type { FarmRegistration } from "@/features/farm-registration/types";
import type { StockMovement } from "@/features/inventory/types";
import type { Order, OrderStatus } from "@/features/order/types";
import type { Product } from "@/features/product/types";
import type { ProductGroup } from "@/features/product-group/types";
import type { Review } from "@/features/review/types";
import type { Shop } from "@/features/shop/types";
import type { Staff } from "@/features/staff/types";
import { daysAgo } from "./utils";

/** In-memory dummy data (resets on reload) — mutated by ./handlers */
const img = (seed: string) => `https://picsum.photos/seed/${seed}/400/400`;

export const db: {
  products: Product[];
  productGroups: ProductGroup[];
  stockMovements: StockMovement[];
  customers: Customer[];
  staff: Staff[];
  farms: Farm[];
  farmRegistrations: FarmRegistration[];
  dispatchTeams: DispatchTeam[];
  orders: Order[];
  agencies: Agency[];
  shops: Shop[];
  reviews: Review[];
} = {
    shops: [
      {
        id: "s1",
        slug: "dac-san-mien-tay",
        name: "Đặc sản Miền Tây",
        tagline: "Gạo thơm, trái cây sấy quê nhà",
        description:
          "Mang hương vị đồng bằng sông Cửu Long đến mọi gian bếp: gạo ST25 chính gốc Sóc Trăng và trái cây sấy giòn không đường hóa học.",
        location: "Sóc Trăng",
        logoUrl: img("mientay-logo"),
        coverUrl: "https://picsum.photos/seed/mientay-cover/1600/500",
        brandColor: "#b45309",
        contactName: "Lê Chủ Shop",
        phone: "0909000003",
        email: "shop@mevi.vn",
        address: "12 Hùng Vương, P.6, TP. Sóc Trăng",
        verified: false,
        active: true,
        followers: 6120,
        responseRate: 92,
        productCount: 0,
        rating: 0,
        reviewCount: 0,
        joinedAt: "2022-03-14T00:00:00.000Z",
      },
      {
        id: "s2",
        slug: "ca-phe-tay-nguyen",
        name: "Cà phê Tây Nguyên",
        tagline: "Rang mộc từ đất đỏ bazan",
        description:
          "Xưởng rang thủ công tại Buôn Ma Thuột, chỉ dùng hạt chín 100% từ các nông hộ quen. Ngoài cà phê, chúng tôi bán thêm hạt dinh dưỡng đúng vụ.",
        location: "Buôn Ma Thuột, Đắk Lắk",
        logoUrl: img("taynguyen-logo"),
        coverUrl: "https://picsum.photos/seed/taynguyen-cover/1600/500",
        brandColor: "#7c2d12",
        contactName: "Y Bhin Niê",
        phone: "0905111222",
        email: "taynguyen@mevi.vn",
        address: "45 Lê Duẩn, TP. Buôn Ma Thuột",
        verified: true,
        active: true,
        followers: 9310,
        responseRate: 95,
        productCount: 0,
        rating: 0,
        reviewCount: 0,
        joinedAt: "2020-08-02T00:00:00.000Z",
      },
      {
        id: "s3",
        slug: "tra-gia-vi-viet",
        name: "Trà & Gia vị Việt",
        tagline: "Hương vị Việt trong từng gói",
        description:
          "Tuyển chọn trà Thái Nguyên, Shan tuyết Hà Giang và các loại gia vị đặc sản như tiêu Phú Quốc, muối tôm Tây Ninh.",
        location: "Thái Nguyên",
        logoUrl: img("traviet-logo"),
        coverUrl: "https://picsum.photos/seed/traviet-cover/1600/500",
        brandColor: "#15803d",
        contactName: "Hoàng Thu Trà",
        phone: "0912333444",
        email: "traviet@mevi.vn",
        address: "8 Hoàng Văn Thụ, TP. Thái Nguyên",
        verified: false,
        active: true,
        followers: 5230,
        responseRate: 94,
        productCount: 0,
        rating: 0,
        reviewCount: 0,
        joinedAt: "2021-11-20T00:00:00.000Z",
      },
    ],
    reviews: [],
    customers: [],
    dispatchTeams: [
      { id: "t1", shopId: "s1", name: "Nhóm gạo & ngũ cốc", description: "Xử lý đơn nhóm Gạo đặc sản", leaderId: "st1", memberIds: ["st1", "st2"], productGroupIds: ["g1"], active: true, createdAt: daysAgo(40) },
      { id: "t2", shopId: "s1", name: "Nhóm quà tặng", description: "Đóng gói & giao set quà", leaderId: "st2", memberIds: ["st2", "st4"], productGroupIds: ["g2"], active: true, createdAt: daysAgo(30) },
    ],
    farmRegistrations: [
      { id: "fr1", shopId: "s1", farmId: "f1", name: "Gạo ST24 thơm dẻo", category: "Gạo", description: "Vụ Đông Xuân, canh tác theo hướng hữu cơ.", packaging: "Túi 5kg", proposedPrice: 150000, quantity: 200, images: [img("rice-st24")], certifications: ["VietGAP"], status: "pending", createdAt: daysAgo(1) },
      { id: "fr2", shopId: "s1", farmId: "f6", name: "Nước mắm cá cơm Phú Quốc 40 độ đạm", category: "Gia vị", packaging: "Chai 500ml", proposedPrice: 95000, quantity: 120, images: [img("fish-sauce")], certifications: [], status: "pending", createdAt: daysAgo(3) },
      { id: "fr3", shopId: "s1", farmId: "f2", name: "Xoài cát Hoà Lộc sấy dẻo", category: "Trái cây sấy", packaging: "Túi 200g", proposedPrice: 75000, quantity: 0, images: [img("mango-hl")], certifications: ["OCOP 3 sao"], status: "rejected", rejectionReason: "Chưa có giấy kiểm nghiệm an toàn thực phẩm", reviewedBy: "Lê Chủ Shop", reviewedAt: daysAgo(8), createdAt: daysAgo(10) },
    ],
    farms: [
      { id: "f1", name: "Nông hộ Lâm Văn Sáu", ownerName: "Lâm Văn Sáu", location: "Mỹ Xuyên, Sóc Trăng", type: "farm_household" },
      { id: "f2", name: "HTX Nông nghiệp Cam Lâm", ownerName: "Nguyễn Thị Hoa", location: "Cam Lâm, Khánh Hoà", type: "cooperative" },
      { id: "f3", name: "Nông hộ Y Ngông", ownerName: "Y Ngông Niê", location: "Krông Pắc, Đắk Lắk", type: "farm_household" },
      { id: "f4", name: "HTX Trà Bảo Lộc", ownerName: "Trần Quốc Việt", location: "Bảo Lộc, Lâm Đồng", type: "cooperative" },
      { id: "f5", name: "Nông hộ Giàng A Páo", ownerName: "Giàng A Páo", location: "Hoàng Su Phì, Hà Giang", type: "farm_household" },
      { id: "f6", name: "Nông hộ Phạm Văn Lành", ownerName: "Phạm Văn Lành", location: "Dương Đông, Phú Quốc", type: "farm_household" },
    ],
    staff: [
      { id: "st1", shopId: "s1", name: "Phạm Thu Hà", phone: "0911000001", email: "ha.pham@mientay.vn", role: "manager", permissions: ["products", "inventory", "orders", "customers", "reviews", "shop"], status: "active", invitedAt: daysAgo(90), lastActiveAt: daysAgo(0), createdAt: daysAgo(90) },
      { id: "st2", shopId: "s1", name: "Trần Minh Quân", phone: "0911000002", email: "quan.tran@mientay.vn", role: "sales", permissions: ["orders", "customers", "reviews"], status: "active", invitedAt: daysAgo(45), lastActiveAt: daysAgo(1), createdAt: daysAgo(45) },
      { id: "st3", shopId: "s1", name: "Lê Văn Tài", phone: "0911000003", email: "tai.le@mientay.vn", role: "warehouse", permissions: ["inventory", "orders"], status: "disabled", invitedAt: daysAgo(60), lastActiveAt: daysAgo(20), createdAt: daysAgo(60) },
      { id: "st4", shopId: "s1", name: "Võ Ngọc Mai", phone: "0911000004", email: "mai.vo@mientay.vn", role: "sales", permissions: ["orders", "customers"], status: "invited", invitedAt: daysAgo(2), lastActiveAt: null, createdAt: daysAgo(2) },
      { id: "st5", shopId: "s2", name: "H'Nhi Êban", phone: "0911000005", email: "nhi@caphetaynguyen.vn", role: "manager", permissions: ["products", "inventory", "orders", "customers", "reviews", "shop"], status: "active", invitedAt: daysAgo(70), lastActiveAt: daysAgo(3), createdAt: daysAgo(70) },
    ],
    stockMovements: [
      { id: "mp1", productId: "p1", productName: "Gạo ST25 hữu cơ", sku: "GAO-ST25-5KG", shopId: "s1", type: "in", source: "farm", status: "pending", delta: 80, before: 120, after: 200, note: "Nông hộ Lâm Văn Sáu giao thêm lô thu hoạch tháng 10", createdBy: "Lâm Văn Sáu (nông hộ)", createdAt: daysAgo(0) },
      { id: "mp2", productId: "p9", productName: "Gạo lứt đỏ hữu cơ", sku: "GAO-LUT-2KG", shopId: "s1", type: "in", source: "farm", status: "pending", delta: 40, before: 15, after: 55, note: "Bổ sung hàng", createdBy: "Lâm Văn Sáu (nông hộ)", createdAt: daysAgo(1) },
      { id: "mh0", productId: "p1", productName: "Gạo ST25 hữu cơ", sku: "GAO-ST25-5KG", shopId: "s1", type: "in", source: "farm", status: "approved", delta: 35, before: 40, after: 75, note: "Nhập hàng vụ Hè Thu", createdBy: "Lê Chủ Shop", createdAt: daysAgo(40) },
      { id: "mh1", productId: "p1", productName: "Gạo ST25 hữu cơ", sku: "GAO-ST25-5KG", shopId: "s1", type: "out", status: "approved", delta: -11, before: 75, after: 64, note: "Xuất đơn sỉ", createdBy: "Lê Chủ Shop", createdAt: daysAgo(38) },
      { id: "mh2", productId: "p1", productName: "Gạo ST25 hữu cơ", sku: "GAO-ST25-5KG", shopId: "s1", type: "out", status: "approved", delta: -8, before: 64, after: 56, note: "Hàng hỏng, huỷ", createdBy: "Lê Chủ Shop", createdAt: daysAgo(36) },
      { id: "mh3", productId: "p1", productName: "Gạo ST25 hữu cơ", sku: "GAO-ST25-5KG", shopId: "s1", type: "in", source: "farm", status: "approved", delta: 50, before: 56, after: 106, note: "Nhập hàng vụ Hè Thu", createdBy: "Lê Chủ Shop", createdAt: daysAgo(34) },
      { id: "mh4", productId: "p1", productName: "Gạo ST25 hữu cơ", sku: "GAO-ST25-5KG", shopId: "s1", type: "out", status: "approved", delta: -12, before: 106, after: 94, note: "Xuất đơn sỉ", createdBy: "Lê Chủ Shop", createdAt: daysAgo(32) },
      { id: "mh5", productId: "p1", productName: "Gạo ST25 hữu cơ", sku: "GAO-ST25-5KG", shopId: "s1", type: "out", status: "approved", delta: -12, before: 94, after: 82, note: "Xuất đơn sỉ", createdBy: "Lê Chủ Shop", createdAt: daysAgo(30) },
      { id: "mh6", productId: "p1", productName: "Gạo ST25 hữu cơ", sku: "GAO-ST25-5KG", shopId: "s1", type: "in", source: "farm", status: "approved", delta: 50, before: 82, after: 132, note: "Nhập bổ sung", createdBy: "Lê Chủ Shop", createdAt: daysAgo(28) },
      { id: "mh7", productId: "p1", productName: "Gạo ST25 hữu cơ", sku: "GAO-ST25-5KG", shopId: "s1", type: "out", status: "approved", delta: -11, before: 132, after: 121, note: "Xuất đơn sỉ", createdBy: "Lê Chủ Shop", createdAt: daysAgo(26) },
      { id: "mh8", productId: "p1", productName: "Gạo ST25 hữu cơ", sku: "GAO-ST25-5KG", shopId: "s1", type: "out", status: "approved", delta: -6, before: 121, after: 115, note: "Hàng hỏng, huỷ", createdBy: "Lê Chủ Shop", createdAt: daysAgo(24) },
      { id: "mh9", productId: "p1", productName: "Gạo ST25 hữu cơ", sku: "GAO-ST25-5KG", shopId: "s1", type: "in", source: "farm", status: "approved", delta: 50, before: 115, after: 165, note: "Nhập hàng vụ Hè Thu", createdBy: "Lê Chủ Shop", createdAt: daysAgo(22) },
      { id: "mh10", productId: "p1", productName: "Gạo ST25 hữu cơ", sku: "GAO-ST25-5KG", shopId: "s1", type: "out", status: "approved", delta: -11, before: 165, after: 154, note: "Xuất cho đại lý", createdBy: "Lê Chủ Shop", createdAt: daysAgo(20) },
      { id: "mh11", productId: "p1", productName: "Gạo ST25 hữu cơ", sku: "GAO-ST25-5KG", shopId: "s1", type: "out", status: "approved", delta: -9, before: 154, after: 145, note: "Hàng hỏng, huỷ", createdBy: "Lê Chủ Shop", createdAt: daysAgo(18) },
      { id: "mh12", productId: "p1", productName: "Gạo ST25 hữu cơ", sku: "GAO-ST25-5KG", shopId: "s1", type: "in", source: "farm", status: "approved", delta: 29, before: 145, after: 174, note: "Nhập lô mới từ HTX", createdBy: "Lê Chủ Shop", createdAt: daysAgo(16) },
      { id: "mh13", productId: "p1", productName: "Gạo ST25 hữu cơ", sku: "GAO-ST25-5KG", shopId: "s1", type: "out", status: "approved", delta: -5, before: 174, after: 169, note: "Hàng hỏng, huỷ", createdBy: "Lê Chủ Shop", createdAt: daysAgo(14) },
      { id: "m1", productId: "p1", productName: "Gạo ST25 hữu cơ", sku: "GAO-ST25-5KG", shopId: "s1", type: "out", status: "approved", delta: -29, before: 169, after: 140, note: "Xuất cho HTX đối tác", createdBy: "Lê Chủ Shop", createdAt: daysAgo(9) },
      { id: "m2", productId: "p1", productName: "Gạo ST25 hữu cơ", sku: "GAO-ST25-5KG", shopId: "s1", type: "out", status: "approved", delta: -18, before: 140, after: 122, note: "Xuất cho đơn sỉ", createdBy: "Lê Chủ Shop", createdAt: daysAgo(4) },
      { id: "m3", productId: "p1", productName: "Gạo ST25 hữu cơ", sku: "GAO-ST25-5KG", shopId: "s1", type: "adjust", status: "approved", delta: -2, before: 122, after: 120, note: "Kiểm kê cuối tháng — 2 bao rách", createdBy: "Lê Chủ Shop", createdAt: daysAgo(1) },
      { id: "m4", productId: "p2", productName: "Cà phê Robusta rang mộc", sku: "CF-ROB-500", shopId: "s2", type: "in", source: "farm", status: "approved", delta: 45, before: 0, after: 45, createdBy: "Nguyễn Quản Trị", createdAt: daysAgo(6) },
    ],
    productGroups: [
      {
        id: "g1",
        shopId: "s1",
        name: "Gạo đặc sản",
        description: "Gạo thơm chính gốc đồng bằng sông Cửu Long.",
        imageUrl: img("group-rice"),
        productIds: ["p1"],
        createdAt: daysAgo(18),
      },
      {
        id: "g2",
        shopId: "s1",
        name: "Quà Tết",
        description: "Set quà biếu sang trọng cho dịp Tết.",
        imageUrl: img("group-tet"),
        productIds: [],
        createdAt: daysAgo(5),
      },
      {
        id: "g3",
        shopId: "s2",
        name: "Cà phê rang mộc",
        description: "Rang mộc, không tẩm ướp.",
        imageUrl: img("group-coffee"),
        productIds: ["p2"],
        createdAt: daysAgo(10),
      },
    ],
    products: [
      {
        id: "p1",
        source: "farm",
        farmId: "f1",
        shopId: "s1",
        certifications: ["VietGAP", "Hữu cơ"],
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
        listed: true,
        stock: 120,
        lowStockThreshold: 10,
        createdAt: daysAgo(20),
      },
      {
        id: "p2",
        source: "farm",
        farmId: "f3",
        shopId: "s2",
        certifications: ["OCOP 4 sao"],
        name: "Cà phê Robusta rang mộc",
        sku: "CF-ROB-500",
        category: "Cà phê",
        price: 120000,
        origin: "Đắk Lắk",
        packaging: "Túi 500g",
        shelfLife: "6 tháng",
        images: [img("coffee")],
        status: "approved",
        listed: true,
        stock: 45,
        lowStockThreshold: 10,
        createdAt: daysAgo(15),
      },
      {
        id: "p3",
        farmId: "f2",
        shopId: "s3",
        certifications: [],
        name: "Mật ong hoa nhãn",
        sku: "MO-NHAN-1L",
        category: "Mật ong",
        price: 250000,
        origin: "Hưng Yên",
        packaging: "Chai 1L",
        images: [img("honey")],
        status: "pending",
        listed: false,
        stock: 0,
        lowStockThreshold: 10,
        createdAt: daysAgo(3),
      },
      {
        id: "p4",
        farmId: "f5",
        shopId: "s3",
        certifications: ["Hữu cơ", "OCOP 5 sao"],
        name: "Trà Shan tuyết cổ thụ",
        sku: "TRA-SHAN-200",
        category: "Trà",
        price: 320000,
        salePrice: 290000,
        origin: "Hà Giang",
        packaging: "Hộp 200g",
        images: [img("tea")],
        status: "pending",
        listed: false,
        stock: 8,
        lowStockThreshold: 10,
        createdAt: daysAgo(2),
      },
      {
        id: "p5",
        farmId: "f6",
        shopId: "s3",
        certifications: [],
        name: "Tiêu đen Phú Quốc",
        sku: "TIEU-PQ-250",
        category: "Gia vị",
        price: 95000,
        origin: "Phú Quốc",
        packaging: "Hũ 250g",
        images: [img("pepper")],
        status: "rejected",
        listed: false,
        stock: 60,
        lowStockThreshold: 10,
        rejectionReason: "Thiếu giấy chứng nhận ATTP",
        createdAt: daysAgo(8),
      },
      {
        id: "p6",
        farmId: "f3",
        shopId: "s2",
        certifications: ["HACCP"],
        name: "Hạt điều rang muối",
        sku: "DIEU-RM-500",
        category: "Hạt",
        price: 210000,
        origin: "Bình Phước",
        packaging: "Hũ 500g",
        images: [img("cashew")],
        status: "approved",
        listed: true,
        stock: 3,
        lowStockThreshold: 10,
        createdAt: daysAgo(10),
      },
      {
        id: "p7",
        source: "farm",
        farmId: "f2",
        shopId: "s1",
        certifications: [],
        name: "Xoài sấy dẻo Cam Lâm",
        sku: "XOAI-SAY-250",
        category: "Trái cây sấy",
        price: 89000,
        origin: "Khánh Hoà",
        packaging: "Túi 250g",
        images: [img("mango")],
        status: "pending",
        listed: false,
        stock: 200,
        lowStockThreshold: 10,
        createdAt: daysAgo(1),
      },
      {
        id: "p8",
        farmId: "f4",
        shopId: "s3",
        certifications: [],
        name: "Trà ô long Lâm Đồng",
        sku: "TRA-OL-100",
        category: "Trà",
        price: 175000,
        origin: "Bảo Lộc",
        packaging: "Hộp 100g",
        images: [img("oolong")],
        status: "pending",
        listed: false,
        stock: 0,
        lowStockThreshold: 10,
        createdAt: daysAgo(1),
      },
      {
        id: "p9",
        source: "farm",
        farmId: "f1",
        shopId: "s1",
        certifications: ["Hữu cơ"],
        name: "Gạo lứt đỏ hữu cơ",
        sku: "GAO-LUT-2KG",
        category: "Gạo",
        price: 98000,
        salePrice: 85000,
        origin: "Đồng Tháp",
        packaging: "Túi 2kg",
        images: [img("brownrice")],
        status: "pending",
        listed: false,
        stock: 15,
        lowStockThreshold: 10,
        createdAt: daysAgo(2),
      },
      {
        id: "p10",
        source: "farm",
        farmId: "f3",
        shopId: "s2",
        certifications: [],
        name: "Mắc ca nứt vỏ",
        sku: "MACCA-500",
        category: "Hạt",
        price: 260000,
        origin: "Đắk Nông",
        packaging: "Hũ 500g",
        images: [img("macadamia")],
        status: "pending",
        listed: false,
        stock: 30,
        lowStockThreshold: 10,
        createdAt: daysAgo(3),
      },
      {
        id: "p11",
        farmId: "f4",
        shopId: "s2",
        certifications: ["VietGAP"],
        name: "Cà phê Arabica Cầu Đất",
        sku: "CF-ARA-250",
        category: "Cà phê",
        price: 160000,
        origin: "Đà Lạt",
        packaging: "Túi 250g",
        images: [img("arabica")],
        status: "pending",
        listed: false,
        stock: 5,
        lowStockThreshold: 10,
        createdAt: daysAgo(4),
      },
      {
        id: "p12",
        farmId: "f2",
        shopId: "s3",
        certifications: [],
        name: "Muối tôm Tây Ninh",
        sku: "MUOI-TOM-200",
        category: "Gia vị",
        price: 45000,
        origin: "Tây Ninh",
        packaging: "Hũ 200g",
        images: [img("salt")],
        status: "pending",
        listed: false,
        stock: 80,
        lowStockThreshold: 10,
        createdAt: daysAgo(5),
      },
    ],
    orders: [
      {
        id: "o1",
        code: "MV-1001",
        shopId: "s1",
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
        shopId: "s2",
        recipientName: "Trần Thị Bình",
        recipientPhone: "0912345678",
        address: "45 Kim Mã, Ba Đình, Hà Nội",
        total: 330000,
        status: "new",
        createdAt: daysAgo(1),
      },
      {
        id: "o3",
        code: "MV-1003",
        shopId: "s3",
        recipientName: "Lê Hoàng Cường",
        recipientPhone: "0987654321",
        address: "8 Trần Phú, Hải Châu, Đà Nẵng",
        total: 870000,
        status: "new",
        createdAt: daysAgo(2),
      },
      {
        id: "o4",
        code: "MV-1004",
        shopId: "s1",
        recipientName: "Phạm Minh Dũng",
        recipientPhone: "0934567890",
        address: "102 Nguyễn Huệ, TP. Huế",
        total: 210000,
        status: "new",
        createdAt: daysAgo(3),
      },
      {
        id: "o5",
        code: "MV-1005",
        shopId: "s2",
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
        shopId: "s3",
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
        shopId: "s1",
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
        shopId: "s2",
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
        commissionRate: 10,
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
        commissionRate: 8,
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
        commissionRate: 12,
        createdAt: daysAgo(25),
      },
    ],
  };

// ── Generated order history (deterministic) so the dashboard has trends to show ──
let seed = 42;
const rand = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
const pick = <T>(arr: T[]) => arr[Math.floor(rand() * arr.length)];

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

/** Repeat buyers: a small pool so the same people show up across many orders */
const SURNAMES = ["Nguyễn", "Trần", "Lê", "Phạm", "Hoàng", "Võ", "Đặng", "Bùi", "Đỗ", "Ngô", "Dương", "Lý"];
const GIVEN = ["Minh Anh", "Quốc Bảo", "Thị Cúc", "Gia Huy", "Ngọc Lan", "Văn Khoa", "Mai", "Thanh Tùng", "Hải Yến", "Đức Phúc", "Thu Trang", "Hoàng Nam", "Bích Ngọc", "Tuấn Kiệt"];
const BUYERS = Array.from({ length: 28 }, (_, i) => ({
  name: `${SURNAMES[i % SURNAMES.length]} ${GIVEN[(i * 5) % GIVEN.length]}`,
  phone: `09${String(10_000_000 + Math.floor(rand() * 89_999_999))}`,
  address: `${1 + Math.floor(rand() * 200)} Đường số ${1 + Math.floor(rand() * 30)}, ${pick(CITIES)}`,
}));
// Skewed so a handful of loyal customers place most orders
const pickBuyer = () => BUYERS[Math.floor(Math.pow(rand(), 1.8) * BUYERS.length)];

/** Older orders are mostly finished; recent ones are still in the pipeline */
function statusFor(age: number): OrderStatus {
  const r = rand();
  if (r < 0.08) return "cancelled";
  if (age > 4) return "completed";
  return r < 0.4 ? "completed" : "new";
}

for (let i = 0; i < 140; i++) {
  // Skew towards recent days and a gentle upward trend
  const age = Math.floor(Math.pow(rand(), 1.3) * 120) + 1;
  // One order = one seller: pick a shop via its first product, then fill from that shop
  const first = pick(sellable);
  const shopProducts = sellable.filter((p) => p.shopId === first.shopId);
  const items = Array.from({ length: 1 + Math.floor(rand() * 3) }, (_, k) => {
    const p = k === 0 ? first : pick(shopProducts);
    return {
      productId: p.id,
      name: p.name,
      quantity: 1 + Math.floor(rand() * 4),
      price: p.salePrice ?? p.price,
    };
  });
  const agencyId = (["a1", "a2", "a3", undefined, undefined] as const)[i % 5];
  const buyer = pickBuyer();
  db.orders.push({
    id: `og${i}`,
    code: `MV-${2000 + i}`,
    recipientName: buyer.name,
    recipientPhone: buyer.phone,
    address: buyer.address,
    total: items.reduce((s, it) => s + it.quantity * it.price, 0),
    items,
    shopId: first.shopId,
    status: statusFor(age),
    // Every other order came through an agency referral link
    agencyId,
    commissionRate: agencyId ? db.agencies.find((a) => a.id === agencyId)?.commissionRate : undefined,
    // Commissions on orders finished more than a month ago have been paid out
    commissionPaidAt: agencyId && age > 30 ? daysAgo(age - 30) : null,
    createdAt: new Date(
      Date.now() - age * 86_400_000 - rand() * 86_400_000 * 0.9,
    ).toISOString(),
  });
}

// ── Order details: items for the hand-written orders + a status trail for every order ──
const FLOW: OrderStatus[] = ["new", "completed"];
for (const o of db.orders) {
  if (!o.items?.length) {
    const p = db.products.find((x) => x.shopId === o.shopId) ?? db.products[0];
    const price = p.salePrice ?? p.price;
    const quantity = Math.max(1, Math.round(o.total / price));
    o.items = [{ productId: p.id, name: p.name, quantity, price }];
    o.total = quantity * price;
  }
  const placed = new Date(o.createdAt).getTime();
  const shop = db.shops.find((x) => x.id === o.shopId)?.contactName ?? "Chủ shop";
  const reached = o.status === "cancelled" ? FLOW.slice(0, 1) : FLOW.slice(0, FLOW.indexOf(o.status) + 1);
  o.statusHistory = reached.map((status, i) => ({
    status,
    at: new Date(Math.min(Date.now(), placed + i * (6 + rand() * 18) * 3_600_000)).toISOString(),
    by: i === 0 ? "Khách hàng" : shop,
  }));
  if (o.status === "cancelled") {
    o.cancelReason = pick(["Khách yêu cầu huỷ", "Không liên lạc được khách", "Hết hàng"]);
    o.statusHistory.push({
      status: "cancelled",
      at: new Date(Math.min(Date.now(), placed + reached.length * 8 * 3_600_000)).toISOString(),
      by: shop,
      note: o.cancelReason,
    });
  }
}

// ── Dispatch: route each order to the team owning its product group, members in turn ──
for (const o of [...db.orders].sort((a, b) => a.createdAt.localeCompare(b.createdAt))) {
  const groupIds = db.productGroups.filter((g) => o.items?.some((it) => g.productIds.includes(it.productId))).map((g) => g.id);
  const team = db.dispatchTeams.find((t) => t.shopId === o.shopId && t.productGroupIds.some((g) => groupIds.includes(g)));
  // Leave the newest few unassigned so "Tự động phân đơn" has work to do
  if (!team || Date.now() - new Date(o.createdAt).getTime() < 2 * 86_400_000) continue;
  o.teamId = team.id;
  const i = team.nextMemberIndex ?? 0;
  o.assigneeId = team.memberIds[i % team.memberIds.length];
  team.nextMemberIndex = (i + 1) % team.memberIds.length;
}

// ── Customers: one per distinct buyer phone, first seen = first order ──
for (const o of [...db.orders].sort((a, b) => a.createdAt.localeCompare(b.createdAt))) {
  if (db.customers.some((c) => c.phone === o.recipientPhone)) continue;
  db.customers.push({
    id: `c${db.customers.length + 1}`,
    name: o.recipientName,
    phone: o.recipientPhone,
    address: o.address,
    tags: [],
    createdAt: o.createdAt,
  });
}
db.customers[0].tags = ["Khách sỉ"];
db.customers[0].note = "Mua số lượng lớn, ưu tiên giao buổi sáng.";
db.customers[1].tags = ["Quà tặng"];

// ── Generated reviews (deterministic), wording from mevi-shop's reviews model ──
const AUTHORS = ["Nguyễn Thu Hà", "Trần Minh Khoa", "Lê Bảo Ngọc", "Phạm Gia Huy", "Võ Thị Mai", "Đỗ Quang Vinh", "Huỳnh Anh Thư", "Bùi Đức Long", "Ngô Phương Linh", "Đặng Hữu Tài"];
const PRAISE = [
  { content: "Hàng tươi, đóng gói cẩn thận, giao nhanh hơn mình nghĩ. Sẽ ủng hộ shop dài dài.", tags: ["Giao nhanh", "Đóng gói kỹ"] },
  { content: "Chất lượng đúng như mô tả, có ghi rõ vùng trồng nên mua rất yên tâm.", tags: ["Đúng mô tả", "Rõ nguồn gốc"] },
  { content: "Lần thứ ba mua rồi, chất lượng vẫn ổn định. Cả nhà đều thích.", tags: ["Mua lại", "Chất lượng ổn định"] },
  { content: "Giá hợp lý so với chất lượng. Shop tư vấn nhiệt tình qua điện thoại.", tags: ["Giá tốt", "Shop nhiệt tình"] },
  { content: "Mua làm quà biếu, người nhận khen ngon. Bao bì đẹp, sạch sẽ.", tags: ["Làm quà", "Bao bì đẹp"] },
];
const CRITICAL = [
  { content: "Sản phẩm ổn, nhưng giao hàng hơi trễ một ngày so với hẹn.", tags: ["Giao hơi chậm"], rating: 3 },
  { content: "Có vài phần hơi dập do vận chuyển. Shop đã hỗ trợ đổi.", tags: ["Shop hỗ trợ đổi"], rating: 3 },
  { content: "Hàng không giống ảnh lắm, vị nhạt hơn lần trước.", tags: ["Không như mô tả"], rating: 2 },
  { content: "Đóng gói sơ sài, túi bị rách khi nhận.", tags: ["Đóng gói kém"], rating: 1 },
];
const SHOP_REPLY = "Cảm ơn anh/chị đã tin tưởng ủng hộ shop. Chúc anh/chị và gia đình nhiều sức khoẻ!";

let rid = 0;
for (const p of db.products.filter((x) => x.status === "approved")) {
  const count = 4 + Math.floor(rand() * 6);
  for (let i = 0; i < count; i++) {
    const critical = rand() < 0.22;
    const pickR = critical ? pick(CRITICAL) : pick(PRAISE);
    const age = Math.floor(rand() * 60);
    const replied = !critical && rand() < 0.45;
    db.reviews.push({
      id: `r${++rid}`,
      productId: p.id,
      productName: p.name,
      productImage: p.images[0],
      shopId: p.shopId,
      author: pick(AUTHORS),
      rating: (critical ? (pickR as (typeof CRITICAL)[number]).rating : rand() < 0.3 ? 4 : 5) as Review["rating"],
      content: pickR.content,
      tags: pickR.tags,
      images: rand() < 0.15 ? [img(`review-${rid}`)] : [],
      helpful: Math.floor(rand() * 24),
      createdAt: daysAgo(age),
      hidden: pickR.tags.includes("Đóng gói kém") && rand() < 0.5,
      reply: replied ? { content: SHOP_REPLY, repliedAt: daysAgo(Math.max(0, age - 1)), by: "shop" } : null,
    });
  }
}
db.reviews.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
