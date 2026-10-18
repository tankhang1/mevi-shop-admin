export interface Agency {
  id: string;
  name: string;
  slug: string;
  brandColor?: string;
  logoUrl?: string;
  contactName?: string;
  phone?: string;
  email?: string;
  active: boolean;
  createdAt: string;
}

export type AgencyInput = Omit<Agency, "id" | "active" | "createdAt">;
