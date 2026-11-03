import { z } from "zod";

/**
 * Biểu thức chính quy kiểm tra số điện thoại di động Việt Nam.
 * Hỗ trợ các định dạng:
 * - Bắt đầu bằng 0: 03x, 05x, 07x, 08x, 09x (10 chữ số)
 * - Bắt đầu bằng mã quốc gia: 843x, +843x...
 */
export const VN_PHONE_REGEX = /^(0|\+?84)[35789]\d{8}$/;

/**
 * Biểu thức chính quy kiểm tra số điện thoại 10 chữ số nội địa bắt đầu bằng 0.
 */
export const VN_DOMESTIC_PHONE_REGEX = /^0[35789]\d{8}$/;

/**
 * Thông báo lỗi chuẩn cho số điện thoại di động Việt Nam.
 */
export const VN_PHONE_ERROR_MESSAGE =
  "Số điện thoại di động Việt Nam không hợp lệ (VD: 0912345678 hoặc 0343954858)";

/**
 * Zod schema tái sử dụng để validate số điện thoại di động Việt Nam.
 */
export const vnPhoneSchema = (message = VN_PHONE_ERROR_MESSAGE) =>
  z.string().trim().regex(VN_PHONE_REGEX, message);
