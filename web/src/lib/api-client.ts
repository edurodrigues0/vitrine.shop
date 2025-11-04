type RequestConfig = {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  headers?: Record<string, string>;
  body?: unknown;
  params?: Record<string, string | number | boolean>;
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
  const { method = "GET", headers = {}, body, params } = config;

  // Build URL with query params
  const url = new URL(`${API_BASE_URL}${endpoint}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });
  }

  // Get auth token from localStorage
  const token =
    typeof window !== "undefined" ? localStorage.getItem("authToken") : null;

  const requestHeaders: HeadersInit = {
    "Content-Type": "application/json",
    ...headers,
  };

  if (token) {
    requestHeaders.Authorization = `Bearer ${token}`;
  }

  const requestConfig: RequestInit = {
    method,
    headers: requestHeaders,
    credentials: "include", // Include cookies for cookie-based auth
  };

  if (body && method !== "GET") {
    requestConfig.body = JSON.stringify(body);
  }

  try {
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
      throw new ApiError(response.status, response.statusText, data);
    }

    return data as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    // Network or other errors
    throw new Error(
      error instanceof Error ? error.message : "An unknown error occurred",
    );
  }
}

export const api = {
  get: <T>(endpoint: string, params?: RequestConfig["params"]) =>
    apiClient<T>(endpoint, { method: "GET", params }),

  post: <T>(endpoint: string, body?: unknown, params?: RequestConfig["params"]) =>
    apiClient<T>(endpoint, { method: "POST", body, params }),

  put: <T>(endpoint: string, body?: unknown, params?: RequestConfig["params"]) =>
    apiClient<T>(endpoint, { method: "PUT", body, params }),

  patch: <T>(endpoint: string, body?: unknown, params?: RequestConfig["params"]) =>
    apiClient<T>(endpoint, { method: "PATCH", body, params }),

  delete: <T>(endpoint: string, params?: RequestConfig["params"]) =>
    apiClient<T>(endpoint, { method: "DELETE", params }),
};

export { ApiError };
export type { RequestConfig };

