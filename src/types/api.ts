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

/** Spring page envelope returned by list endpoints */
export interface SpringPage<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface PageParams {
  page?: number;
  size?: number;
  keyword?: string;
}

/** Error body: `fieldErrors` values are reason keys, e.g. `api.message.validation.duplicate` */
export interface ApiErrorResponse {
  message?: string;
  messageKey?: string;
  fieldErrors?: Record<string, string>;
}

export interface UserRef {
  id: number;
  fullName: string | null;
}
