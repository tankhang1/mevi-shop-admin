/** Centralized API endpoints — real backend and src/mocks share these paths */
export const API_ENDPOINTS = {
  auth: {
    me: "/auth/me",
    login: (provider: string) => `/auth/login/${encodeURIComponent(provider)}`,
    /** POST — Bearer old token → `string` | `{ access_token }` */
    refresh: "/auth/refresh",
    /** POST ?post_logout_redirect_uri= */
    logout: "/auth/logout",
  },
  admin: {
    summary: "/api/admin/shop/summary",
    products: {
      base: "/api/admin/shop/products",
      stats: "/api/admin/shop/products/stats",
      detail: (id: string) => `/api/admin/shop/products/${id}`,
      moderate: (id: string) => `/api/admin/shop/products/${id}/moderate`,
      /** Shop admin puts an approved product on / off the storefront shelf */
      listing: (id: string) => `/api/admin/shop/products/${id}/listing`,
    },
    productGroups: {
      base: "/api/admin/shop/product-categories",
      detail: (id: string | number) =>
        `/api/admin/shop/product-categories/${id}`,
      /** PUT { productIds, categoryId } — replaces the group's members */
      products: () => "/api/admin/shop/products/category",
    },
    inventory: {
      base: "/api/admin/shop/inventory",
      stats: "/api/admin/shop/inventory/stats",
      movements: "/api/admin/shop/inventory/movements",
      /** GET ?status=pending|approved|rejected|all&farmId=&productId= — nông hộ's supply requests (source=farm), `counts` per status */
      supplyRequests: "/api/admin/shop/inventory/supply-requests",
      /** POST { type, quantity, note } */
      adjust: (productId: string) =>
        `/api/admin/shop/inventory/${productId}/adjust`,
      /** POST — admin approves a pending farm stock change (adds the delta to current stock) */
      approve: (movementId: string) =>
        `/api/admin/shop/inventory/movements/${movementId}/approve`,
      /** POST { reason } */
      reject: (movementId: string) =>
        `/api/admin/shop/inventory/movements/${movementId}/reject`,
      /** PATCH { lowStockThreshold?, variantThresholds? } */
      threshold: (productId: string) =>
        `/api/admin/shop/inventory/${productId}/threshold`,
    },
    /** Mevi shop catalog (BE notice 2026-10-28) — responses are NOT wrapped in `{ data }` */
    catalog: {
      categories: {
        base: "/api/admin/shop/product-categories",
        detail: (id: number) => `/api/admin/shop/product-categories/${id}`,
      },
      products: {
        base: "/api/admin/shop/products",
        /** GET ?categoryId&agricultural&lowStock&keyword → { active, inactive, total } */
        statusCounts: "/api/admin/shop/products/status-counts",
        /** PUT { productIds, categoryId } → 204 */
        bulkCategory: "/api/admin/shop/products/category",
        detail: (id: number) => `/api/admin/shop/products/${id}`,
        /** PUT { status } */
        status: (id: number) => `/api/admin/shop/products/${id}/status`,
        /** PUT { thresholds: [{ variantId, threshold }] } */
        lowStockThresholds: (id: number) =>
          `/api/admin/shop/products/${id}/low-stock-thresholds`,
        /** POST — nhập hàng (MEVI / FARM) */
        stockReceipts: (id: number) =>
          `/api/admin/shop/products/${id}/stock-receipts`,
        /** POST — điều chỉnh tồn kho */
        stockAdjustments: (id: number) =>
          `/api/admin/shop/products/${id}/stock-adjustments`,
      },
      /** GET — one row per variant */
      inventory: "/api/admin/shop/inventory",
      /** GET — stock counts (quy cách + đơn vị tính) and movement counts */
      inventorySummary: "/api/admin/shop/inventory/summary",
      stockMovements: {
        base: "/api/admin/shop/stock-movements",
        statusCounts: "/api/admin/shop/stock-movements/status-counts",
        /** POST { unitCost? } */
        approve: (id: number) =>
          `/api/admin/shop/stock-movements/${id}/approve`,
        /** POST { reason } */
        reject: (id: number) => `/api/admin/shop/stock-movements/${id}/reject`,
      },
      /** Farm pickers for supply sources */
      farmZoneGroups: "/api/admin/farm/production-zones/groups",
      farmZones: "/api/admin/farm/production-zones",
      /** Cây trồng picker — ?domainCode=CROP&keyword= */
      farmSubjects: "/api/foundation/production/subjects",
      /** Giống picker — ?domainCode=CROP&subjectId= */
      farmSubjectVariants: "/api/foundation/production/subject-variants",
      /** POST multipart `file` ?format=JPEG|WEBP */
      productPhotos: "/api/storage/product-photos",
    },
    customers: {
      base: "/api/admin/shop/customers",
      stats: "/api/admin/shop/customers/stats",
      detail: (id: string) => `/api/admin/shop/customers/${id}`,
    },
    staff: {
      /** GET — Danh sách nhân viên điều phối (BE notice 2026-11-03) */
      base: "/api/admin/users/shop-staff",
      /** PUT / DELETE — Gán / gỡ role MEVI_SHOP_STAFF */
      detail: (id: string | number) => `/api/admin/users/shop-staff/${id}`,
      /** PUT — Cập nhật thông tin tài khoản user */
      user: (id: string | number) => `/api/admin/users/${id}`,
      /** PUT — Đổi trạng thái active / inactive */
      status: (id: string | number) => `/api/admin/users/${id}/status`,
      /** Fallback cũ */
      resendInvite: (id: string | number) =>
        `/api/admin/shop/staff/${id}/resend-invite`,
    },
    dispatchTeams: {
      /** GET / POST — Nhóm điều phối xử lý đơn (BE notice 2026-11-03) */
      base: "/api/shop/dispatch-groups",
      detail: (id: string | number) => `/api/shop/dispatch-groups/${id}`,
      /** POST — Phân đơn còn tồn tự động */
      assignOrders: "/api/shop/dispatch-groups/assign-orders",
      autoAssign: "/api/shop/dispatch-groups/assign-orders",
    },
    /** Farmer households / cooperatives supplying products (synced from eco-farm workspaces) */
    farms: "/api/admin/shop/farms",
    /** Gardens (vườn) of the farms, each with the crops grown there — GET ?farmId=&cropId= */
    farmGardens: "/api/admin/shop/farm-gardens",
    /** Crop catalogue (cây trồng) used to mark a product as nông sản */
    crops: "/api/admin/shop/crops",
    reports: {
      /** ?groupBy=agency|product|group|farm&from=YYYY-MM-DD&to=YYYY-MM-DD&category=&source=all|agency|direct */
      revenue: "/api/admin/shop/reports/revenue",
      /** GET — Báo cáo doanh thu theo sản phẩm (BE notice 2026-11-03 mục 14) */
      products: "/api/admin/shop/reports/products",
    },
    farmRegistrations: {
      base: "/api/admin/shop/farm-registrations",
      stats: "/api/admin/shop/farm-registrations/stats",
      /** POST { sku, price, salePrice?, productGroupIds? } — creates the product */
      approve: (id: string) =>
        `/api/admin/shop/farm-registrations/${id}/approve`,
      /** POST { reason } */
      reject: (id: string) => `/api/admin/shop/farm-registrations/${id}/reject`,
    },
    orders: {
      /** GET — Danh sách đơn hàng xử lý (BE notice 2026-11-03) */
      base: "/api/shop/orders",
      /** GET — Số lượng đơn theo trạng thái (status-counts) */
      statusCounts: "/api/shop/orders/status-counts",
      /** GET — Chi tiết đơn hàng */
      detail: (id: string | number) => `/api/shop/orders/${id}`,
      /** PUT { status, reason? } — Cập nhật trạng thái đơn hàng */
      status: (id: string | number) => `/api/shop/orders/${id}/status`,
      /** PUT { dispatchGroupId, assigneeUserId, shippingCarrier, trackingCode, internalNote } — Cập nhật thông tin xử lý / điều phối */
      processing: (id: string | number) => `/api/shop/orders/${id}/processing`,
      /** Fallback / tương thích cũ */
      note: (id: string | number) => `/api/shop/orders/${id}/processing`,
      tracking: (id: string | number) => `/api/shop/orders/${id}/processing`,
      assign: (id: string | number) => `/api/shop/orders/${id}/processing`,
    },
    /** Yêu cầu liên hệ hợp tác (BE notice 2026-10-28 & 2026-11-05) */
    partnerContactRequests: {
      base: "/api/admin/shop/partner-contact-requests",
      statusCounts: "/api/admin/shop/partner-contact-requests/status-counts",
      detail: (id: number | string) =>
        `/api/admin/shop/partner-contact-requests/${id}`,
      status: (id: number | string) =>
        `/api/admin/shop/partner-contact-requests/${id}/status`,
    },
    /** Hồ sơ đối tác & Gian hàng (BE notice 2026-10-28 & 2026-11-03) */
    partnerProfiles: {
      base: "/api/admin/shop/partner-profiles",
      detail: (id: number | string) => `/api/admin/shop/partner-profiles/${id}`,
      partnerType: (id: number | string) =>
        `/api/admin/shop/partner-profiles/${id}/partner-type`,
      suspension: (id: number | string) =>
        `/api/admin/shop/partner-profiles/${id}/suspension`,
      verification: (id: number | string) =>
        `/api/admin/shop/partner-profiles/${id}/verification`,
      sync: (id: number | string) =>
        `/api/admin/shop/partner-profiles/${id}/sync`,
      syncAll: "/api/admin/shop/partner-profiles/sync",
      /** PUT { commissionRate } — Đặt tỷ lệ hoa hồng đại lý/CTV */
      commission: (id: number | string) =>
        `/api/admin/shop/partner-profiles/${id}/commission`,
      /** GET — Thẻ số liệu đơn hàng & doanh thu */
      orderStats: (id: number | string) =>
        `/api/admin/shop/partner-profiles/${id}/order-stats`,
      /** GET — Tổng hợp hoa hồng */
      commissionSummary: (id: number | string) =>
        `/api/admin/shop/partner-profiles/${id}/commission-summary`,
      /** GET / POST — Chi trả hoa hồng & lịch sử chi trả */
      commissionPayouts: (id: number | string) =>
        `/api/admin/shop/partner-profiles/${id}/commission-payouts`,
      /** GET — Báo cáo doanh thu đại lý/CTV */
      report: (id: number | string) =>
        `/api/admin/shop/partner-profiles/${id}/report`,
    },
    users: {
      /** POST — Cấp tài khoản đối tác */
      shopPartners: "/api/admin/users/shop-partners",
      /** PUT — Cập nhật tài khoản / đặt lại mật khẩu */
      update: (id: string | number) => `/api/admin/users/${id}`,
    },
    shops: {
      base: "/api/center/workspaces",
      detail: (id: string | number) => `/api/admin/workspaces/${id}`,
      /** The signed-in shop admin's own shop */
      me: "/api/shop/profile",
    },
    reviews: {
      /** GET ?productId&rating&hidden&replied&keyword&page&size */
      base: "/api/admin/shop/reviews",
      /** GET: whole-catalog figures for the reviews screen (no productId filter) */
      summary: "/api/admin/shop/reviews/summary",
      /** PUT { content } · DELETE */
      reply: (id: number) => `/api/admin/shop/reviews/${id}/reply`,
      /** PUT { hidden, reason? } */
      visibility: (id: number) => `/api/admin/shop/reviews/${id}/visibility`,
    },
    agencies: {
      base: "/api/admin/shop/agencies",
      detail: (id: string) => `/api/admin/shop/agencies/${id}`,
      commissions: (id: string) => `/api/admin/shop/agencies/${id}/commissions`,
      /** POST { orderIds } — marks those payable commissions as paid */
      payout: (id: string) =>
        `/api/admin/shop/agencies/${id}/commissions/payout`,
    },
  },
  shop: {
    profile: {
      base: "/api/shop/profile",
      homeConfig: "/api/shop/profile/home-config",
      homeBanners: "/api/shop/profile/home-banners",
      homeHighlights: "/api/shop/profile/home-highlights",
      homeFaqs: "/api/shop/profile/home-faqs",
      orderStats: "/api/shop/profile/order-stats",
      orders: "/api/shop/profile/orders",
      commissionSummary: "/api/shop/profile/commission-summary",
      commissionPayouts: "/api/shop/profile/commission-payouts",
      report: "/api/shop/profile/report",
      products: "/api/shop/profile/products",
      productOrder: "/api/shop/profile/products/order",
      productVisibility: (productId: number | string) =>
        `/api/shop/profile/products/${productId}/visibility`,
      productDelete: (productId: number | string) =>
        `/api/shop/profile/products/${productId}`,
    },
    catalog: {
      products: "/api/shop/catalog/products",
    },
  },
  storage: {
    storefrontPhotos: "/api/storage/storefront-photos",
  },
  masterData: {
    geo: {
      provinces: "/api/master-data/geo/provinces",
      wards: "/api/master-data/geo/wards",
    },
  },
} as const;
