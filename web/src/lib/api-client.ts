type RequestConfig = {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  headers?: Record<string, string>;
  body?: unknown;
  params?: Record<string, string | number | boolean>;
  isFormData?: boolean;
};

class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public data?: unknown,
  ) {
    super(`API Error: ${status} ${statusText}`);
    this.name = "ApiError";
  }
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333/api";

async function apiClient<T>(
  endpoint: string,
  config: RequestConfig = {},
): Promise<T> {
  const { method = "GET", headers = {}, body, params, isFormData = false } = config;

  // Build URL with query params
  const url = new URL(`${API_BASE_URL}${endpoint}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });
  }

  // Better Auth usa cookies para autenticação, então não precisamos enviar token Bearer
  // Mas mantemos a lógica para compatibilidade com sistema antigo se necessário
  const token =
    typeof window !== "undefined" ? localStorage.getItem("authToken") : null;

  const requestHeaders: HeadersInit = {
    ...headers,
  };

  // Only set Content-Type for JSON, not for FormData
  if (!isFormData) {
    requestHeaders["Content-Type"] = "application/json";
  }

  // Verificar se há cookie do Better Auth antes de enviar token Bearer
  // Se houver cookie do Better Auth, não enviar token Bearer (Better Auth tem prioridade)
  const hasBetterAuthCookie = typeof window !== "undefined" && 
    document.cookie.split("; ").some((cookie) => {
      const cookieName = cookie.trim().split("=")[0];
      return (
        cookieName === "better-auth.session_token" ||
        cookieName === "better-auth.session" ||
        cookieName.startsWith("better-auth.session_token") ||
        cookieName.startsWith("better-auth.session")
      );
    });

  // Só enviar token Bearer se não houver cookie do Better Auth (fallback para sistema antigo)
  if (token && !hasBetterAuthCookie) {
    requestHeaders.Authorization = `Bearer ${token}`;
  }

  const requestConfig: RequestInit = {
    method,
    headers: requestHeaders,
    credentials: "include", // Include cookies for cookie-based auth
  };

  if (body && method !== "GET") {
    if (isFormData) {
      requestConfig.body = body as FormData;
    } else {
      requestConfig.body = JSON.stringify(body);
    }
  }

  try {
    // Log da requisição (apenas para endpoints de endereços)
    if (url.toString().includes("/addresses")) {
      console.log("🌐 API Client: Enviando requisição para:", {
        method,
        url: url.toString(),
        body: body ? JSON.parse(JSON.stringify(body)) : null,
      });
    }

    const response = await fetch(url.toString(), requestConfig);

    // Handle non-JSON responses
    const contentType = response.headers.get("content-type");
    const isJson = contentType?.includes("application/json");

    let data: unknown;
    if (isJson) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      // Log de erro (apenas para endpoints de endereços)
      if (url.toString().includes("/addresses")) {
        console.error("❌ API Client: Erro na resposta:", {
          status: response.status,
          statusText: response.statusText,
          data,
        });
      }

      const error = new ApiError(response.status, response.statusText, data);
      // Adicionar data ao erro para facilitar tratamento no frontend
      (error as any).data = data;
      // Adicionar status ao erro para facilitar verificação
      (error as any).status = response.status;
      (error as any).response = { status: response.status, data };
      throw error;
    }

    // Log de sucesso (apenas para endpoints de endereços)
    if (url.toString().includes("/addresses")) {
      console.log("✅ API Client: Requisição bem-sucedida:", {
        status: response.status,
        data: isJson ? data : "[Não-JSON]",
      });
    }

    return data as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    // Network or other errors
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new Error(
        `Erro de conexão com a API. Verifique se o servidor está rodando em ${API_BASE_URL}`,
      );
    }

    throw new Error(
      error instanceof Error ? error.message : "An unknown error occurred",
    );
  }
}

export const api = {
  get: <T>(endpoint: string, params?: RequestConfig["params"]) =>
    apiClient<T>(endpoint, { method: "GET", params }),

  post: <T>(
    endpoint: string,
    body?: unknown,
    params?: RequestConfig["params"],
    isFormData?: boolean,
  ) =>
    apiClient<T>(endpoint, { method: "POST", body, params, isFormData }),

  put: <T>(
    endpoint: string,
    body?: unknown,
    params?: RequestConfig["params"],
    isFormData?: boolean,
  ) =>
    apiClient<T>(endpoint, { method: "PUT", body, params, isFormData }),

  patch: <T>(
    endpoint: string,
    body?: unknown,
    params?: RequestConfig["params"],
    isFormData?: boolean,
  ) =>
    apiClient<T>(endpoint, { method: "PATCH", body, params, isFormData }),

  delete: <T>(endpoint: string, params?: RequestConfig["params"]) =>
    apiClient<T>(endpoint, { method: "DELETE", params }),
};

export { ApiError };
export type { RequestConfig };

