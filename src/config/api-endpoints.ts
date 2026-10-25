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
    orders: {
      base: "/api/admin/shop/orders",
      status: (id: string) => `/api/admin/shop/orders/${id}/status`,
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
    },
  },
} as const;
