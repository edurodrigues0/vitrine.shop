import { api } from "@/lib/api-client";
import type {
  AuthUserResponse,
  LoginRequest,
  LoginResponse,
} from "@/dtos/user";

export const authService = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    // Better Auth usa /api/auth/sign-in/email e retorna { token, user } ou { user }
    // Normalizar apiBaseUrl removendo /api se existir no final
    let apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333";
    apiBaseUrl = apiBaseUrl.replace(/\/api\/?$/, ""); // Remove /api ou /api/ do final
    const response = await fetch(`${apiBaseUrl}/auth/sign-in/email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Importante para receber cookies do Better Auth
      body: JSON.stringify({
        ...data,
        rememberMe: true, // Mantém a sessão ativa após fechar o navegador
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
    
    // Better Auth retorna { redirect, token, user }
    // O user do better-auth não inclui role e storeId, então precisamos buscar do endpoint /auth/me
    // Mas primeiro retornamos o que temos para atualizar o estado rapidamente
    return {
      token: result.token || "", // Token pode ser null se usar apenas cookies
      user: result.user,
      redirect: result.redirect || false,
    };
  },
  googleLogin: (callbackURL?: string): void => {
    let apiBaseUrl =
      process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333";
  
    // remove /api caso exista
    apiBaseUrl = apiBaseUrl.replace(/\/api\/?$/, "");
  
    const params = new URLSearchParams();
  
    if (callbackURL) {
      params.set("callbackURL", callbackURL);
    }
  
    // OAuth exige navegação real
    window.location.href = `${apiBaseUrl}/auth/sign-in/google${
      params.toString() ? `?${params.toString()}` : ""
    }`;
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

