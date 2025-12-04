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

  googleLogin: (callbackURL?: string): void => {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333";
    const defaultCallbackURL = typeof window !== "undefined" 
      ? `${window.location.origin}/dashboard`
      : "/dashboard";
    const finalCallbackURL = callbackURL || defaultCallbackURL;
    
    // Redirecionar diretamente para a URL do Better Auth
    const googleAuthUrl = `${apiBaseUrl}/api/auth/sign-in/google?callbackURL=${encodeURIComponent(finalCallbackURL)}`;
    window.location.href = googleAuthUrl;
  },

  logout: async (): Promise<void> => {
    try {
      await api.post("/auth/sign-out");
    } catch (error) {
      // Continuar mesmo se a requisição falhar
      console.error("Erro ao fazer logout no servidor:", error);
    }
    
    if (typeof window !== "undefined") {
      // Limpar token do localStorage
      localStorage.removeItem("authToken");
      
      // Limpar cookies do Better Auth
      document.cookie = "better-auth.session_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      document.cookie = "better-auth.session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
  },

  me: async (): Promise<AuthUserResponse> => {
    const response = await api.get<{ user: AuthUserResponse }>("/auth/me");
    return response.user;
  },

  checkSession: async (): Promise<boolean> => {
    try {
      // Usar o endpoint do Better Auth para verificar sessão
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333";
      const response = await fetch(`${apiBaseUrl}/api/auth/session`, {
        method: "GET",
        credentials: "include", // Importante para enviar cookies
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        return !!data?.user;
      }
      return false;
    } catch (error) {
      return false;
    }
  },

  refreshToken: async (): Promise<{ token: string }> => {
    const response = await api.post<{ token: string }>("/auth/refresh-token");
    return response;
  },
};

