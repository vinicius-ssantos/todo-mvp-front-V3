/**
 * Custom API Error class with enhanced error information
 */
export class ApiError extends Error {
  status: number;
  code?: string;
  hint?: string;
  action?: string;

  constructor(message: string, status = 500, extra?: Partial<ApiError>) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    Object.assign(this, extra);
  }

  /**
   * Check if error is a client error (4xx)
   */
  isClientError(): boolean {
    return this.status >= 400 && this.status < 500;
  }

  /**
   * Check if error is a server error (5xx)
   */
  isServerError(): boolean {
    return this.status >= 500;
  }

  /**
   * Check if error is unauthorized
   */
  isUnauthorized(): boolean {
    return this.status === 401;
  }

  /**
   * Get user-friendly error message
   */
  getUserMessage(): string {
    if (this.hint) return this.hint;
    if (this.isUnauthorized()) return "Sua sessão expirou. Por favor, faça login novamente.";
    if (this.isClientError()) return this.message || "Erro na requisição.";
    if (this.isServerError()) return "Erro no servidor. Tente novamente mais tarde.";
    return "Erro desconhecido. Tente novamente.";
  }
}
