import axios from "axios";

/** Human-readable message from an axios / thrown error */
export function getErrorMessage(error: unknown, fallback = "Đã có lỗi xảy ra") {
  if (axios.isAxiosError(error)) {
    const msg = (error.response?.data as { message?: string } | undefined)?.message;
    return msg || error.message || fallback;
  }
  return error instanceof Error ? error.message : fallback;
}
