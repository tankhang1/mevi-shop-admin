import { API_ENDPOINTS } from "@/config/api-endpoints";
import { db } from "../db";
import type { MockHandler } from "../utils";

export const farmHandlers: MockHandler[] = [
  {
    method: "GET",
    path: API_ENDPOINTS.admin.farms,
    handle: () => ({ data: db.farms }),
  },
  {
    method: "GET",
    path: API_ENDPOINTS.admin.crops,
    handle: () => ({ data: db.crops }),
  },
  {
    method: "GET",
    path: API_ENDPOINTS.admin.farmGardens,
    handle: ({ query }) => {
      let gardens = db.farmGardens;
      if (query.farmId) {
        gardens = gardens.filter((g) => g.farmId === query.farmId);
      }
      if (query.cropId) {
        const cropId = Number(query.cropId);
        gardens = gardens.filter((g) => g.cropIds.includes(cropId));
      }
      return { data: gardens };
    },
  },
];
