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

