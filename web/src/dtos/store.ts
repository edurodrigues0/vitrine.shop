export interface StoreTheme {
  primaryColor: string;
  secondaryColor: string;
  tertiaryColor: string;
}

export type StoreStatus = "ACTIVE" | "INACTIVE" | "PENDING";

export interface Store {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  cnpjcpf: string;
  instagramUrl: string | null;
  facebookUrl: string | null;
  logoUrl: string | null;
  whatsapp: string;
  bannerUrl: string | null;
  theme: StoreTheme;
  cityId: string;
  ownerId: string;
  status: StoreStatus;
  isPaid: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateStoreRequest {
  name: string;
  description?: string;
  slug: string;
  cnpjcpf: string;
  instagramUrl?: string;
  facebookUrl?: string;
  logoUrl?: string;
  whatsapp: string;
  bannerUrl?: string;
  theme?: StoreTheme;
  cityId: string;
}

export interface UpdateStoreRequest {
  name?: string;
  description?: string;
  slug?: string;
  cnpjcpf?: string;
  instagramUrl?: string;
  facebookUrl?: string;
  logoUrl?: string;
  whatsapp?: string;
  bannerUrl?: string;
  theme?: StoreTheme;
  cityId?: string;
  status?: StoreStatus;
}

export interface FindAllStoresParams {
  page?: number;
  limit?: number;
  name?: string;
  cityId?: string;
  status?: StoreStatus;
}

export interface StoresResponse {
  stores: Store[];
  meta: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    perPage: number;
  };
}

