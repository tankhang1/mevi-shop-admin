import { useQuery } from "@tanstack/react-query";
import { geoApi } from "../api/geo.api";

export const GEO_QUERY_KEYS = {
  provinces: ["public-geo-provinces"] as const,
  wards: (provinceCode: string) => ["public-geo-wards", provinceCode] as const,
};

/** Hook lấy danh sách Tỉnh/Thành phố công khai (cache 24h) */
export function useGeoProvinces() {
  return useQuery({
    queryKey: GEO_QUERY_KEYS.provinces,
    queryFn: () => geoApi.getProvinces(),
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
  });
}

/** Hook lấy danh sách Phường/Xã công khai theo Tỉnh/Thành (cache 24h) */
export function useGeoWards(provinceCodeOrName?: string) {
  return useQuery({
    queryKey: GEO_QUERY_KEYS.wards(provinceCodeOrName || ""),
    queryFn: () => geoApi.getWards(provinceCodeOrName || ""),
    enabled: Boolean(provinceCodeOrName && provinceCodeOrName.trim().length > 0),
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
  });
}

