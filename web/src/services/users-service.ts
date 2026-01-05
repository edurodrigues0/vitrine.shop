import { api } from "@/lib/api-client";
import type {
  CreateUserRequest,
  UpdateUserRequest,
  User,
} from "@/dtos/user";

export interface FindAllUsersParams {
  page?: number;
  limit?: number;
  name?: string;
  email?: string;
  role?: "ADMIN" | "OWNER" | "EMPLOYEE";
}

export interface UsersResponse {
  users: User[];
  meta: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    perPage: number;
  };
}

export const usersService = {
  create: async (data: CreateUserRequest): Promise<{ id: string }> => {
    const response = await api.post<{ id: string }>("/users", data);
    return response;
  },

  findAll: async (params?: FindAllUsersParams): Promise<UsersResponse> => {
    const response = await api.get<UsersResponse>("/users", params);
    return response;
  },

  findById: async (id: string): Promise<User> => {
    const response = await api.get<User>(`/users/${id}`);
    return response;
  },

  findByEmail: async (email: string): Promise<User> => {
    const response = await api.get<User>("/users/email", { email });
    return response;
  },

  findByStoreId: async (params: {
    storeId: string;
    page?: number;
    limit?: number;
    filters?: {
      email?: string;
      name?: string;
      role?: "ADMIN" | "OWNER" | "EMPLOYEE";
    };
  }): Promise<UsersResponse> => {
    const queryParams: Record<string, string> = {
      page: String(params.page ?? 1),
      limit: String(params.limit ?? 10),
    };

    if (params.filters?.email) {
      queryParams.email = params.filters.email;
    }
    if (params.filters?.name) {
      queryParams.name = params.filters.name;
    }
    if (params.filters?.role) {
      queryParams.role = params.filters.role;
    }

    const response = await api.get<UsersResponse>(
      `/users/store/${params.storeId}`,
      queryParams,
    );
    return response;
  },

  update: async (
    id: string,
    data: UpdateUserRequest,
  ): Promise<User> => {
    const response = await api.put<User>(`/users/${id}`, data);
    return response;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/users/${id}`);
  },
};

