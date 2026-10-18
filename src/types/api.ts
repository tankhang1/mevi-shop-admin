/** Envelope every endpoint responds with */
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface Paginated<T> {
  items: T[];
  page: number;
  size: number;
  total: number;
}

export interface ListParams {
  page?: number;
  size?: number;
  keyword?: string;
}
