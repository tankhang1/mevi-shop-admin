/** GET /auth/me */
export interface AuthMe {
  userId: string;
  username: string;
  name: string;
  email: string;
  phoneNumber?: string;
  roles?: string[];
  role?: string | string[];
}
