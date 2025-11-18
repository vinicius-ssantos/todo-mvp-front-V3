import { ApiError } from "./errors";

type HttpOptions = RequestInit & {
  json?: unknown;
  timeoutMs?: number;
};

/**
 * Unified HTTP client with timeout, error mapping, and type safety
 * All requests go through the local proxy at /api/...
 */
export async function http(input: string, options: HttpOptions = {}) {
  const { json, timeoutMs = 15000, headers, ...init } = options;

  // Create abort controller for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(input, {
      ...init,
      headers: {
        Accept: "application/json",
        ...(json ? { "Content-Type": "application/json" } : {}),
        ...(headers || {}),
      },
      body: json ? JSON.stringify(json) : init.body,
      signal: controller.signal,
      cache: "no-store",
      credentials: "include", // Important for cookies
    });

    clearTimeout(timeoutId);

    // Handle non-OK responses
    if (!response.ok) {
      let payload: any = null;
      try {
        const contentType = response.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
          payload = await response.json();
        }
      } catch {
        // Ignore JSON parse errors
      }

      const message = payload?.message || payload?.error || `Erro ${response.status}`;
      const error = new ApiError(message, response.status, {
        code: payload?.code,
        hint: payload?.hint,
        action: payload?.action,
      });

      // Intercept 401 responses and redirect to login
      if (error.isUnauthorized() && typeof window !== "undefined") {
        const currentPath = window.location.pathname;
        // Only redirect if not already on login page
        if (currentPath !== "/login") {
          window.location.href = `/login?next=${encodeURIComponent(currentPath)}`;
        }
      }

      throw error;
    }

    // Parse response
    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      return response.json();
    }

    return response.text();
  } catch (error: any) {
    clearTimeout(timeoutId);

    // Handle abort/timeout
    if (error?.name === "AbortError") {
      throw new ApiError("Tempo de requisição excedido", 408, {
        hint: "A requisição demorou muito. Verifique sua conexão.",
      });
    }

    // Handle network errors
    if (error instanceof TypeError) {
      throw new ApiError("Falha de rede", 0, {
        hint: "Não foi possível conectar ao servidor. Verifique sua conexão.",
      });
    }

    // Re-throw ApiError
    if (error instanceof ApiError) {
      throw error;
    }

    // Unknown error
    throw new ApiError("Erro desconhecido", 500, {
      hint: error?.message || "Ocorreu um erro inesperado.",
    });
  }
}
