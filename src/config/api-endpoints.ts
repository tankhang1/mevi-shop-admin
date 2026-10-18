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
      detail: (id: string) => `/api/admin/shop/products/${id}`,
      moderate: (id: string) => `/api/admin/shop/products/${id}/moderate`,
    },
    orders: {
      base: "/api/admin/shop/orders",
      status: (id: string) => `/api/admin/shop/orders/${id}/status`,
    },
    agencies: {
      base: "/api/admin/shop/agencies",
      detail: (id: string) => `/api/admin/shop/agencies/${id}`,
    },
  },
} as const;
