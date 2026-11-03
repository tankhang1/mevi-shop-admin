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
      base: "/api/admin/shop/product-groups",
      detail: (id: string) => `/api/admin/shop/product-groups/${id}`,
      /** PUT { productIds } — replaces the group's members */
      products: (id: string) => `/api/admin/shop/product-groups/${id}/products`,
    },
    inventory: {
      base: "/api/admin/shop/inventory",
      stats: "/api/admin/shop/inventory/stats",
      movements: "/api/admin/shop/inventory/movements",
      /** GET ?status=pending|approved|rejected|all&farmId=&productId= — nông hộ's supply requests (source=farm), `counts` per status */
      supplyRequests: "/api/admin/shop/inventory/supply-requests",
      /** POST { type, quantity, note } */
      adjust: (productId: string) => `/api/admin/shop/inventory/${productId}/adjust`,
      /** POST — admin approves a pending farm stock change (adds the delta to current stock) */
      approve: (movementId: string) => `/api/admin/shop/inventory/movements/${movementId}/approve`,
      /** POST { reason } */
      reject: (movementId: string) => `/api/admin/shop/inventory/movements/${movementId}/reject`,
      /** PATCH { lowStockThreshold?, variantThresholds? } */
      threshold: (productId: string) => `/api/admin/shop/inventory/${productId}/threshold`,
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
        lowStockThresholds: (id: number) => `/api/admin/shop/products/${id}/low-stock-thresholds`,
        /** POST — nhập hàng (MEVI / FARM) */
        stockReceipts: (id: number) => `/api/admin/shop/products/${id}/stock-receipts`,
        /** POST — điều chỉnh tồn kho */
        stockAdjustments: (id: number) => `/api/admin/shop/products/${id}/stock-adjustments`,
      },
      /** GET — one row per variant */
      inventory: "/api/admin/shop/inventory",
      /** GET — stock counts (quy cách + đơn vị tính) and movement counts */
      inventorySummary: "/api/admin/shop/inventory/summary",
      stockMovements: {
        base: "/api/admin/shop/stock-movements",
        statusCounts: "/api/admin/shop/stock-movements/status-counts",
        /** POST { unitCost? } */
        approve: (id: number) => `/api/admin/shop/stock-movements/${id}/approve`,
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
      base: "/api/admin/shop/staff",
      detail: (id: string) => `/api/admin/shop/staff/${id}`,
      /** POST — sends the invitation again */
      resendInvite: (id: string) => `/api/admin/shop/staff/${id}/resend-invite`,
    },
    dispatchTeams: {
      base: "/api/admin/shop/dispatch-teams",
      detail: (id: string) => `/api/admin/shop/dispatch-teams/${id}`,
      /** POST — routes unassigned open orders to the team owning their product group, members in turn */
      autoAssign: "/api/admin/shop/dispatch-teams/auto-assign",
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
    },
    farmRegistrations: {
      base: "/api/admin/shop/farm-registrations",
      stats: "/api/admin/shop/farm-registrations/stats",
      /** POST { sku, price, salePrice?, productGroupIds? } — creates the product */
      approve: (id: string) => `/api/admin/shop/farm-registrations/${id}/approve`,
      /** POST { reason } */
      reject: (id: string) => `/api/admin/shop/farm-registrations/${id}/reject`,
    },
    orders: {
      base: "/api/admin/shop/orders",
      detail: (id: string) => `/api/admin/shop/orders/${id}`,
      /** PATCH { status, note? } — note is the cancel reason when cancelling */
      status: (id: string) => `/api/admin/shop/orders/${id}/status`,
      /** PATCH { internalNote } */
      note: (id: string) => `/api/admin/shop/orders/${id}/note`,
      /** PATCH { carrier, trackingCode } */
      tracking: (id: string) => `/api/admin/shop/orders/${id}/tracking`,
      /** PATCH { teamId, assigneeId } */
      assign: (id: string) => `/api/admin/shop/orders/${id}/assign`,
    },
    /** Yêu cầu liên hệ hợp tác (BE notice 2026-10-28) */
    partnerContactRequests: {
      base: "/api/admin/shop/partner-contact-requests",
      detail: (id: number | string) => `/api/admin/shop/partner-contact-requests/${id}`,
      status: (id: number | string) => `/api/admin/shop/partner-contact-requests/${id}/status`,
    },
    /** Hồ sơ đối tác & Gian hàng (BE notice 2026-10-28) */
    partnerProfiles: {
      base: "/api/admin/shop/partner-profiles",
      detail: (id: number | string) => `/api/admin/shop/partner-profiles/${id}`,
      partnerType: (id: number | string) => `/api/admin/shop/partner-profiles/${id}/partner-type`,
      suspension: (id: number | string) => `/api/admin/shop/partner-profiles/${id}/suspension`,
      verification: (id: number | string) => `/api/admin/shop/partner-profiles/${id}/verification`,
      sync: (id: number | string) => `/api/admin/shop/partner-profiles/${id}/sync`,
      syncAll: "/api/admin/shop/partner-profiles/sync",
    },
    users: {
      /** POST — Cấp tài khoản đối tác */
      shopPartners: "/api/admin/users/shop-partners",
    },
    shops: {
      base: "/api/admin/shop/shops",
      detail: (id: string) => `/api/admin/shop/shops/${id}`,
      /** The signed-in shop admin's own shop */
      me: "/api/admin/shop/my-shop",
    },
    reviews: {
      base: "/api/admin/shop/reviews",
      stats: "/api/admin/shop/reviews/stats",
      reply: (id: string) => `/api/admin/shop/reviews/${id}/reply`,
      visibility: (id: string) => `/api/admin/shop/reviews/${id}/visibility`,
    },
    agencies: {
      base: "/api/admin/shop/agencies",
      detail: (id: string) => `/api/admin/shop/agencies/${id}`,
      commissions: (id: string) => `/api/admin/shop/agencies/${id}/commissions`,
      /** POST { orderIds } — marks those payable commissions as paid */
      payout: (id: string) => `/api/admin/shop/agencies/${id}/commissions/payout`,
    },
  },
  shop: {
    profile: {
      base: "/api/shop/profile",
      products: "/api/shop/profile/products",
      productOrder: "/api/shop/profile/products/order",
      productVisibility: (productId: number | string) => `/api/shop/profile/products/${productId}/visibility`,
      productDelete: (productId: number | string) => `/api/shop/profile/products/${productId}`,
    },
    catalog: {
      products: "/api/shop/catalog/products",
    },
  },
  storage: {
    storefrontPhotos: "/api/storage/storefront-photos",
  },
} as const;
