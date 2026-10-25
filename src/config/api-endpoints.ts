/** Centralized API endpoints — real backend and src/mocks share these paths */
export const API_ENDPOINTS = {
  auth: {
    me: "/auth/me",
    login: (provider: string) => `/auth/login/${encodeURIComponent(provider)}`,
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
      /** POST { type, quantity, note } */
      adjust: (productId: string) => `/api/admin/shop/inventory/${productId}/adjust`,
      /** PATCH { lowStockThreshold } */
      threshold: (productId: string) => `/api/admin/shop/inventory/${productId}/threshold`,
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
      /** POST — assigns open, unassigned orders to the team whose area matches the address */
      autoAssign: "/api/admin/shop/dispatch-teams/auto-assign",
    },
    /** Farmer households / cooperatives supplying products (synced from eco-farm workspaces) */
    farms: "/api/admin/shop/farms",
    reports: {
      /** ?groupBy=agency|product|group|farm&from=YYYY-MM-DD&to=YYYY-MM-DD&category=&source=all|agency|direct */
      revenue: "/api/admin/shop/reports/revenue",
    },
    orders: {
      base: "/api/admin/shop/orders",
      detail: (id: string) => `/api/admin/shop/orders/${id}`,
      /** PATCH { status, note? } — note is the cancel reason when cancelling */
      status: (id: string) => `/api/admin/shop/orders/${id}/status`,
      /** PATCH { internalNote } */
      note: (id: string) => `/api/admin/shop/orders/${id}/note`,
      /** PATCH { teamId, assigneeId } */
      assign: (id: string) => `/api/admin/shop/orders/${id}/assign`,
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
} as const;
