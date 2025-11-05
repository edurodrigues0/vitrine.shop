import { api } from "@/lib/api-client";
import type {
  AuthUserResponse,
  LoginRequest,
  LoginResponse,
} from "@/dtos/user";

export const authService = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>("/auth/login", data);
    return response;
  },

  logout: async (): Promise<void> => {
    await api.post("/auth/logout");
    if (typeof window !== "undefined") {
      localStorage.removeItem("authToken");
    }
  },

  me: async (): Promise<AuthUserResponse> => {
    const response = await api.get<{ user: AuthUserResponse }>("/auth/me");
    return response.user;
  },

  refreshToken: async (): Promise<{ token: string }> => {
    const response = await api.post<{ token: string }>("/auth/refresh-token");
    return response;
  },
};

