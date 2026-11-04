import { API_ENDPOINTS } from "@/config/api-endpoints";
import { realApiClient } from "@/lib/axios";
import type { GeoProvince, GeoWard } from "../types";

export interface PageResponseGeoProvinceResponse {
  content?: GeoProvince[];
  totalElements?: number;
  totalPages?: number;
  page?: number;
  size?: number;
}

export interface PageResponseGeoWardResponse {
  content?: GeoWard[];
  totalElements?: number;
  totalPages?: number;
  page?: number;
  size?: number;
}

export const geoApi = {
  /**
   * Lấy danh sách Tỉnh / Thành phố từ API Public của hệ thống MEVI
   * Spec: GET /api/master-data/geo/provinces (api.json - Public Master Data Geography)
   */
  getProvinces: async (): Promise<GeoProvince[]> => {
    const res = await realApiClient.get<
      PageResponseGeoProvinceResponse | GeoProvince[]
    >(API_ENDPOINTS.masterData.geo.provinces, {
      params: {
        page: 0,
        size: 100,
        status: "active",
      },
    });

    const data = res.data;
    if (Array.isArray(data)) {
      return data;
    }
    if (
      data &&
      typeof data === "object" &&
      "content" in data &&
      Array.isArray(data.content)
    ) {
      return data.content;
    }
    return [];
  },

  /**
   * Lấy danh sách Phường / Xã từ API Public của hệ thống MEVI theo mã tỉnh
   * Spec: GET /api/master-data/geo/wards?provinceCode={code} (api.json - Public Master Data Geography)
   */
  getWards: async (provinceCode: string): Promise<GeoWard[]> => {
    if (!provinceCode || !provinceCode.trim()) return [];

    const res = await realApiClient.get<
      PageResponseGeoWardResponse | GeoWard[]
    >(API_ENDPOINTS.masterData.geo.wards, {
      params: {
        provinceCode: provinceCode.trim(),
        page: 0,
        size: 100,
        status: "active",
      },
    });

    const data = res.data;
    if (Array.isArray(data)) {
      return data;
    }
    if (
      data &&
      typeof data === "object" &&
      "content" in data &&
      Array.isArray(data.content)
    ) {
      return data.content;
    }
    return [];
  },
};
