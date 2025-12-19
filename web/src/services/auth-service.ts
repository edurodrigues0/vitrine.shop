import { api } from "@/lib/api-client";
import type {
  AuthUserResponse,
  LoginRequest,
  LoginResponse,
} from "@/dtos/user";
import { authClient } from "@/lib/auth-client";

export const authService = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    let apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333";// Remove /api ou /api/ do final
    const response = await fetch(`${apiBaseUrl}/auth/sign-in/email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Importante para receber cookies do Better Auth
      body: JSON.stringify({
        ...data,
        rememberMe: true,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error = new Error(
        errorData?.message || errorData?.error || "Erro ao fazer login"
      );
      (error as any).status = response.status;
      (error as any).response = { status: response.status, data: errorData };
      throw error;
    }

    const result = await response.json();
    
    return {
      token: result.token || "",
      user: result.user,
      redirect: result.redirect || false,
    };
  },
  googleLogin: async (callbackURL?: string): Promise<void> => {
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: callbackURL,
      })
    } catch (error) {
      console.error("Erro ao fazer login com Google:", error);
    }
  },
  logout: async (): Promise<void> => {
    try {
      // Usar o endpoint do Better Auth para logout
      // Normalizar apiBaseUrl removendo /api se existir no final
      let apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333";
      apiBaseUrl = apiBaseUrl.replace(/\/api\/?$/, ""); // Remove /api ou /api/ do final
      await fetch(`${apiBaseUrl}/api/auth/sign-out`, {
        method: "POST",
        credentials: "include", // Importante para enviar cookies
        headers: {
          "Content-Type": "application/json",
        },
      });
    } catch (error) {
      // Continuar mesmo se a requisição falhar
      console.error("Erro ao fazer logout no servidor:", error);
    }
    
    if (typeof window !== "undefined") {
      // Limpar cookies do Better Auth (Better Auth usa cookies, não localStorage)
      document.cookie = "better-auth.session_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      document.cookie = "better-auth.session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
  },
  me: async (): Promise<AuthUserResponse> => {
    const response = await api.get<{ user: AuthUserResponse }>("/me");
    return response.user;
  },
  checkSession: async (): Promise<boolean> => {
    try {
      // Usar o endpoint do Better Auth para verificar sessão
      // Normalizar apiBaseUrl removendo /api se existir no final
      let apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333";
      apiBaseUrl = apiBaseUrl.replace(/\/api\/?$/, ""); // Remove /api ou /api/ do final
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

